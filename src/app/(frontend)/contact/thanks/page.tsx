import React from 'react'
import type { Metadata } from 'next'
import '../../styles.css'

export const metadata: Metadata = {
  title: 'お問い合わせありがとうございました',
}

export default function ThanksPage() {
  return (
    <div className="py-section text-center">
      <h1 className="mb-4 text-3xl font-bold">お問い合わせありがとうございました</h1>
      <p>担当者より順次ご連絡いたします</p>
    </div>
  )
}
