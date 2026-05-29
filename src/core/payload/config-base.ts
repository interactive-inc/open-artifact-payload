import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig, type Config } from 'payload'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { ja } from '@payloadcms/translations/languages/ja'

import { users } from '@/core/collections/users'
import { media } from '@/core/collections/media'
import { news } from '@/core/collections/news'
import { faq } from '@/core/collections/faq'
import { contactSubmissions } from '@/core/collections/contact-submissions'
import { pages } from '@/core/collections/pages'
import { siteSettings } from '@/core/globals/site-settings'
import type { ProjectFeatures } from '@/project/types'

type LivePreviewUrlValue = NonNullable<
  NonNullable<NonNullable<Config['admin']>['livePreview']>['url']
>
type LivePreviewUrlFn = Extract<LivePreviewUrlValue, (...args: never[]) => unknown>

type BuildCoreConfigProps = {
  dirname: string
  features: ProjectFeatures
  projectCollections?: Config['collections']
  projectGlobals?: Config['globals']
  livePreviewCollections?: string[]
  livePreviewGlobals?: string[]
  livePreviewUrl?: LivePreviewUrlFn
}

const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)

const isCLI = process.argv.some((value) => realpath(value)?.endsWith(path.join('payload', 'bin.js')))
const isProduction = process.env.NODE_ENV === 'production'

const createLog =
  (level: string, fn: typeof console.log) => (objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === 'string') {
      fn(JSON.stringify({ level, msg: objOrMsg }))
    } else {
      fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }))
    }
  }

const cloudflareLogger = {
  level: process.env.PAYLOAD_LOG_LEVEL || 'info',
  trace: createLog('trace', console.debug),
  debug: createLog('debug', console.debug),
  info: createLog('info', console.log),
  warn: createLog('warn', console.warn),
  error: createLog('error', console.error),
  fatal: createLog('fatal', console.error),
  silent: () => {},
} as unknown as Config['logger']

function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: isProduction,
      } satisfies GetPlatformProxyOptions),
  )
}

const defaultLivePreviewUrl: LivePreviewUrlFn = (args) => {
  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'
  const toPreview = (urlPath: string) =>
    `${base}/next/preview?path=${encodeURIComponent(urlPath)}`
  if (args.globalConfig) {
    const globalPath = args.globalConfig.slug === 'home-page' ? '/' : `/${args.globalConfig.slug}`
    return toPreview(globalPath)
  }
  if (args.collectionConfig) {
    const data = args.data
    if (data && typeof data === 'object' && 'slug' in data && typeof data.slug === 'string') {
      return toPreview(`/${args.collectionConfig.slug}/${data.slug}`)
    }
    return toPreview(`/${args.collectionConfig.slug}`)
  }
  return toPreview('/')
}

export async function buildCoreConfig(props: BuildCoreConfigProps) {
  const cloudflare =
    isCLI || !isProduction
      ? await getCloudflareContextFromWrangler()
      : await getCloudflareContext({ async: true })

  const allCollections = [
    users,
    media,
    news,
    faq,
    contactSubmissions,
    ...(props.features.enableFreePages ? [pages] : []),
    ...(props.projectCollections ?? []),
  ]

  const allGlobals = [siteSettings, ...(props.projectGlobals ?? [])]

  // フロントにルートが存在するコレクション/グローバルのみ Live Preview 対象にする。
  // 案件でコレクションのフロントページを追加したら、ここにも slug を追加する。
  const previewCollectionSlugs = props.livePreviewCollections ?? ['news']
  const previewGlobalSlugs = props.livePreviewGlobals ?? ['home-page']

  return buildConfig({
    admin: {
      user: users.slug,
      importMap: {
        baseDir: path.resolve(props.dirname),
      },
      meta: {
        titleSuffix: ' | Inta CMS',
        description: 'Inta CMS 管理画面',
      },
      components: {
        providers: [
          '@/core/admin/theme/admin-theme-provider#AdminThemeProvider',
        ],
        afterNavLinks: [
          '@/core/admin/nav/open-public-site#OpenPublicSite',
        ],
        views: {
          dashboard: {
            Component: '@/core/admin/dashboard/dashboard-view#DashboardView',
          },
        },
      },
      livePreview: {
        collections: previewCollectionSlugs,
        globals: previewGlobalSlugs,
        breakpoints: [
          { name: 'mobile', width: 375, height: 667, label: 'モバイル' },
          { name: 'tablet', width: 768, height: 1024, label: 'タブレット' },
          { name: 'desktop', width: 1440, height: 900, label: 'デスクトップ' },
        ],
        url: props.livePreviewUrl ?? defaultLivePreviewUrl,
      },
    },
    collections: allCollections,
    globals: allGlobals,
    editor: lexicalEditor(),
    secret: process.env.PAYLOAD_SECRET || '',
    typescript: {
      outputFile: path.resolve(props.dirname, 'payload-types.ts'),
    },
    db: sqliteD1Adapter({ binding: cloudflare.env.D1, push: false }),
    logger: isProduction ? cloudflareLogger : undefined,
    plugins: [
      r2Storage({
        bucket: cloudflare.env.R2,
        collections: { media: true },
      }),
      seoPlugin({
        // pages は features.enableFreePages が true の案件でのみ登録される。
        // 有効化する際はこの collections リストに 'pages' を追加し、
        // pages.ts の meta グループフィールド (手書き) と競合しないか確認すること。
        collections: ['news'],
        globals: ['home-page'],
        uploadsCollection: 'media',
        generateTitle: (args) => {
          const doc = args.doc
          const title =
            doc && typeof doc === 'object' && 'title' in doc && typeof doc.title === 'string'
              ? doc.title
              : ''
          return `${title} | Inta CMS`
        },
      }),
    ],
    i18n: {
      supportedLanguages: { ja },
      fallbackLanguage: 'ja',
    },
  })
}
