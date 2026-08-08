'use client'

import Link from 'next/link'
import Image from 'next/image'
import React, { useState } from 'react'
import { MenuIcon, XIcon } from 'lucide-react'

import { resolveMediaUrl } from '@/core/lib/media/resolve-media-url'
import { resolveMediaAlt } from '@/core/lib/media/resolve-media-alt'
import { Button } from '@/project/shared/ui/button'
import { Separator } from '@/project/shared/ui/separator'
import { LocaleSwitcher } from '@/project/shared/components/locale-switcher'
import { withLocalePrefix } from '@/project/shared/lib/with-locale-prefix'
import { getUiDictionary } from '@/project/shared/lib/get-ui-dictionary'
import type { Locale } from '@/project/shared/lib/locale-types'
import type { SiteSetting } from '@/payload-types'

type Props = {
  settings: SiteSetting
  locale: Locale
}

export function SiteHeader(props: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const logoUrl = resolveMediaUrl(props.settings.logo as never)
  const logoAlt = resolveMediaAlt(props.settings.logo as never) ?? props.settings.siteName
  const dictionary = getUiDictionary(props.locale)

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/70 backdrop-blur-xl">
      <div className="container-site">
        <div className="flex items-center justify-between h-16">
          <Link href={withLocalePrefix(props.locale, '/')} className="flex items-center gap-3">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={logoAlt}
                width={120}
                height={40}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span className="text-xl font-bold tracking-tight text-foreground">
                {props.settings.siteName}
              </span>
            )}
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {(props.settings.headerNav ?? []).map((item) => (
              <Link
                key={item.id ?? item.href}
                href={withLocalePrefix(props.locale, item.href)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <LocaleSwitcher locale={props.locale} />
            <Button
              nativeButton={false}
              render={<Link href={withLocalePrefix(props.locale, '/contact')} />}
              size="sm"
              className="ml-2"
            >
              {dictionary.nav.contact}
            </Button>
          </nav>

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:bg-muted transition-colors"
            aria-label={isMenuOpen ? dictionary.nav.menuClose : dictionary.nav.menuOpen}
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
              href={withLocalePrefix(props.locale, item.href)}
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Separator className="my-2" />
          <LocaleSwitcher locale={props.locale} />
          <Button
            nativeButton={false}
            render={
              <Link
                href={withLocalePrefix(props.locale, '/contact')}
                onClick={() => setIsMenuOpen(false)}
              />
            }
            className="w-full"
            size="sm"
          >
            {dictionary.nav.contact}
          </Button>
        </div>
      ) : null}
    </header>
  )
}
