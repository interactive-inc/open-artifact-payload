import Link from 'next/link'
import React from 'react'

import type { SiteSetting } from '@/payload-types'

type Props = {
  settings: SiteSetting
}

type SocialLink = { label: string; href: string }

function socialLinks(social: SiteSetting['social']): SocialLink[] {
  if (!social) return []
  const entries: SocialLink[] = []
  if (social.twitter) entries.push({ label: 'X (Twitter)', href: social.twitter })
  if (social.facebook) entries.push({ label: 'Facebook', href: social.facebook })
  if (social.instagram) entries.push({ label: 'Instagram', href: social.instagram })
  if (social.youtube) entries.push({ label: 'YouTube', href: social.youtube })
  return entries
}

export function SiteFooter(props: Props) {
  const siteName = props.settings.siteName ?? ''
  const footerNav = props.settings.footerNav ?? []
  const policyLinks = props.settings.policyLinks ?? []
  const company = props.settings.companyInfo
  const socials = socialLinks(props.settings.social)
  // Cloudflare Workers は UTC 実行のため、JST 基準で年を取り出す
  // (UTC 12/31 15:00〜23:59 は JST では翌年元日)。
  const year = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', year: 'numeric' }).format(
    new Date(),
  )

  return (
    <footer className="border-t border-border bg-neutral-50">
      <div className="max-w-container mx-auto px-6 py-section-sm">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-lg font-bold">{siteName}</p>
            {props.settings.footerText ? (
              <p className="whitespace-pre-wrap text-sm text-muted">{props.settings.footerText}</p>
            ) : null}
            {company && (company.address || company.tel || company.fax) ? (
              <address className="space-y-0.5 text-sm text-muted not-italic">
                {company.address ? <p>{company.address}</p> : null}
                {company.tel ? <p>TEL: {company.tel}</p> : null}
                {company.fax ? <p>FAX: {company.fax}</p> : null}
              </address>
            ) : null}
          </div>

          {footerNav.length > 0 ? (
            <nav aria-label="フッターナビゲーション">
              <ul className="space-y-2 text-sm">
                {footerNav.map((item) => (
                  <li key={item.id ?? item.href}>
                    <Link href={item.href} className="hover:text-brand">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {socials.length > 0 ? (
            <nav aria-label="SNS">
              <ul className="space-y-2 text-sm">
                {socials.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-brand"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {siteName}
          </p>
          {policyLinks.length > 0 ? (
            <ul className="flex flex-wrap gap-4">
              {policyLinks.map((item) => (
                <li key={item.id ?? item.href}>
                  <Link href={item.href} className="hover:text-brand">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
