import path from 'path'
import { fileURLToPath } from 'url'

import { buildCoreConfig } from '@/core/payload/config-base'
import { projectFeatures } from '@/project/project-features'
import { homeGlobal } from '@/project/pages/home/global'
import { aboutGlobal } from '@/project/pages/about/global'
import { serviceGlobal } from '@/project/pages/service/global'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildCoreConfig({
  dirname,
  features: projectFeatures,
  projectGlobals: [homeGlobal, aboutGlobal, serviceGlobal],
  livePreviewGlobals: ['home-page', 'about', 'service'],
  livePreviewUrl: (args) => {
    const base = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'
    const toPreview = (urlPath: string) =>
      `${base}/next/preview?path=${encodeURIComponent(urlPath)}`
    if (args.globalConfig) {
      const map: Record<string, string> = {
        'home-page': '/',
        about: '/about',
        service: '/service',
      }
      return toPreview(map[args.globalConfig.slug] ?? `/${args.globalConfig.slug}`)
    }
    if (args.collectionConfig && args.data?.slug) {
      return toPreview(`/${args.collectionConfig.slug}/${args.data.slug}`)
    }
    return toPreview('/')
  },
})
