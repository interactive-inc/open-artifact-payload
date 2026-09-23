import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"

function cookieName(url: string) {
  return new URL(url).protocol === "https:" ? "__Host-intacms-oauth" : "intacms-oauth-local"
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url")
}

export function createOAuthCsrf(url: string, userId: string, secret: string) {
  const nonce = randomBytes(32).toString("base64url")
  const body = Buffer.from(
    JSON.stringify({ url, userId, nonce, expires: Date.now() + 600_000 }),
  ).toString("base64url")
  const secure = new URL(url).protocol === "https:" ? "; Secure" : ""
  return {
    nonce,
    cookie: `${cookieName(url)}=${body}.${sign(body, secret)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${secure}`,
  }
}

export function verifyOAuthCsrf(
  request: Request,
  nonce: FormDataEntryValue | null,
  userId: string,
  secret: string,
): boolean {
  if (request.headers.get("origin") !== new URL(request.url).origin || typeof nonce !== "string")
    return false
  const prefix = `${cookieName(request.url)}=`
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length)
  if (!cookie) return false
  const [body, signature] = cookie.split(".")
  if (!body || !signature) return false
  const expected = Buffer.from(sign(body, secret))
  const actual = Buffer.from(signature)
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false
  try {
    const value: unknown = JSON.parse(Buffer.from(body, "base64url").toString("utf8"))
    return Boolean(
      value &&
      typeof value === "object" &&
      "url" in value &&
      value.url === request.url &&
      "userId" in value &&
      value.userId === userId &&
      "nonce" in value &&
      value.nonce === nonce &&
      "expires" in value &&
      typeof value.expires === "number" &&
      value.expires > Date.now(),
    )
  } catch {
    return false
  }
}

export function clearOAuthCsrf(url: string) {
  return `${cookieName(url)}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${new URL(url).protocol === "https:" ? "; Secure" : ""}`
}
