import Link from "next/link"
import Image from "next/image"
import React from "react"

import { resolveMediaUrl } from "@/core/lib/media/resolve-media-url"
import { resolveMediaAlt } from "@/core/lib/media/resolve-media-alt"
import { Separator } from "@/project/shared/ui/separator"
import { Button } from "@/project/shared/ui/button"
import { withLocalePrefix } from "@/project/shared/lib/with-locale-prefix"
import { getUiDictionary } from "@/project/shared/lib/get-ui-dictionary"
import type { Locale } from "@/project/shared/lib/locale-types"
import type { SiteSetting } from "@/payload-types"

type Props = {
  settings: SiteSetting
  locale: Locale
}

export function SiteFooter(props: Props) {
  const logoUrl = resolveMediaUrl(props.settings.logo as never)
  const logoAlt = resolveMediaAlt(props.settings.logo as never) ?? props.settings.siteName
  const currentYear = new Date().getFullYear()
  const dictionary = getUiDictionary(props.locale)

  return (
    <footer className="bg-foreground text-background">
      <div className="container-site py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href={withLocalePrefix(props.locale, "/")} className="inline-block mb-4">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={logoAlt}
                  width={120}
                  height={40}
                  className="h-8 w-auto object-contain brightness-0 invert"
                />
              ) : (
                <span className="text-lg font-bold tracking-tight">{props.settings.siteName}</span>
              )}
            </Link>
            {props.settings.companyInfo?.address ? (
              <address className="not-italic text-sm leading-relaxed text-background/60 mt-2 whitespace-pre-wrap">
                {props.settings.companyInfo.address}
              </address>
            ) : null}
            {props.settings.companyInfo?.tel ? (
              <p className="text-sm text-background/60 mt-1">
                TEL: {props.settings.companyInfo.tel}
              </p>
            ) : null}
            {props.settings.companyInfo?.fax ? (
              <p className="text-sm text-background/60 mt-1">
                FAX: {props.settings.companyInfo.fax}
              </p>
            ) : null}
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              {dictionary.footer.menuHeading}
            </h3>
            <nav className="flex flex-col gap-2">
              {(props.settings.footerNav ?? []).map((item) => (
                <Link
                  key={item.id ?? item.href}
                  href={withLocalePrefix(props.locale, item.href)}
                  className="text-sm text-background/60 hover:text-background transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              {dictionary.footer.snsHeading}
            </h3>
            <div className="flex gap-3">
              {props.settings.social?.twitter ? (
                <a
                  href={props.settings.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/60 hover:text-background transition-colors"
                  aria-label="Twitter/X"
                >
                  <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.847L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              ) : null}
              {props.settings.social?.facebook ? (
                <a
                  href={props.settings.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/60 hover:text-background transition-colors"
                  aria-label="Facebook"
                >
                  <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              ) : null}
              {props.settings.social?.instagram ? (
                <a
                  href={props.settings.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/60 hover:text-background transition-colors"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
                    <path d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2Zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5Zm8.75 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                  </svg>
                </a>
              ) : null}
              {props.settings.social?.youtube ? (
                <a
                  href={props.settings.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/60 hover:text-background transition-colors"
                  aria-label="YouTube"
                >
                  <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
                    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" />
                  </svg>
                </a>
              ) : null}
            </div>
            <div className="mt-6">
              <Button
                nativeButton={false}
                render={<Link href={withLocalePrefix(props.locale, "/contact")} />}
                variant="outline"
                size="sm"
                className="border-background/30 text-background hover:bg-background/10 hover:text-background"
              >
                {dictionary.nav.contact}
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-background/20" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/50">
            {props.settings.footerText ??
              `© ${currentYear} ${props.settings.siteName} ${dictionary.footer.defaultCopyright}`}
          </p>
          {(props.settings.policyLinks ?? []).length > 0 ? (
            <nav className="flex flex-wrap gap-4">
              {(props.settings.policyLinks ?? []).map((item) => (
                <Link
                  key={item.id ?? item.href}
                  href={withLocalePrefix(props.locale, item.href)}
                  className="text-xs text-background/40 hover:text-background/70 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
