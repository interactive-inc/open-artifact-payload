import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import config from '@/payload.config'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/project/shared/ui/accordion'
import { Button } from '@/project/shared/ui/button'
import { Separator } from '@/project/shared/ui/separator'
import '../styles.css'

const categoryLabel: Record<string, string> = {
  general: '全般',
  service: 'サービス',
  pricing: '料金',
  other: 'その他',
}

export default async function FaqPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const result = await payload.find({
    collection: 'faq',
    limit: 100,
    sort: 'order',
  })

  const grouped: Record<string, typeof result.docs> = {}
  for (const item of result.docs) {
    const cat = item.category ?? 'general'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  }

  return (
    <div>
      <section className="bg-foreground py-16 text-background">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight">よくある質問</h1>
          <p className="mt-4 text-lg text-background/80">FAQ</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          {result.docs.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">FAQはまだありません。</p>
          ) : (
            <div className="space-y-12">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <h2 className="text-xl font-bold mb-6">{categoryLabel[category] ?? category}</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {items.map((item) => (
                      <AccordionItem key={item.id} value={String(item.id)}>
                        <AccordionTrigger className="text-left">
                          <span className="flex items-start gap-3">
                            <span className="text-primary font-bold flex-shrink-0">Q</span>
                            {item.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex gap-3 pt-2">
                            <span className="font-bold text-muted-foreground flex-shrink-0">A</span>
                            <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          )}

          <Separator className="my-12" />

          <div className="text-center bg-muted/30 rounded-xl p-8">
            <p className="text-foreground mb-4">解決しない場合はお気軽にお問い合わせください</p>
            <Button nativeButton={false} render={<Link href="/contact" />}>
              お問い合わせする
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
