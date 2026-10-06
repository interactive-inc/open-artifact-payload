import { ArrowRightIcon, ArrowUpRightIcon } from "lucide-react"
import Link from "next/link"
import type { CSSProperties } from "react"

import type { LinkButtonBlock } from "@/payload-types"

import { readLinkButton } from "@/core/lib/rich-text/read-link-button"

type Props = {
  fields: Partial<LinkButtonBlock>
  style?: CSSProperties
}

/**
 * 本文のリンクボタン。下書きで文言かリンク先が欠けていれば出さない。外部リンクは別タブで開く。
 * エディタで指定した配置は Payload が style として差し込むため、包む要素へ渡す。
 */
export function RichTextLinkButton(props: Props) {
  const button = readLinkButton(props.fields)

  if (!button) return null

  return (
    <div className="rich-text-link-button" style={props.style}>
      <Link
        className={`rich-text-button rich-text-button--${button.size}`}
        href={button.href}
        target={button.isExternal ? "_blank" : undefined}
        rel={button.isExternal ? "noopener noreferrer" : undefined}
      >
        {button.label}
        {button.isExternal ? <ArrowUpRightIcon aria-hidden /> : <ArrowRightIcon aria-hidden />}
      </Link>
    </div>
  )
}
