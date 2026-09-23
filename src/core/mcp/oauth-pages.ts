import type { OAuthHelpers } from "@cloudflare/workers-oauth-provider"
import type { Payload } from "payload"

import { isUserAccountSession } from "@/core/lib/access/is-user-account"
import { createOAuthCsrf, verifyOAuthCsrf, clearOAuthCsrf } from "./oauth-csrf"
import { mcpOAuthScopes, type McpOAuthIdentity } from "./oauth-identity"

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ??
      character,
  )

function page(title: string, body: string, cookie?: string, status = 200, callbackOrigin = "") {
  return new Response(
    `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)} | Inta CMS</title><style>body{font:16px/1.7 system-ui,sans-serif;background:#f5f5f5;color:#222;margin:0}main{max-width:640px;margin:8vh auto;padding:32px;background:white;border:1px solid #ddd;border-radius:12px}h1{font-size:24px}code{overflow-wrap:anywhere}button{font:inherit;padding:10px 20px;margin:16px 8px 0 0;cursor:pointer}label{display:block;margin:16px 0}input{margin-right:8px}section{border-top:1px solid #ddd;padding:16px 0}.muted{color:#555;font-size:14px}a{color:#235ca3}</style><main><p class="muted">Inta CMS · AI接続</p><h1>${escapeHtml(title)}</h1>${body}</main></html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store",
        "Content-Security-Policy": `default-src 'none'; style-src 'unsafe-inline'; form-action 'self' ${callbackOrigin}; frame-ancestors 'none'; base-uri 'none'`,
        // no-referrerはブラウザの同一originフォームPOSTもOrigin:nullにする。
        "Referrer-Policy": "same-origin",
        "X-Content-Type-Options": "nosniff",
        ...(cookie ? { "Set-Cookie": cookie } : {}),
      },
    },
  )
}

const redirect = (location: string, cookie?: string) =>
  new Response(null, {
    status: 303,
    headers: {
      Location: location,
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      ...(cookie ? { "Set-Cookie": cookie } : {}),
    },
  })

/** 通常のCMSログインを使い、APIキーやOAuth bearerを同意の認証に流用しない。 */
export async function handleOAuthPage(
  request: Request,
  payload: Payload,
  oauth: OAuthHelpers | undefined,
): Promise<Response> {
  if (!oauth)
    return page(
      "AI接続は未設定です",
      "<p>OAuthを有効にしたCloudflare Worker環境で接続してください。</p>",
      undefined,
      503,
    )
  const url = new URL(request.url)
  const pathname = url.pathname.replace(/\/$/, "")
  const { user } = await payload.auth({
    headers: new Headers({ cookie: request.headers.get("cookie") ?? "" }),
  })
  if (!isUserAccountSession(user)) {
    return redirect(`/admin/login/?redirect=${encodeURIComponent(url.pathname + url.search)}`)
  }
  const userId = String(user.id)
  let form: FormData | undefined
  if (request.method === "POST") {
    form = await request.formData()
    if (!verifyOAuthCsrf(request, form.get("csrf"), userId, payload.secret)) {
      return page(
        "許可を確認できませんでした",
        "<p>この画面を開き直して、もう一度操作してください。</p>",
        undefined,
        403,
      )
    }
  }
  const csrf = createOAuthCsrf(request.url, userId, payload.secret)
  const csrfInput = `<input type="hidden" name="csrf" value="${csrf.nonce}">`
  if (pathname === "/oauth/connections") {
    if (form) {
      const grantId = form.get("grantId")
      if (typeof grantId !== "string" || !grantId) return page("接続が不正です", "", undefined, 400)
      await oauth.revokeGrant(grantId, userId)
      return redirect(url.pathname, clearOAuthCsrf(request.url))
    }
    const grants = await oauth.listUserGrants(userId, {
      limit: 100,
      cursor: url.searchParams.get("cursor") ?? undefined,
    })
    const entries = grants.items
      .map((grant) => {
        const metadata: unknown = grant.metadata
        const label =
          metadata &&
          typeof metadata === "object" &&
          "clientName" in metadata &&
          typeof metadata.clientName === "string"
            ? metadata.clientName
            : grant.clientId
        return `<section><strong>${escapeHtml(label)}</strong><p class="muted">${escapeHtml(grant.clientId)}</p><p>${grant.scope.includes("mcp:write") ? "閲覧・登録・更新" : "閲覧のみ"}</p><form method="post">${csrfInput}<input type="hidden" name="grantId" value="${escapeHtml(grant.id)}"><button>接続を解除</button></form></section>`
      })
      .join("")
    return page(
      "AI接続の管理",
      `<p>${escapeHtml(user.email)} として許可した接続です。</p><p>ChatGPT・Claude・Codexの接続先URL：<br><code>${escapeHtml(url.origin)}/mcp</code></p><p class="muted">新しい接続は、各アプリからこのURLを登録し、CMSでログインして許可してください。解除の反映には最大1分程度かかる場合があります。</p>${entries || "<p>許可した接続はありません。</p>"}${grants.cursor ? `<a href="?cursor=${encodeURIComponent(grants.cursor)}">次の接続</a>` : ""}<p><a href="/admin/">管理画面に戻る</a></p>`,
      csrf.cookie,
    )
  }
  if (pathname !== "/oauth/authorize") return new Response(null, { status: 404 })

  // queryはPOST時にも再検証する。フォーム値でclientやredirect先を上書きさせない。
  try {
    const authorization = await oauth.parseAuthRequest(request)
    if (!authorization.codeChallenge || authorization.codeChallengeMethod !== "S256") {
      return page(
        "接続方式を確認してください",
        "<p>この接続にはPKCE S256が必要です。</p>",
        undefined,
        400,
      )
    }
    const requestedScopes = authorization.scope.length ? authorization.scope : [...mcpOAuthScopes]
    if (requestedScopes.some((scope) => ![...mcpOAuthScopes, "offline_access"].includes(scope))) {
      return page("未対応の権限です", "<p>接続元の権限設定を確認してください。</p>", undefined, 400)
    }
    if (!requestedScopes.includes("mcp:read")) {
      return page(
        "閲覧権限が必要です",
        "<p>mcp:read を指定して接続し直してください。</p>",
        undefined,
        400,
      )
    }
    const client = await oauth.lookupClient(authorization.clientId)
    if (!client) return page("接続元が見つかりません", "", undefined, 400)
    if (form?.get("decision") === "deny") {
      const denied = new URL(authorization.redirectUri)
      denied.searchParams.set("error", "access_denied")
      if (authorization.state) denied.searchParams.set("state", authorization.state)
      if (authorization.issuer) denied.searchParams.set("iss", authorization.issuer)
      return redirect(denied.href, clearOAuthCsrf(request.url))
    }
    if (form?.get("decision") === "allow") {
      const scope = ["mcp:read"]
      if (requestedScopes.includes("mcp:write") && form.get("write") === "yes")
        scope.push("mcp:write")
      if (requestedScopes.includes("offline_access")) scope.push("offline_access")
      const identity: McpOAuthIdentity = { kind: "intacms-oauth", userId, scopes: scope }
      const result = await oauth.completeAuthorization({
        request: authorization,
        userId,
        scope,
        props: identity,
        metadata: { clientName: client.clientName || client.clientId },
      })
      return redirect(result.redirectTo, clearOAuthCsrf(request.url))
    }
    if (form) return page("操作が不正です", "", undefined, 400)
    return page(
      "AIからの接続を許可",
      `<p><strong>${escapeHtml(client.clientName || client.clientId)}</strong> がサイトのコンテンツにアクセスしようとしています。</p><p>ログイン中：${escapeHtml(user.email)}<br>接続先：<code>${escapeHtml(url.origin)}</code></p><p class="muted">接続元ID：${escapeHtml(client.clientId)}<br>戻り先：${escapeHtml(new URL(authorization.redirectUri).origin)}</p><p>ニュース・制作実績・ページ内容などの閲覧を許可します。下書きも対象です。</p><form method="post">${csrfInput}${requestedScopes.includes("mcp:write") ? '<label><input type="checkbox" name="write" value="yes">登録・更新・公開状態の変更も許可する</label>' : ""}<p class="muted">CMSアカウントの権限を超える操作はできません。削除・ユーザー管理・問い合わせ情報は対象外です。接続は「AI接続の管理」で解除できます。</p><button name="decision" value="allow">接続を許可</button><button name="decision" value="deny">キャンセル</button></form>`,
      csrf.cookie,
      200,
      new URL(authorization.redirectUri).origin,
    )
  } catch {
    // 未検証のredirect_uriへは遷移しない。認証コードや内部例外も画面・ログに出さない。
    return page(
      "接続要求を確認できませんでした",
      "<p>接続元のアプリから設定をやり直してください。</p>",
      undefined,
      400,
    )
  }
}
