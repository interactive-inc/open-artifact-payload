import Link from "next/link"
import { notFound } from "next/navigation"
import React from "react"
import { CheckCircleIcon } from "lucide-react"

import type { Metadata } from "next"

import { Button } from "@/project/shared/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/project/shared/ui/card"
import { isLocale } from "@/project/shared/lib/is-locale"
import { withLocalePrefix } from "@/project/shared/lib/with-locale-prefix"
import { getUiDictionary } from "@/project/shared/lib/get-ui-dictionary"
import { buildLocaleAlternates } from "@/project/shared/lib/build-locale-alternates"
import type { Locale } from "@/project/shared/lib/locale-types"
import "../../styles.css"

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
    title: dictionary.contact.thanksTitle,
    alternates: { languages: buildLocaleAlternates("/contact/thanks") },
  }
}

export default async function ThanksPage(props: Props) {
  const params = await props.params
  const locale = resolveLocale(params.locale)
  const dictionary = getUiDictionary(locale)

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16 px-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircleIcon className="size-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">{dictionary.contact.thanksTitle}</CardTitle>
          <CardDescription className="text-base">
            {dictionary.contact.thanksDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {dictionary.contact.thanksBody}
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button
            nativeButton={false}
            render={<Link href={withLocalePrefix(locale, "/")} />}
            variant="outline"
          >
            {dictionary.contact.backToHome}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
