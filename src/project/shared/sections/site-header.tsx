'use client'

import Link from 'next/link'
import Image from 'next/image'
import React, { useState } from 'react'

import { resolveMediaUrl, resolveMediaAlt } from '@/core/lib/media'
import type { SiteSetting } from '@/payload-types'

type Props = {
  settings: SiteSetting
}

export function SiteHeader(props: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const logoUrl = resolveMediaUrl(props.settings.logo as never)
  const logoAlt = resolveMediaAlt(props.settings.logo as never) ?? props.settings.siteName

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            {logoUrl ? (
              <Image src={logoUrl} alt={logoAlt} width={120} height={40} className="h-8 w-auto object-contain" />
            ) : (
              <span className="text-xl font-bold text-brand">{props.settings.siteName}</span>
            )}
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {(props.settings.headerNav ?? []).map((item) => (
              <Link
                key={item.id ?? item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-brand hover:bg-brand/5 rounded-md transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="ml-2 px-4 py-2 text-sm font-semibold bg-brand text-white rounded-md hover:bg-brand-dark transition-colors"
            >
              お問い合わせ
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            aria-label="メニュー"
          >
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current" />
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="md:hidden border-t border-gray-200 bg-white px-6 py-4 space-y-1">
          {(props.settings.headerNav ?? []).map((item) => (
            <Link
              key={item.id ?? item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand hover:bg-brand/5 rounded-md"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setIsMenuOpen(false)}
            className="block mt-2 px-3 py-2 text-sm font-semibold bg-brand text-white rounded-md text-center"
          >
            お問い合わせ
          </Link>
        </div>
      ) : null}
    </header>
  )
}
