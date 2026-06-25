import { cache } from 'react'
import { getPayload } from 'payload'

import config from '@/payload.config'

/**
 * サイト設定グローバルを取得する。React.cache でメモ化しており、
 * 同一リクエスト内 (レイアウトと各ページ) で何度呼んでもクエリは 1 回。
 */
export const loadSiteSettings = cache(async () => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  return payload.findGlobal({ slug: 'site-settings', depth: 1 })
})
