import React from 'react'

const DEFAULT_PUBLIC_URL = 'http://localhost:3000'

export function OpenPublicSite() {
  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? DEFAULT_PUBLIC_URL
  const href = `${base}/next/exit-preview?path=${encodeURIComponent('/')}`

  return (
    <div className="ictms-open-public-site">
      <a
        className="ictms-open-public-site__link"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        公開サイトを開く
      </a>
    </div>
  )
}
