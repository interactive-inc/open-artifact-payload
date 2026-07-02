'use client'

import Link from 'next/link'
import Image from 'next/image'
import React, { useState } from 'react'
import { MenuIcon, XIcon } from 'lucide-react'

import { resolveMediaUrl, resolveMediaAlt } from '@/core/lib/media'
import { Button } from '@/project/shared/ui/button'
import { Separator } from '@/project/shared/ui/separator'
import type { SiteSetting } from '@/payload-types'

type Props = {
  settings: SiteSetting
}

export function SiteHeader(props: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const logoUrl = resolveMediaUrl(props.settings.logo as never)
  const logoAlt = resolveMediaAlt(props.settings.logo as never) ?? props.settings.siteName

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/70 backdrop-blur-xl">
      <div className="container-site">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={logoAlt}
                width={120}
                height={40}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span className="text-xl font-bold tracking-tight text-foreground">SAMPLE inc.</span>
            )}
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {(props.settings.headerNav ?? []).map((item) => (
              <Link
                key={item.id ?? item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Button
              nativeButton={false}
              render={<Link href="/contact" />}
              size="sm"
              className="ml-2"
            >
              お問い合わせ
            </Button>
          </nav>

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:bg-muted transition-colors"
            aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          >
            {isMenuOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="md:hidden border-t border-foreground/10 bg-white/90 backdrop-blur-xl px-6 py-4 space-y-1">
          {(props.settings.headerNav ?? []).map((item) => (
            <Link
              key={item.id ?? item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Separator className="my-2" />
          <Button
            nativeButton={false}
            render={<Link href="/contact" onClick={() => setIsMenuOpen(false)} />}
            className="w-full"
            size="sm"
          >
            お問い合わせ
          </Button>
        </div>
      ) : null}
    </header>
  )
}
