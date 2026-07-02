'use client'

import Link from 'next/link'
import React from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

type Props = {
  children: React.ReactNode
  variant?: Variant
  size?: Size
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  // 指定すると <button> ではなく next/link のリンクとして描画する。
  href?: string
}

const variantClass: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  secondary: 'bg-surface text-brand border border-brand hover:bg-brand/5',
  ghost: 'bg-transparent text-brand hover:bg-brand/10',
}

const sizeClass: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export function Button(props: Props) {
  const variant = props.variant ?? 'primary'
  const size = props.size ?? 'md'
  // Tailwind の `disabled:` 擬似クラスは <a> には効かないため、リンク経路では
  // aria-disabled の属性セレクタにも opacity / cursor を当てる必要がある。
  const className = `inline-flex items-center justify-center rounded font-sans transition-colors disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 ${variantClass[variant]} ${sizeClass[size]}`

  if (props.href) {
    // disabled なリンクはクリックされてもナビゲートさせない。
    // aria-disabled + tabIndex=-1 + onClick で preventDefault する標準パターン。
    if (props.disabled) {
      return (
        <a
          role="link"
          aria-disabled="true"
          tabIndex={-1}
          onClick={(event) => event.preventDefault()}
          className={className}
        >
          {props.children}
        </a>
      )
    }
    return (
      <Link href={props.href} className={className}>
        {props.children}
      </Link>
    )
  }

  return (
    <button
      type={props.type ?? 'button'}
      disabled={props.disabled}
      onClick={props.onClick}
      className={className}
    >
      {props.children}
    </button>
  )
}
