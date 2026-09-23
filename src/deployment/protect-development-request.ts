import { basicAuthResponse } from "@/deployment/basic-auth-response"

type Props = {
  enabled: boolean
  bypassBasicAuth?: boolean
  username: string | null
  password: string | null
  serve: (request: Request) => Promise<Response>
}

/** Basic認証の通過後だけAPIのCMS認証を復元し、認証済み応答を共有キャッシュに残さない。 */
export async function protectDevelopmentRequest(request: Request, props: Props): Promise<Response> {
  const url = new URL(request.url)

  if (props.enabled && url.protocol === "http:") {
    url.protocol = "https:"
    return new Response(null, {
      status: 308,
      headers: { Location: url.href, "Cache-Control": "private, no-store" },
    })
  }

  const denied = basicAuthResponse(request, {
    ...props,
    enabled: props.enabled && !props.bypassBasicAuth,
  })

  if (denied) return denied

  const authenticated = new Request(request)
  const cmsAuthorization = authenticated.headers.get("x-intacms-authorization")
  authenticated.headers.delete("x-intacms-authorization")

  if (!props.enabled) return props.serve(authenticated)

  if (!props.bypassBasicAuth) authenticated.headers.delete("authorization")
  if (!props.bypassBasicAuth && url.pathname.startsWith("/api/") && cmsAuthorization) {
    authenticated.headers.set("authorization", cmsAuthorization)
  }

  const response = await props.serve(authenticated)
  const protectedResponse = new Response(response.body, response)
  protectedResponse.headers.set("Cache-Control", "private, no-store")
  protectedResponse.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive")
  protectedResponse.headers.set("Strict-Transport-Security", "max-age=31536000")

  return protectedResponse
}
