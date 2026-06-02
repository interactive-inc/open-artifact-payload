import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { ContactForm } from '@/core/frontend/forms/contact-form'
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
      <section className="bg-brand py-16 text-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold">お問い合わせ</h1>
          <p className="mt-4 text-lg opacity-90">
            サービスのご相談・お見積もりはお気軽にどうぞ
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 mb-6">お問い合わせフォーム</h2>
              <ContactForm
                turnstileSiteKey={settings.turnstileSiteKey ?? undefined}
                inquiryOptions={inquiryOptions}
              />
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">お電話でのお問い合わせ</h2>
                {settings.companyInfo?.tel ? (
                  <a href={`tel:${settings.companyInfo.tel.replace(/-/g, '')}`} className="text-2xl font-bold text-brand hover:underline">
                    {settings.companyInfo.tel}
                  </a>
                ) : null}
                <p className="text-sm text-gray-500 mt-1">平日 9:00〜18:00</p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">所在地</h2>
                {settings.companyInfo?.address ? (
                  <address className="not-italic text-sm text-gray-600 leading-relaxed">
                    {settings.companyInfo.address}
                  </address>
                ) : null}
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">よくある質問</h3>
                <p className="text-sm text-gray-600 mb-3">
                  ご不明な点はまずFAQをご確認ください。
                </p>
                <a href="/faq" className="text-sm text-brand font-medium hover:underline">
                  FAQを見る →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
