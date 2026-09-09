import React from "react"
import { PhoneIcon, MapPinIcon, HelpCircleIcon } from "lucide-react"
import { notFound } from "next/navigation"

import { ContactForm } from "@/core/frontend/forms/contact-form"
import { CONTACT_INQUIRY_TYPES } from "@/core/inquiry/domain/contact-inquiry-type"
import { contactInquiryLabels } from "@/i18n/contact-inquiry-labels"
import { loadSiteSettings } from "@/core/lib/load-site-settings"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/(frontend)/_ui/card"
import { Button } from "@/app/(frontend)/_ui/button"
import Link from "next/link"
import { PageHeader } from "@/app/(frontend)/_sections/page-header"
import { isLocale } from "@/i18n/is-locale"
import { withLocalePrefix } from "@/i18n/with-locale-prefix"
import { getUiDictionary } from "@/i18n/get-ui-dictionary"
import { buildLocaleAlternates } from "@/seo/build-locale-alternates"
import type { Locale } from "@/i18n/locale-types"
import type { Metadata } from "next"

import "../styles.css"

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
                inquiryOptions={CONTACT_INQUIRY_TYPES.map((value) => ({
                  value,
                  label: contactInquiryLabels[locale][value],
                }))}
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
