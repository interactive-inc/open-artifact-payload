import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import type { SiteSetting } from '@/payload-types'
import { resolveMediaUrl } from '@/core/lib/media/resolve-media-url'
import { Button } from '@/project/shared/components/button'

type Props = {
  settings: SiteSetting
}

export function SiteHeader(props: Props) {
  const logoUrl = resolveMediaUrl(props.settings.logo)
  const siteName = props.settings.siteName ?? ''
  const nav = props.settings.headerNav ?? []

  return (
    <header className="border-b border-border">
      <div className="max-w-container mx-auto flex h-16 items-center justify-between gap-6 px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={siteName}
              width={120}
              height={32}
              className="h-8 w-auto object-contain"
            />
          ) : (
            siteName
          )}
        </Link>
        <nav className="flex items-center gap-6">
          <ul className="hidden items-center gap-6 md:flex">
            {nav.map((item) => (
              <li key={item.id ?? item.href}>
                <Link href={item.href} className="text-sm hover:text-brand">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button href="/contact" size="sm">
            お問い合わせ
          </Button>
        </nav>
      </div>
    </header>
  )
}
