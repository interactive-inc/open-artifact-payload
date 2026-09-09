export async function createContactRateLimitKey(email: string): Promise<string> {
  const siteScope = process.env.NEXT_PUBLIC_SERVER_URL ?? "open-artifact-payload"
  const source = new TextEncoder().encode(`${siteScope}\0${email.toLowerCase()}`)
  const digest = await crypto.subtle.digest("SHA-256", source)
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  )
  return `contact:${hex}`
}
