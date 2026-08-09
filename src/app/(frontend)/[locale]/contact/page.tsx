import React from "react"
import { PhoneIcon, MapPinIcon, HelpCircleIcon } from "lucide-react"
import { notFound } from "next/navigation"

import { ContactForm } from "@/core/frontend/forms/contact-form"
import { loadSiteSettings } from "@/core/lib/load-site-settings"
import { Card, CardContent, CardHeader, CardTitle } from "@/project/shared/ui/card"
import { Button } from "@/project/shared/ui/button"
import Link from "next/link"
import { PageHeader } from "@/project/shared/sections/page-header"
import { isLocale } from "@/project/shared/lib/is-locale"
import { withLocalePrefix } from "@/project/shared/lib/with-locale-prefix"
import { getUiDictionary } from "@/project/shared/lib/get-ui-dictionary"
import { buildLocaleAlternates } from "@/project/shared/lib/build-locale-alternates"
import type { Locale } from "@/project/shared/lib/locale-types"
import type { Metadata } from "next"

import "../styles.css"

type Props = {
  params: Promise<{ locale: string }>
}

function resolveLocale(locale: string): Locale {
  if (!isLocale(locale)) notFound()
  return locale
}

const inquiryOptionsByLocale: Record<Locale, Array<{ value: string; label: string }>> = {
  ja: [
    { value: "service", label: "サービスに関するお問い合わせ" },
    { value: "estimate", label: "お見積もりのご依頼" },
    { value: "consultation", label: "技術相談・ご相談" },
    { value: "recruitment", label: "採用に関するお問い合わせ" },
    { value: "media", label: "取材・メディアのお問い合わせ" },
    { value: "other", label: "その他" },
  ],
  en: [
    { value: "service", label: "Service inquiries" },
    { value: "estimate", label: "Request a quote" },
    { value: "consultation", label: "Technical consultation" },
    { value: "recruitment", label: "Recruitment inquiries" },
    { value: "media", label: "Press and media inquiries" },
    { value: "other", label: "Other" },
  ],
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const locale = resolveLocale(params.locale)
  const dictionary = getUiDictionary(locale)
  return {
    title: dictionary.contact.title,
    alternates: { languages: buildLocaleAlternates("/contact") },
  }
}

export default async function ContactPage(props: Props) {
  const params = await props.params
  const locale = resolveLocale(params.locale)
  const dictionary = getUiDictionary(locale)
  const settings = await loadSiteSettings(locale)

  return (
    <div>
      <PageHeader title={dictionary.contact.title} description={dictionary.contact.description} />

      <section className="py-16">
        <div className="container-site">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold mb-6">{dictionary.contact.formHeading}</h2>
              <ContactForm
                turnstileSiteKey={settings.turnstileSiteKey ?? undefined}
                inquiryOptions={inquiryOptionsByLocale[locale]}
                locale={locale}
              />
            </div>

            <div className="flex flex-col gap-4">
              {settings.companyInfo?.tel ? (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <PhoneIcon className="size-4 text-muted-foreground" />
                      {dictionary.contact.phoneHeading}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={`tel:${settings.companyInfo.tel.replace(/-/g, "")}`}
                      className="text-xl font-bold hover:underline"
                    >
                      {settings.companyInfo.tel}
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      {dictionary.contact.phoneHours}
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              {settings.companyInfo?.address ? (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPinIcon className="size-4 text-muted-foreground" />
                      {dictionary.contact.addressHeading}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <address className="not-italic text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {settings.companyInfo.address}
                    </address>
                  </CardContent>
                </Card>
              ) : null}

              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <HelpCircleIcon className="size-4 text-muted-foreground" />
                    {dictionary.contact.faqHeading}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {dictionary.contact.faqDescription}
                  </p>
                  <Button
                    nativeButton={false}
                    render={<Link href={withLocalePrefix(locale, "/faq")} />}
                    variant="outline"
                    size="sm"
                  >
                    {dictionary.contact.faqButton}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
