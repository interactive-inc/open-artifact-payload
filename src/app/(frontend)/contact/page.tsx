import { getPayload } from 'payload'
import React from 'react'
import { PhoneIcon, MapPinIcon, HelpCircleIcon } from 'lucide-react'

import config from '@/payload.config'
import { ContactForm } from '@/core/frontend/forms/contact-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/project/shared/ui/card'
import { Separator } from '@/project/shared/ui/separator'
import { Button } from '@/project/shared/ui/button'
import Link from 'next/link'
import '../styles.css'

const inquiryOptions = [
  { value: 'service', label: 'サービスに関するお問い合わせ' },
  { value: 'estimate', label: 'お見積もりのご依頼' },
  { value: 'consultation', label: '技術相談・ご相談' },
  { value: 'recruitment', label: '採用に関するお問い合わせ' },
  { value: 'media', label: '取材・メディアのお問い合わせ' },
  { value: 'other', label: 'その他' },
]

export default async function ContactPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const settings = await payload.findGlobal({ slug: 'site-settings' })

  return (
    <div>
      <section className="bg-foreground py-16 text-background">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight">お問い合わせ</h1>
          <p className="mt-4 text-lg text-background/80">
            サービスのご相談・お見積もりはお気軽にどうぞ
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold mb-6">お問い合わせフォーム</h2>
              <ContactForm
                turnstileSiteKey={settings.turnstileSiteKey ?? undefined}
                inquiryOptions={inquiryOptions}
              />
            </div>

            <div className="flex flex-col gap-4">
              {settings.companyInfo?.tel ? (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <PhoneIcon className="size-4 text-muted-foreground" />
                      お電話でのお問い合わせ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={`tel:${settings.companyInfo.tel.replace(/-/g, '')}`}
                      className="text-xl font-bold hover:underline"
                    >
                      {settings.companyInfo.tel}
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">平日 9:00〜18:00</p>
                  </CardContent>
                </Card>
              ) : null}

              {settings.companyInfo?.address ? (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPinIcon className="size-4 text-muted-foreground" />
                      所在地
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <address className="not-italic text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {settings.companyInfo.address}
                    </address>
                  </CardContent>
                </Card>
              ) : null}

              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <HelpCircleIcon className="size-4 text-muted-foreground" />
                    よくある質問
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    ご不明な点はまずFAQをご確認ください。
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/faq">FAQを見る</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
