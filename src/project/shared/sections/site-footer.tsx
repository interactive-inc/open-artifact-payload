import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

import { resolveMediaUrl, resolveMediaAlt } from '@/core/lib/media'
import type { SiteSetting } from '@/payload-types'

type Props = {
  settings: SiteSetting
}

export function SiteFooter(props: Props) {
  const logoUrl = resolveMediaUrl(props.settings.logo as never)
  const logoAlt = resolveMediaAlt(props.settings.logo as never) ?? props.settings.siteName
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="inline-block mb-4">
              {logoUrl ? (
                <Image src={logoUrl} alt={logoAlt} width={120} height={40} className="h-8 w-auto object-contain brightness-0 invert" />
              ) : (
                <span className="text-lg font-bold text-white">{props.settings.siteName}</span>
              )}
            </Link>
            {props.settings.companyInfo?.address ? (
              <address className="not-italic text-sm leading-relaxed text-gray-400 mt-2">
                {props.settings.companyInfo.address}
              </address>
            ) : null}
            {props.settings.companyInfo?.tel ? (
              <p className="text-sm text-gray-400 mt-1">TEL: {props.settings.companyInfo.tel}</p>
            ) : null}
            {props.settings.companyInfo?.fax ? (
              <p className="text-sm text-gray-400">FAX: {props.settings.companyInfo.fax}</p>
            ) : null}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">メニュー</h3>
            <nav className="space-y-2">
              {(props.settings.footerNav ?? []).map((item) => (
                <Link
                  key={item.id ?? item.href}
                  href={item.href}
                  className="block text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">SNS</h3>
            <div className="flex gap-4">
              {props.settings.social?.twitter ? (
                <a
                  href={props.settings.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Twitter/X"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.847L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              ) : null}
              {props.settings.social?.facebook ? (
                <a
                  href={props.settings.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              ) : null}
              {props.settings.social?.instagram ? (
                <a
                  href={props.settings.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
              ) : null}
              {props.settings.social?.youtube ? (
                <a
                  href={props.settings.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="YouTube"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              ) : null}
            </div>
            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-block px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-md hover:bg-brand-dark transition-colors"
              >
                お問い合わせ
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              {props.settings.footerText ?? `© ${currentYear} ${props.settings.siteName}. All rights reserved.`}
            </p>
            {(props.settings.policyLinks ?? []).length > 0 ? (
              <nav className="flex flex-wrap gap-4">
                {(props.settings.policyLinks ?? []).map((item) => (
                  <Link
                    key={item.id ?? item.href}
                    href={item.href}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  )
}
