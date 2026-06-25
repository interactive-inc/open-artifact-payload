import Script from 'next/script'
import React from 'react'

type Props = {
  gaTagId?: string | null
  gtmId?: string | null
}

// インラインスクリプトに値を直接補間するためのサニタイズ。
// 想定形式 (GTM-XXXXXXX / G-XXXXXXXX / UA-XXXXXXX-Y) のみ通し、それ以外は除外する。
const GTM_PATTERN = /^GTM-[A-Z0-9]+$/
const GA_PATTERN = /^(G-[A-Z0-9]+|UA-[0-9]+-[0-9]+)$/

function safeGtmId(value: string | null | undefined): string | null {
  if (!value) return null
  return GTM_PATTERN.test(value) ? value : null
}

function safeGaTagId(value: string | null | undefined): string | null {
  if (!value) return null
  return GA_PATTERN.test(value) ? value : null
}

/**
 * サイト設定の解析タグ (Google Analytics / Google Tag Manager) を注入する。
 * 各 ID が想定形式に一致するときのみ対応するスクリプトを読み込む (XSS 対策)。
 * GTM は JS 無効ユーザ向けに <noscript> iframe フォールバックも併設する。
 */
export function SiteAnalytics(props: Props) {
  const gtmId = safeGtmId(props.gtmId)
  const gaTagId = safeGaTagId(props.gaTagId)
  return (
    <>
      {gtmId ? (
        <>
          <Script id="gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      ) : null}
      {gaTagId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaTagId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaTagId}');`}
          </Script>
        </>
      ) : null}
    </>
  )
}
