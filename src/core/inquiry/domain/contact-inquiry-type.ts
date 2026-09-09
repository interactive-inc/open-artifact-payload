export const CONTACT_INQUIRY_TYPES = [
  "service",
  "estimate",
  "consultation",
  "recruitment",
  "media",
  "other",
] as const

export type ContactInquiryType = (typeof CONTACT_INQUIRY_TYPES)[number]
