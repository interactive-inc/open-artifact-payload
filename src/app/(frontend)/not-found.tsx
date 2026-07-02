import Link from 'next/link'
import React from 'react'
import { ArrowRightIcon } from 'lucide-react'

import { Button } from '@/project/shared/ui/button'
import './styles.css'

// 存在しない URL に来たときの 404。サイト共通レイアウト（ヘッダー / フッター）の中に表示される。
export default function NotFound() {
  return (
    <section className="container-site flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
        404 Not Found
      </p>
      <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">ページが見つかりません</h1>
      <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
        URL が変更されたか、ページが削除された可能性があります。
      </p>
      <Button nativeButton={false} render={<Link href="/" />} className="mt-10">
        トップへ戻る
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
    </section>
  )
}
