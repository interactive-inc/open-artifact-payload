import type { FetchPort } from "@open-artifact/site-management"

type Props = {
  endpoint: string
  basicAuthorization: string | null
  fetchPort: FetchPort
}

/** Custom credential headers must never follow a redirect to another destination. */
export function createCliFetchPort(props: Props): FetchPort {
  if (props.basicAuthorization === null) return props.fetchPort

  const basicAuthorization = props.basicAuthorization
  const apiURL = new URL(`${props.endpoint}/api/`)

  return async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : String(input))
    if (url.origin !== apiURL.origin || !url.pathname.startsWith(apiURL.pathname)) {
      return Response.json(
        { errors: [{ message: "Basic authentication target does not match the configured API" }] },
        { status: 400 },
      )
    }

    const headers = new Headers(
      init.headers ?? (input instanceof Request ? input.headers : undefined),
    )
    const cmsAuthorization = headers.get("authorization")
    headers.delete("x-intacms-authorization")
    if (cmsAuthorization) headers.set("x-intacms-authorization", cmsAuthorization)
    headers.set("authorization", basicAuthorization)

    // This site's Next.js API uses trailing slashes. Send the canonical URL without redirecting secrets.
    if (!url.pathname.endsWith("/")) url.pathname += "/"

    const response = await props.fetchPort(
      input instanceof Request ? new Request(url, input) : url,
      {
        ...init,
        headers,
        redirect: "error",
      },
    )
    if (response.status === 401 && response.headers.get("www-authenticate")?.startsWith("Basic")) {
      await response.body?.cancel()
      return Response.json(
        {
          errors: [
            {
              message:
                "Development Basic authentication failed. Check this environment's INTACMS_*_BASIC_AUTH_USERNAME and PASSWORD.",
            },
          ],
        },
        { status: 401, headers: { "WWW-Authenticate": "Basic" } },
      )
    }

    return response
  }
}
