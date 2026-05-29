import React from 'react'

import { RefreshRouteOnSave } from '@/core/frontend/components/refresh-route-on-save'
import './styles.css'

type Props = {
  children: React.ReactNode
}

export const metadata = {
  description: 'Inta CMS テンプレート',
  title: 'Inta CMS',
}

export default function RootLayout(props: Props) {
  return (
    <html lang="ja">
      <body>
        <RefreshRouteOnSave />
        <main>{props.children}</main>
      </body>
    </html>
  )
}
