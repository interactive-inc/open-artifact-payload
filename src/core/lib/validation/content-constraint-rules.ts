import type { ConstraintRule } from "@/core/lib/validation/collect-constraint-violations"
import {
  HREF_MAX_LENGTH,
  LONG_TEXT_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  SHORT_TEXT_MAX_LENGTH,
  SLUG_MAX_LENGTH,
} from "@/core/lib/validation/text-limits"
import { validateHttpsUrl } from "@/core/lib/validation/validate-https-url"
import { validateLinkHref } from "@/core/lib/validation/validate-link-href"
import { validatePageSlug } from "@/core/lib/validation/validate-page-slug"
import { validatePhone } from "@/core/lib/validation/validate-phone"
import { validateSlug } from "@/core/lib/validation/validate-slug"

/**
 * コレクション / グローバルのフィールド定義に付けた制約を、既存データの監査でも同じ形で当てるための表。
 * フィールドへ制約を足したらこの表にも 1 行足す。paths の "[]" は配列フィールドを表す。
 */
export const COLLECTION_CONSTRAINT_RULES: Record<string, ReadonlyArray<ConstraintRule>> = {
  media: [{ path: "alt", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null }],
  news: [
    { path: "title", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "slug", maxLength: SLUG_MAX_LENGTH, validate: validateSlug },
  ],
  faq: [
    { path: "question", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "answer", maxLength: LONG_TEXT_MAX_LENGTH, validate: null },
  ],
  pages: [
    { path: "title", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "slug", maxLength: SLUG_MAX_LENGTH, validate: validatePageSlug },
  ],
  works: [
    { path: "title", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "slug", maxLength: SLUG_MAX_LENGTH, validate: validateSlug },
    { path: "summary", maxLength: LONG_TEXT_MAX_LENGTH, validate: null },
  ],
}

export const GLOBAL_CONSTRAINT_RULES: Record<string, ReadonlyArray<ConstraintRule>> = {
  "site-settings": [
    { path: "siteName", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "footerText", maxLength: LONG_TEXT_MAX_LENGTH, validate: null },
    { path: "companyInfo.address", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "companyInfo.tel", maxLength: PHONE_MAX_LENGTH, validate: validatePhone },
    { path: "companyInfo.fax", maxLength: PHONE_MAX_LENGTH, validate: validatePhone },
    { path: "headerNav[].label", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "headerNav[].href", maxLength: HREF_MAX_LENGTH, validate: validateLinkHref },
    { path: "footerNav[].label", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "footerNav[].href", maxLength: HREF_MAX_LENGTH, validate: validateLinkHref },
    { path: "policyLinks[].label", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "policyLinks[].href", maxLength: HREF_MAX_LENGTH, validate: validateLinkHref },
    { path: "social.twitter", maxLength: HREF_MAX_LENGTH, validate: validateHttpsUrl },
    { path: "social.facebook", maxLength: HREF_MAX_LENGTH, validate: validateHttpsUrl },
    { path: "social.instagram", maxLength: HREF_MAX_LENGTH, validate: validateHttpsUrl },
    { path: "social.youtube", maxLength: HREF_MAX_LENGTH, validate: validateHttpsUrl },
    { path: "analytics.gaTagId", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "analytics.gtmId", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "turnstileSiteKey", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
  ],
  "home-page": [
    { path: "hero.title", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "hero.subtitle", maxLength: LONG_TEXT_MAX_LENGTH, validate: null },
    { path: "hero.ctaLabel", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "hero.ctaHref", maxLength: HREF_MAX_LENGTH, validate: validateLinkHref },
    { path: "services.heading", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "services.subheading", maxLength: LONG_TEXT_MAX_LENGTH, validate: null },
    { path: "services.items[].icon", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "services.items[].title", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "services.items[].description", maxLength: LONG_TEXT_MAX_LENGTH, validate: null },
    { path: "aboutPreview.heading", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "aboutPreview.description", maxLength: LONG_TEXT_MAX_LENGTH, validate: null },
    { path: "aboutPreview.ctaLabel", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "aboutPreview.ctaHref", maxLength: HREF_MAX_LENGTH, validate: validateLinkHref },
    { path: "featuredNews.heading", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "cta.heading", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "cta.description", maxLength: LONG_TEXT_MAX_LENGTH, validate: null },
    { path: "cta.ctaLabel", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "cta.ctaHref", maxLength: HREF_MAX_LENGTH, validate: validateLinkHref },
  ],
  about: [
    { path: "hero.title", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "hero.subtitle", maxLength: LONG_TEXT_MAX_LENGTH, validate: null },
    { path: "mission.heading", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "mission.description", maxLength: LONG_TEXT_MAX_LENGTH, validate: null },
    { path: "mission.values[].title", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "mission.values[].description", maxLength: LONG_TEXT_MAX_LENGTH, validate: null },
    { path: "companyProfile.heading", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "companyProfile.rows[].label", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "companyProfile.rows[].value", maxLength: LONG_TEXT_MAX_LENGTH, validate: null },
    { path: "members.heading", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "members.items[].name", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "members.items[].position", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "members.items[].bio", maxLength: LONG_TEXT_MAX_LENGTH, validate: null },
  ],
  service: [
    { path: "hero.title", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "hero.subtitle", maxLength: LONG_TEXT_MAX_LENGTH, validate: null },
    { path: "services.heading", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "services.items[].icon", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "services.items[].title", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "services.items[].description", maxLength: LONG_TEXT_MAX_LENGTH, validate: null },
    { path: "services.items[].features[].text", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "process.heading", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "process.steps[].title", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "process.steps[].description", maxLength: LONG_TEXT_MAX_LENGTH, validate: null },
    { path: "cta.heading", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "cta.description", maxLength: LONG_TEXT_MAX_LENGTH, validate: null },
    { path: "cta.ctaLabel", maxLength: SHORT_TEXT_MAX_LENGTH, validate: null },
    { path: "cta.ctaHref", maxLength: HREF_MAX_LENGTH, validate: validateLinkHref },
  ],
}
