import React from 'react'

import type { Metadata } from 'next'

import { loadSiteSettings } from '@/core/lib/load-site-settings'
import { RefreshRouteOnSave } from '@/core/frontend/components/refresh-route-on-save'
import { SiteHeader } from '@/project/shared/sections/site-header'
import { SiteFooter } from '@/project/shared/sections/site-footer'
import { SiteAnalytics } from '@/project/shared/components/site-analytics'
import { TooltipProvider } from '@/project/shared/ui/tooltip'
import { Toaster } from '@/project/shared/ui/sonner'
import './styles.css'

type Props = {
  children: React.ReactNode
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadSiteSettings()

  return {
    // OG 画像などの相対 URL を絶対 URL に解決するための基準。本番では必ず NEXT_PUBLIC_SERVER_URL を設定する。
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'),
    title: {
      default: settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
  }
}

// フロントは D1 由来のコンテンツ (サイト設定・各ページ) をリクエスト時に取得するため、
// ビルド時のプリレンダリング (D1 非接続) を避けて動的レンダリングに統一する。
export const dynamic = 'force-dynamic'

export default async function RootLayout(props: Props) {
  const settings = await loadSiteSettings()

  return (
    <html lang="ja">
      <body className="flex flex-col min-h-screen bg-background text-foreground">
        {/* ライブプレビューを成立させるため、ドラフトモード判定なしで常時マウントする */}
        <RefreshRouteOnSave />
        <TooltipProvider>
          <SiteHeader settings={settings} />
          <main className="flex-1">{props.children}</main>
          <SiteFooter settings={settings} />
        </TooltipProvider>
        <Toaster />
        <SiteAnalytics gaTagId={settings.analytics?.gaTagId} gtmId={settings.analytics?.gtmId} />
      </body>
    </html>
  )
}
