import React from 'react'

import { loadSiteSettings } from '@/core/lib/load-site-settings'
import { RefreshRouteOnSave } from '@/core/frontend/components/refresh-route-on-save'
import { SiteHeader } from '@/project/shared/sections/site-header'
import { SiteFooter } from '@/project/shared/sections/site-footer'
import { SiteAnalytics } from '@/project/shared/components/site-analytics'
import './styles.css'

type Props = {
  children: React.ReactNode
}

export const metadata = {
  title: 'Inta CMS',
  description: 'Inta CMS テンプレート',
}

// フロントは D1 由来のコンテンツ (サイト設定・各ページ) をリクエスト時に取得するため、
// ビルド時のプリレンダリング (D1 非接続) を避けて動的レンダリングに統一する。
export const dynamic = 'force-dynamic'

export default async function RootLayout(props: Props) {
  const settings = await loadSiteSettings()

  return (
    <html lang="ja">
      <body className="flex min-h-screen flex-col">
        {/* ライブプレビューを成立させるため、ドラフトモード判定なしで常時マウントする */}
        {/* (preview iframe 外では postMessage が来ないので実害なし)。
           .claude/rules/cms-design.md「常時レンダリング」要件と一致。 */}
        <RefreshRouteOnSave />
        <SiteHeader settings={settings} />
        <main className="flex-1">{props.children}</main>
        <SiteFooter settings={settings} />
        <SiteAnalytics gaTagId={settings.analytics?.gaTagId} gtmId={settings.analytics?.gtmId} />
      </body>
    </html>
  )
}
