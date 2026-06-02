import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/project/shared/ui/card'

type ServiceItem = {
  icon?: string | null
  title?: string | null
  description?: string | null
}

type Props = {
  data: {
    enabled?: boolean | null
    heading?: string | null
    subheading?: string | null
    items?: ServiceItem[] | null
  }
}

export function ServicesSection(props: Props) {
  if (!props.data.enabled) return null
  const items = props.data.items ?? []

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          {props.data.heading ? (
            <h2 className="text-3xl font-bold tracking-tight">{props.data.heading}</h2>
          ) : null}
          {props.data.subheading ? (
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              {props.data.subheading}
            </p>
          ) : null}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                {item.icon ? (
                  <div className="text-4xl mb-2">{item.icon}</div>
                ) : (
                  <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                    <div className="size-5 bg-primary rounded" />
                  </div>
                )}
                {item.title ? <CardTitle className="text-xl">{item.title}</CardTitle> : null}
              </CardHeader>
              {item.description ? (
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </CardContent>
              ) : null}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
