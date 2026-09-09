import path from "path"
import { fileURLToPath } from "url"

import { buildCoreConfig } from "@/core/payload/config-base"
import { projectFeatures } from "@/cms/project-features"
import { projectMcpConfig } from "@/cms/mcp"
import { homeGlobal } from "@/cms/globals/home"
import { aboutGlobal } from "@/cms/globals/about"
import { serviceGlobal } from "@/cms/globals/service"
import { works } from "@/cms/collections/works"
import { isLocale } from "@/i18n/is-locale"
import { withLocalePrefix } from "@/i18n/with-locale-prefix"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildCoreConfig({
  dirname,
  features: projectFeatures,
  mcp: projectMcpConfig,
  projectCollections: [works],
  projectGlobals: [homeGlobal, aboutGlobal, serviceGlobal],
  livePreviewCollections: ["news", "works"],
  livePreviewGlobals: ["home-page", "about", "service"],
  livePreviewUrl: (args) => {
    const base = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000"
    const localeCode = typeof args.locale === "string" ? args.locale : args.locale.code
    const locale = isLocale(localeCode) ? localeCode : "ja"
    const toPreview = (urlPath: string) =>
      `${base}/next/preview?path=${encodeURIComponent(withLocalePrefix(locale, urlPath))}`
    if (args.globalConfig) {
      const map: Record<string, string> = {
        "home-page": "/",
        about: "/about",
        service: "/service",
      }
      return toPreview(map[args.globalConfig.slug] ?? `/${args.globalConfig.slug}`)
    }
    if (args.collectionConfig && args.data?.slug) {
      return toPreview(`/${args.collectionConfig.slug}/${args.data.slug}`)
    }
    return toPreview("/")
  },
})
