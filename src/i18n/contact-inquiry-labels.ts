import type { ContactInquiryType } from "@/core/inquiry/domain/contact-inquiry-type"
import type { Locale } from "@/i18n/locale-types"

/** 保存コードと表示文言を分け、全言語で全分類のラベルを必須にする。 */
export const contactInquiryLabels = {
  ja: {
    service: "サービスに関するお問い合わせ",
    estimate: "お見積もりのご依頼",
    consultation: "技術相談・ご相談",
    recruitment: "採用に関するお問い合わせ",
    media: "取材・メディアのお問い合わせ",
    other: "その他",
  },
  en: {
    service: "Service inquiries",
    estimate: "Request a quote",
    consultation: "Technical consultation",
    recruitment: "Recruitment inquiries",
    media: "Press and media inquiries",
    other: "Other",
  },
} satisfies Record<Locale, Record<ContactInquiryType, string>>
