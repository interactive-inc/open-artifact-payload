import { NextResponse, type NextRequest } from "next/server"

import { isLocale } from "@/project/shared/lib/is-locale"
import { defaultLocale } from "@/project/shared/lib/locale-types"

export const config = {
  // 管理画面 / API / Payload 内部ルート / 静的アセットは locale rewrite の対象外にする。
  matcher: ["/((?!admin|api|next|_next|favicon.ico|og-default.png|sitemap.xml|robots.txt).*)"],
}

// x-locale ヘッダーは、Next.js の仕様で params を受け取れない not-found.tsx が
// locale を復元するために付与する。
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const segment = pathname.split("/")[1] ?? ""
  const requestHeaders = new Headers(request.headers)

  if (isLocale(segment)) {
    requestHeaders.set("x-locale", segment)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  requestHeaders.set("x-locale", defaultLocale)

  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname}`

  return NextResponse.rewrite(url, { request: { headers: requestHeaders } })
}
