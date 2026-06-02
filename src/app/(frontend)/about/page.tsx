import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import Image from 'next/image'
import React from 'react'

import config from '@/payload.config'
import { resolveMediaUrl } from '@/core/lib/media'
import '../styles.css'

export default async function AboutPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const draftState = await draftMode()
  const isDraft = draftState.isEnabled
  const about = await payload.findGlobal({ slug: 'about', depth: 1, draft: isDraft })

  return (
    <>
      {about.hero?.enabled ? (
        <section className="bg-brand py-20 text-white">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h1 className="text-4xl font-bold">{about.hero.title}</h1>
            {about.hero.subtitle ? (
              <p className="mt-4 text-xl opacity-90 max-w-2xl mx-auto">{about.hero.subtitle}</p>
            ) : null}
          </div>
        </section>
      ) : null}

      {about.mission?.enabled ? (
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              {about.mission.heading ? (
                <h2 className="text-3xl font-bold text-gray-900">{about.mission.heading}</h2>
              ) : null}
              {about.mission.description ? (
                <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">{about.mission.description}</p>
              ) : null}
            </div>
            {(about.mission.values ?? []).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                {(about.mission.values ?? []).map((value, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{value.title}</h3>
                    </div>
                    {value.description ? (
                      <p className="text-gray-600 leading-relaxed">{value.description}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {about.companyProfile?.enabled ? (
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6">
            {about.companyProfile.heading ? (
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">{about.companyProfile.heading}</h2>
            ) : null}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <tbody>
                  {(about.companyProfile.rows ?? []).map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-40 whitespace-nowrap border-b border-gray-100">
                        {row.label}
                      </th>
                      <td className="px-6 py-4 text-sm text-gray-600 border-b border-gray-100 leading-relaxed whitespace-pre-wrap">
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      {about.members?.enabled ? (
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            {about.members.heading ? (
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">{about.members.heading}</h2>
            ) : null}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(about.members.items ?? []).map((member, index) => {
                const imageUrl = resolveMediaUrl(member.image as never)
                return (
                  <div key={index} className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                      {imageUrl ? (
                        <Image src={imageUrl} alt={member.name} width={128} height={128} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    {member.position ? (
                      <p className="text-sm text-brand font-medium mt-1">{member.position}</p>
                    ) : null}
                    {member.bio ? (
                      <p className="text-sm text-gray-600 mt-3 leading-relaxed">{member.bio}</p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
