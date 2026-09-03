import type { GlobalConfig } from "payload"

import { isAdmin } from "@/core/lib/access/is-admin"
import { buildGlobalRevalidateAfterChange } from "@/core/lib/revalidate/build-global-revalidate-after-change"
import {
  HREF_MAX_LENGTH,
  LONG_TEXT_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  SHORT_TEXT_MAX_LENGTH,
} from "@/core/lib/validation/text-limits"
import { validateHttpsUrl } from "@/core/lib/validation/validate-https-url"
import { validateLinkHref } from "@/core/lib/validation/validate-link-href"
import { validatePhone } from "@/core/lib/validation/validate-phone"

const LINK_DESCRIPTION =
  "/about のような内部パス、https:// から始まる URL、mailto:、tel: のみ指定できます"

export const siteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "サイト設定",
  admin: {
    group: "システム",
  },
  access: {
    // フロントから取得するため read は public。更新は admin のみ（サイト全体設定の事故防止）。
    read: () => true,
    update: isAdmin,
  },
  hooks: {
    // ヘッダー/フッターは全ページ共通のため layout 全体を revalidate する。
    afterChange: [buildGlobalRevalidateAfterChange(() => [{ path: "/", type: "layout" }])],
  },
  fields: [
    {
      name: "siteName",
      label: "サイト名",
      type: "text",
      required: true,
      localized: true,
      maxLength: SHORT_TEXT_MAX_LENGTH,
    },
    {
      name: "logo",
      label: "ロゴ画像",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "footerText",
      label: "フッターテキスト",
      type: "textarea",
      localized: true,
      maxLength: LONG_TEXT_MAX_LENGTH,
    },
    {
      name: "companyInfo",
      label: "会社情報",
      type: "group",
      fields: [
        {
          name: "address",
          label: "住所",
          type: "text",
          localized: true,
          maxLength: SHORT_TEXT_MAX_LENGTH,
        },
        {
          name: "tel",
          label: "TEL",
          type: "text",
          maxLength: PHONE_MAX_LENGTH,
          validate: validatePhone,
        },
        {
          name: "fax",
          label: "FAX",
          type: "text",
          maxLength: PHONE_MAX_LENGTH,
          validate: validatePhone,
        },
      ],
    },
    {
      name: "headerNav",
      label: "ヘッダーナビゲーション",
      type: "array",
      admin: {
        description: `表示順で並べる。${LINK_DESCRIPTION}`,
      },
      fields: [
        {
          name: "label",
          label: "ラベル",
          type: "text",
          required: true,
          localized: true,
          maxLength: SHORT_TEXT_MAX_LENGTH,
        },
        {
          name: "href",
          label: "リンク",
          type: "text",
          required: true,
          maxLength: HREF_MAX_LENGTH,
          validate: validateLinkHref,
          admin: { description: LINK_DESCRIPTION },
        },
      ],
    },
    {
      name: "footerNav",
      label: "フッターナビゲーション",
      type: "array",
      admin: {
        description: LINK_DESCRIPTION,
      },
      fields: [
        {
          name: "label",
          label: "ラベル",
          type: "text",
          required: true,
          localized: true,
          maxLength: SHORT_TEXT_MAX_LENGTH,
        },
        {
          name: "href",
          label: "リンク",
          type: "text",
          required: true,
          maxLength: HREF_MAX_LENGTH,
          validate: validateLinkHref,
          admin: { description: LINK_DESCRIPTION },
        },
      ],
    },
    {
      name: "policyLinks",
      label: "ポリシー系リンク",
      type: "array",
      admin: {
        description: `プライバシーポリシー、特定商取引法、サイトマップなど、フッター下部に出すリンク。${LINK_DESCRIPTION}`,
      },
      fields: [
        {
          name: "label",
          label: "ラベル",
          type: "text",
          required: true,
          localized: true,
          maxLength: SHORT_TEXT_MAX_LENGTH,
        },
        {
          name: "href",
          label: "リンク",
          type: "text",
          required: true,
          maxLength: HREF_MAX_LENGTH,
          validate: validateLinkHref,
          admin: { description: LINK_DESCRIPTION },
        },
      ],
    },
    {
      name: "social",
      label: "SNS リンク",
      type: "group",
      admin: {
        description: "https:// から始まる絶対 URL のみ指定できます",
      },
      fields: [
        {
          name: "twitter",
          label: "Twitter/X URL",
          type: "text",
          maxLength: HREF_MAX_LENGTH,
          validate: validateHttpsUrl,
        },
        {
          name: "facebook",
          label: "Facebook URL",
          type: "text",
          maxLength: HREF_MAX_LENGTH,
          validate: validateHttpsUrl,
        },
        {
          name: "instagram",
          label: "Instagram URL",
          type: "text",
          maxLength: HREF_MAX_LENGTH,
          validate: validateHttpsUrl,
        },
        {
          name: "youtube",
          label: "YouTube URL",
          type: "text",
          maxLength: HREF_MAX_LENGTH,
          validate: validateHttpsUrl,
        },
      ],
    },
    {
      name: "analytics",
      label: "解析タグ",
      type: "group",
      fields: [
        {
          name: "gaTagId",
          label: "Google Analytics タグ ID",
          type: "text",
          maxLength: SHORT_TEXT_MAX_LENGTH,
        },
        {
          name: "gtmId",
          label: "Google Tag Manager ID",
          type: "text",
          maxLength: SHORT_TEXT_MAX_LENGTH,
        },
      ],
    },
    {
      name: "turnstileSiteKey",
      label: "Cloudflare Turnstile サイトキー",
      type: "text",
      maxLength: SHORT_TEXT_MAX_LENGTH,
      admin: {
        description: "問い合わせフォームのスパム対策用",
      },
    },
  ],
}
