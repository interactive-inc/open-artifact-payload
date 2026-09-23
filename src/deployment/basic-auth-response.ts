import { createHash, timingSafeEqual } from "node:crypto"

type Props = {
  enabled: boolean
  username: string | null
  password: string | null
}

/** 認証設定が欠けた環境も閉じる。Request/ResponseとNode標準APIだけを使う。 */
export function basicAuthResponse(request: Request, props: Props): Response | null {
  if (!props.enabled) return null

  const headers = {
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
    "Strict-Transport-Security": "max-age=31536000",
  }

  if (!props.username || !props.password || props.username.includes(":"))
    return new Response("Development access is not configured.", { status: 503, headers })

  const encoded = request.headers
    .get("authorization")
    ?.match(/^Basic[ \t]+([A-Za-z0-9+/]+={0,2})$/i)?.[1]
  const supplied = createHash("sha256")
    .update(Buffer.from(encoded ?? "", "base64"))
    .digest()
  const expected = createHash("sha256").update(`${props.username}:${props.password}`).digest()

  if (encoded && timingSafeEqual(supplied, expected)) return null

  return new Response("Authentication required.", {
    status: 401,
    headers: {
      ...headers,
      "WWW-Authenticate": 'Basic realm="Inta Corporate Development", charset="UTF-8"',
    },
  })
}
