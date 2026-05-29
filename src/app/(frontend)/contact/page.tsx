import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { ContactForm } from '@/core/frontend/forms/contact-form'
import '../styles.css'

export default async function ContactPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const settings = await payload.findGlobal({ slug: 'site-settings' })

  return (
    <div className="py-16">
      <h1 className="text-3xl font-bold text-center mb-8">お問い合わせ</h1>
      <ContactForm turnstileSiteKey={settings.turnstileSiteKey ?? undefined} />
    </div>
  )
}
