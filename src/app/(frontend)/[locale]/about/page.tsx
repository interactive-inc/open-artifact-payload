import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import Image from 'next/image'
import React from 'react'

import config from '@/payload.config'
import { resolveMediaUrl } from '@/core/lib/media/resolve-media-url'
import { Card, CardContent, CardHeader, CardTitle } from '@/project/shared/ui/card'
import { Badge } from '@/project/shared/ui/badge'
import { PageHeader } from '@/project/shared/sections/page-header'
import { isLocale } from '@/project/shared/lib/is-locale'
import { buildLocaleAlternates } from '@/project/shared/lib/build-locale-alternates'
import type { Locale } from '@/project/shared/lib/locale-types'
import type { Metadata } from 'next'

import '../styles.css'

type Props = {
  params: Promise<{ locale: string }>
}

function resolveLocale(locale: string): Locale {
  if (!isLocale(locale)) notFound()
  return locale
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const locale = resolveLocale(params.locale)
  return {
    title: locale === 'ja' ? '会社情報' : 'Company',
    alternates: { languages: buildLocaleAlternates('/about') },
  }
}

export default async function AboutPage(props: Props) {
  const params = await props.params
  const locale = resolveLocale(params.locale)
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const draftState = await draftMode()
  const isDraft = draftState.isEnabled
  const about = await payload.findGlobal({ slug: 'about', depth: 1, draft: isDraft, locale })

  return (
    <>
      {about.hero?.enabled ? (
        <PageHeader title={about.hero.title ?? ''} description={about.hero.subtitle} />
      ) : null}

      {about.mission?.enabled ? (
        <section className="py-20">
          <div className="container-site">
            <div className="text-center mb-12">
              {about.mission.heading ? (
                <h2 className="text-3xl font-bold tracking-tight">{about.mission.heading}</h2>
              ) : null}
              {about.mission.description ? (
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {about.mission.description}
                </p>
              ) : null}
            </div>
            {(about.mission.values ?? []).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
                {(about.mission.values ?? []).map((value, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <Badge
                          variant="outline"
                          className="size-8 rounded-full flex items-center justify-center p-0 text-sm font-bold"
                        >
                          {index + 1}
                        </Badge>
                        {value.title}
                      </CardTitle>
                    </CardHeader>
                    {value.description ? (
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                      </CardContent>
                    ) : null}
                  </Card>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {about.companyProfile?.enabled ? (
        <section className="py-20 bg-muted/30">
          <div className="container-site">
            {about.companyProfile.heading ? (
              <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
                {about.companyProfile.heading}
              </h2>
            ) : null}
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <tbody>
                    {(about.companyProfile.rows ?? []).map((row, index) => (
                      <tr key={index}>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground w-36 whitespace-nowrap border-b border-border">
                          {row.label}
                        </th>
                        <td className="px-6 py-4 text-sm border-b border-border leading-relaxed whitespace-pre-wrap">
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </section>
      ) : null}

      {about.members?.enabled ? (
        <section className="py-20">
          <div className="container-site">
            {about.members.heading ? (
              <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
                {about.members.heading}
              </h2>
            ) : null}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(about.members.items ?? []).map((member, index) => {
                const imageUrl = resolveMediaUrl(member.image as never)
                return (
                  <Card key={index} className="text-center">
                    <CardHeader className="items-center pb-2">
                      <div className="size-24 mx-auto mb-2 rounded-full overflow-hidden bg-muted">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={member.name}
                            width={96}
                            height={96}
                            className="object-cover size-full"
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center text-muted-foreground">
                            <svg
                              className="size-12"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      {member.position ? (
                        <Badge variant="secondary" className="mt-1">
                          {member.position}
                        </Badge>
                      ) : null}
                    </CardHeader>
                    {member.bio ? (
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {member.bio}
                        </p>
                      </CardContent>
                    ) : null}
                  </Card>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
