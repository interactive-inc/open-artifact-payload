import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import config from '@/payload.config'
import '../styles.css'

export default async function ServicePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const draftState = await draftMode()
  const isDraft = draftState.isEnabled
  const service = await payload.findGlobal({ slug: 'service', depth: 1, draft: isDraft })

  return (
    <>
      {service.hero?.enabled ? (
        <section className="bg-brand py-20 text-white">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h1 className="text-4xl font-bold">{service.hero.title}</h1>
            {service.hero.subtitle ? (
              <p className="mt-4 text-xl opacity-90 max-w-2xl mx-auto">{service.hero.subtitle}</p>
            ) : null}
          </div>
        </section>
      ) : null}

      {service.services?.enabled ? (
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            {service.services.heading ? (
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">{service.services.heading}</h2>
            ) : null}
            <div className="space-y-16">
              {(service.services.items ?? []).map((item, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row gap-10 items-start ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      {item.icon ? (
                        <span className="text-4xl">{item.icon}</span>
                      ) : (
                        <div className="w-12 h-12 bg-brand/10 rounded-lg flex items-center justify-center">
                          <div className="w-6 h-6 bg-brand rounded" />
                        </div>
                      )}
                      <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
                    </div>
                    {item.description ? (
                      <p className="text-gray-600 leading-relaxed text-lg mb-6">{item.description}</p>
                    ) : null}
                    {(item.features ?? []).length > 0 ? (
                      <ul className="space-y-2">
                        {(item.features ?? []).map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2 text-gray-700">
                            <svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature.text}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div className="flex-1 md:max-w-xs">
                    <div className="aspect-square bg-gradient-to-br from-brand/10 to-brand-dark/10 rounded-2xl flex items-center justify-center">
                      {item.icon ? (
                        <span className="text-8xl">{item.icon}</span>
                      ) : (
                        <div className="w-24 h-24 bg-brand/20 rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {service.process?.enabled ? (
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6">
            {service.process.heading ? (
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">{service.process.heading}</h2>
            ) : null}
            <div className="space-y-6">
              {(service.process.steps ?? []).map((step, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-brand text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-lg">{step.title}</h3>
                    {step.description ? (
                      <p className="text-gray-600 mt-2 leading-relaxed">{step.description}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {service.cta?.enabled ? (
        <section className="py-20 bg-brand-dark text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            {service.cta.heading ? (
              <h2 className="text-3xl font-bold mb-4">{service.cta.heading}</h2>
            ) : null}
            {service.cta.description ? (
              <p className="text-lg opacity-90 mb-8">{service.cta.description}</p>
            ) : null}
            {service.cta.ctaLabel && service.cta.ctaHref ? (
              <Link
                href={service.cta.ctaHref}
                className="inline-block px-8 py-4 bg-accent text-white rounded-md font-semibold hover:bg-accent/90 transition-colors"
              >
                {service.cta.ctaLabel}
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  )
}
