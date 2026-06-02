import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { RefreshRouteOnSave } from '@/core/frontend/components/refresh-route-on-save'
import { SiteHeader } from '@/project/shared/sections/site-header'
import { SiteFooter } from '@/project/shared/sections/site-footer'
import { TooltipProvider } from '@/project/shared/ui/tooltip'
import { Toaster } from '@/project/shared/ui/sonner'
import './styles.css'

type Props = {
  children: React.ReactNode
}

export default async function RootLayout(props: Props) {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })

  return (
    <html lang="ja">
      <body className="flex flex-col min-h-screen bg-background text-foreground">
        <RefreshRouteOnSave />
        <TooltipProvider>
          <SiteHeader settings={settings} />
          <main className="flex-1">{props.children}</main>
          <SiteFooter settings={settings} />
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  )
}
