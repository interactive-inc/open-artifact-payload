import Link from 'next/link'
import React from 'react'
import '../../styles.css'

export default function ThanksPage() {
  return (
    <div className="py-32 text-center">
      <div className="max-w-xl mx-auto px-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          お問い合わせありがとうございました
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          お問い合わせを受け付けました。<br />
          担当者より3営業日以内にご連絡いたします。
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-brand text-white font-semibold rounded-md hover:bg-brand-dark transition-colors"
        >
          トップページへ戻る
        </Link>
      </div>
    </div>
  )
}
