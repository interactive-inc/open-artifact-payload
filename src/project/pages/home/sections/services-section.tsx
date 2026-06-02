import React from 'react'

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
    <section className="py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-end mb-16">
          <div className="md:col-span-7">
            {props.data.heading ? (
              <h2 className="text-3xl md:text-4xl font-heading font-semibold tracking-tight text-balance">
                {props.data.heading}
              </h2>
            ) : null}
          </div>
          {props.data.subheading ? (
            <p className="md:col-span-5 text-base text-muted-foreground leading-relaxed">
              {props.data.subheading}
            </p>
          ) : null}
        </div>

        <ul className="divide-y divide-foreground/10 border-t border-foreground/10">
          {items.map((item, index) => (
            <li
              key={index}
              className="group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-8 py-8 md:py-10 transition-colors hover:bg-muted/40"
            >
              <div className="md:col-span-1 font-heading text-sm text-muted-foreground tabular-nums pt-1">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div className="md:col-span-5">
                {item.title ? (
                  <h3 className="text-xl font-heading font-semibold tracking-tight">
                    {item.title}
                  </h3>
                ) : null}
              </div>
              {item.description ? (
                <p className="md:col-span-6 text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
