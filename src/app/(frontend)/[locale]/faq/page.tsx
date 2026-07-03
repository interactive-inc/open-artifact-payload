import { getPayload } from 'payload'
import Link from 'next/link'
import { notFound } from 'next/navigation'
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
import { PageHeader } from '@/project/shared/sections/page-header'
import { isLocale } from '@/project/shared/lib/is-locale'
import { withLocalePrefix } from '@/project/shared/lib/with-locale-prefix'
import { getUiDictionary } from '@/project/shared/lib/get-ui-dictionary'
import { buildLocaleAlternates } from '@/project/shared/lib/build-locale-alternates'
import type { Locale } from '@/project/shared/lib/locale-types'
import type { Metadata } from 'next'

import '../styles.css'

type Props = {
  params: Promise<{ locale: string }>
}

function resolveLocale(locale: string): Locale {
  if (!isLocale(locale)) notFound()
  return locale
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const locale = resolveLocale(params.locale)
  const dictionary = getUiDictionary(locale)
  return {
    title: dictionary.faq.title,
    alternates: { languages: buildLocaleAlternates('/faq') },
  }
}

export default async function FaqPage(props: Props) {
  const params = await props.params
  const locale = resolveLocale(params.locale)
  const dictionary = getUiDictionary(locale)
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const result = await payload.find({
    collection: 'faq',
    limit: 100,
    sort: 'order',
    locale,
  })

  const grouped: Record<string, typeof result.docs> = {}
  for (const item of result.docs) {
    const cat = item.category ?? 'general'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  }

  return (
    <div>
      <PageHeader title={dictionary.faq.title} description="FAQ" />

      <section className="py-16">
        <div className="container-site">
          {result.docs.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">{dictionary.faq.empty}</p>
          ) : (
            <div className="space-y-12">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <h2 className="text-xl font-bold mb-6">
                    {dictionary.faq.categoryLabels[category] ?? category}
                  </h2>
                  <Accordion className="w-full">
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
            <p className="text-foreground mb-4">{dictionary.faq.ctaText}</p>
            <Button
              nativeButton={false}
              render={<Link href={withLocalePrefix(locale, '/contact')} />}
            >
              {dictionary.faq.ctaButton}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
