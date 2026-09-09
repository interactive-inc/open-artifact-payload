import type { GlobalConfig } from "payload"

import { isAuthenticated } from "@/core/lib/access/is-authenticated"
import { buildGlobalRevalidateAfterChange } from "@/core/lib/revalidate/build-global-revalidate-after-change"
import {
  HREF_MAX_LENGTH,
  LONG_TEXT_MAX_LENGTH,
  SHORT_TEXT_MAX_LENGTH,
} from "@/core/lib/validation/text-limits"
import { validateLinkHref } from "@/core/lib/validation/validate-link-href"

export const homeGlobal: GlobalConfig = {
  slug: "home-page",
  label: "トップページ",
  admin: {
    group: "コンテンツ",
  },
  access: {
    read: () => true,
    update: isAuthenticated,
  },
  hooks: {
    // トップページ編集後に / を revalidate する。
    afterChange: [buildGlobalRevalidateAfterChange(() => ["/"])],
  },
  fields: [
    {
      name: "hero",
      label: "ヒーロー",
      type: "group",
      fields: [
        { name: "enabled", label: "表示する", type: "checkbox", defaultValue: true },
        {
          name: "title",
          label: "タイトル",
          type: "text",
          required: true,
          localized: true,
          maxLength: SHORT_TEXT_MAX_LENGTH,
        },
        {
          name: "subtitle",
          label: "サブタイトル",
          type: "textarea",
          localized: true,
          maxLength: LONG_TEXT_MAX_LENGTH,
        },
        { name: "image", label: "背景画像", type: "upload", relationTo: "media" },
        {
          name: "ctaLabel",
          label: "ボタンテキスト",
          type: "text",
          localized: true,
          maxLength: SHORT_TEXT_MAX_LENGTH,
        },
        {
          name: "ctaHref",
          label: "ボタンリンク",
          type: "text",
          maxLength: HREF_MAX_LENGTH,
          validate: validateLinkHref,
        },
      ],
    },
    {
      name: "services",
      label: "サービス紹介",
      type: "group",
      fields: [
        { name: "enabled", label: "表示する", type: "checkbox", defaultValue: true },
        {
          name: "heading",
          label: "見出し",
          type: "text",
          localized: true,
          maxLength: SHORT_TEXT_MAX_LENGTH,
        },
        {
          name: "subheading",
          label: "サブ見出し",
          type: "textarea",
          localized: true,
          maxLength: LONG_TEXT_MAX_LENGTH,
        },
        {
          name: "items",
          label: "サービス一覧",
          type: "array",
          maxRows: 6,
          fields: [
            {
              name: "icon",
              label: "アイコン（絵文字）",
              type: "text",
              maxLength: SHORT_TEXT_MAX_LENGTH,
            },
            {
              name: "title",
              label: "タイトル",
              type: "text",
              required: true,
              localized: true,
              maxLength: SHORT_TEXT_MAX_LENGTH,
            },
            {
              name: "description",
              label: "説明",
              type: "textarea",
              localized: true,
              maxLength: LONG_TEXT_MAX_LENGTH,
            },
          ],
        },
      ],
    },
    {
      name: "aboutPreview",
      label: "会社紹介",
      type: "group",
      fields: [
        { name: "enabled", label: "表示する", type: "checkbox", defaultValue: true },
        {
          name: "heading",
          label: "見出し",
          type: "text",
          localized: true,
          maxLength: SHORT_TEXT_MAX_LENGTH,
        },
        {
          name: "description",
          label: "説明",
          type: "textarea",
          localized: true,
          maxLength: LONG_TEXT_MAX_LENGTH,
        },
        { name: "image", label: "画像", type: "upload", relationTo: "media" },
        {
          name: "ctaLabel",
          label: "ボタンテキスト",
          type: "text",
          localized: true,
          maxLength: SHORT_TEXT_MAX_LENGTH,
        },
        {
          name: "ctaHref",
          label: "ボタンリンク",
          type: "text",
          maxLength: HREF_MAX_LENGTH,
          validate: validateLinkHref,
        },
      ],
    },
    {
      name: "featuredNews",
      label: "注目のお知らせ",
      type: "group",
      fields: [
        { name: "enabled", label: "表示する", type: "checkbox", defaultValue: true },
        {
          name: "heading",
          label: "見出し",
          type: "text",
          localized: true,
          maxLength: SHORT_TEXT_MAX_LENGTH,
        },
        {
          name: "items",
          label: "表示する記事",
          type: "relationship",
          relationTo: "news",
          hasMany: true,
          maxRows: 3,
        },
      ],
    },
    {
      name: "cta",
      label: "コールトゥアクション",
      type: "group",
      fields: [
        { name: "enabled", label: "表示する", type: "checkbox", defaultValue: false },
        {
          name: "heading",
          label: "見出し",
          type: "text",
          localized: true,
          maxLength: SHORT_TEXT_MAX_LENGTH,
        },
        {
          name: "description",
          label: "説明",
          type: "textarea",
          localized: true,
          maxLength: LONG_TEXT_MAX_LENGTH,
        },
        {
          name: "ctaLabel",
          label: "ボタンテキスト",
          type: "text",
          localized: true,
          maxLength: SHORT_TEXT_MAX_LENGTH,
        },
        {
          name: "ctaHref",
          label: "ボタンリンク",
          type: "text",
          maxLength: HREF_MAX_LENGTH,
          validate: validateLinkHref,
        },
      ],
    },
  ],
  versions: { drafts: true },
}
