import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'
import { CheckIcon, ArrowRightIcon } from 'lucide-react'

import config from '@/payload.config'
import { Card, CardContent, CardHeader, CardTitle } from '@/project/shared/ui/card'
import { Badge } from '@/project/shared/ui/badge'
import { Button } from '@/project/shared/ui/button'
import { Separator } from '@/project/shared/ui/separator'
import { PageHeader } from '@/project/shared/sections/page-header'
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
        <PageHeader title={service.hero.title ?? ''} description={service.hero.subtitle} />
      ) : null}

      {service.services?.enabled ? (
        <section className="py-20">
          <div className="container-site">
            {service.services.heading ? (
              <h2 className="text-3xl font-bold tracking-tight text-center mb-16">
                {service.services.heading}
              </h2>
            ) : null}
            <div className="space-y-12">
              {(service.services.items ?? []).map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-8">
                    <div
                      className={`flex flex-col md:flex-row gap-10 items-start ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          {item.icon ? (
                            <span className="text-4xl">{item.icon}</span>
                          ) : (
                            <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <div className="size-6 bg-primary rounded" />
                            </div>
                          )}
                          <h3 className="text-2xl font-bold">{item.title}</h3>
                        </div>
                        {item.description ? (
                          <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                            {item.description}
                          </p>
                        ) : null}
                        {(item.features ?? []).length > 0 ? (
                          <ul className="space-y-2">
                            {(item.features ?? []).map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-center gap-2 text-sm">
                                <CheckIcon className="size-4 text-primary flex-shrink-0" />
                                {feature.text}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                      <div className="w-full md:w-48 flex-shrink-0">
                        <div className="aspect-square bg-muted rounded-2xl flex items-center justify-center">
                          {item.icon ? (
                            <span className="text-7xl">{item.icon}</span>
                          ) : (
                            <div className="size-16 bg-primary/20 rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {service.process?.enabled ? (
        <section className="py-20 bg-muted/30">
          <div className="container-site">
            {service.process.heading ? (
              <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
                {service.process.heading}
              </h2>
            ) : null}
            <div className="space-y-4">
              {(service.process.steps ?? []).map((step, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <Badge className="size-8 rounded-full flex items-center justify-center p-0 flex-shrink-0 text-sm font-bold">
                    {index + 1}
                  </Badge>
                  <Card className="flex-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{step.title}</CardTitle>
                    </CardHeader>
                    {step.description ? (
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </CardContent>
                    ) : null}
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {service.cta?.enabled ? (
        <section className="py-20 bg-foreground text-background">
          <div className="container-site text-center">
            {service.cta.heading ? (
              <h2 className="text-3xl font-bold tracking-tight mb-4">{service.cta.heading}</h2>
            ) : null}
            {service.cta.description ? (
              <p className="text-lg text-background/80 mb-8">{service.cta.description}</p>
            ) : null}
            {service.cta.ctaLabel && service.cta.ctaHref ? (
              <Button
                nativeButton={false}
                render={<Link href={service.cta.ctaHref} />}
                size="lg"
                variant="secondary"
              >
                {service.cta.ctaLabel}
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  )
}
