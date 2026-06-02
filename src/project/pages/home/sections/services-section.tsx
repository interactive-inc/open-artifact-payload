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
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          {props.data.heading ? (
            <h2 className="text-3xl font-bold text-gray-900">{props.data.heading}</h2>
          ) : null}
          {props.data.subheading ? (
            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">{props.data.subheading}</p>
          ) : null}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {item.icon ? (
                <div className="text-4xl mb-4">{item.icon}</div>
              ) : (
                <div className="w-12 h-12 bg-brand/10 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-brand rounded" />
                </div>
              )}
              {item.title ? (
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
              ) : null}
              {item.description ? (
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
