import React from 'react'
import type { Metadata } from 'next'

import { ContactForm } from '@/core/frontend/forms/contact-form'
import { loadSiteSettings } from '@/core/lib/load-site-settings'
import '../styles.css'

export const metadata: Metadata = {
  title: 'お問い合わせ',
}

export default async function ContactPage() {
  const settings = await loadSiteSettings()

  return (
    <div className="py-section-sm md:py-section">
      <h1 className="mb-8 text-center text-3xl font-bold">お問い合わせ</h1>
      <ContactForm turnstileSiteKey={settings.turnstileSiteKey ?? undefined} />
    </div>
  )
}
