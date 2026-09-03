import type { GlobalConfig } from "payload"

import { isAuthenticated } from "@/core/lib/access/is-authenticated"
import { LONG_TEXT_MAX_LENGTH, SHORT_TEXT_MAX_LENGTH } from "@/core/lib/validation/text-limits"

export const aboutGlobal: GlobalConfig = {
  slug: "about",
  label: "会社概要",
  admin: {
    group: "コンテンツ",
  },
  access: {
    read: () => true,
    update: isAuthenticated,
  },
  fields: [
    {
      name: "hero",
      label: "ページヘッダー",
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
      ],
    },
    {
      name: "mission",
      label: "ミッション・ビジョン",
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
        {
          name: "values",
          label: "バリュー一覧",
          type: "array",
          maxRows: 4,
          fields: [
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
      name: "companyProfile",
      label: "会社情報",
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
          name: "rows",
          label: "情報一覧",
          type: "array",
          fields: [
            {
              name: "label",
              label: "項目名",
              type: "text",
              required: true,
              localized: true,
              maxLength: SHORT_TEXT_MAX_LENGTH,
            },
            {
              name: "value",
              label: "内容",
              type: "textarea",
              required: true,
              localized: true,
              maxLength: LONG_TEXT_MAX_LENGTH,
            },
          ],
        },
      ],
    },
    {
      name: "members",
      label: "メンバー紹介",
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
          label: "メンバー一覧",
          type: "array",
          maxRows: 8,
          fields: [
            {
              name: "name",
              label: "氏名",
              type: "text",
              required: true,
              localized: true,
              maxLength: SHORT_TEXT_MAX_LENGTH,
            },
            {
              name: "position",
              label: "役職・肩書",
              type: "text",
              localized: true,
              maxLength: SHORT_TEXT_MAX_LENGTH,
            },
            {
              name: "bio",
              label: "自己紹介",
              type: "textarea",
              localized: true,
              maxLength: LONG_TEXT_MAX_LENGTH,
            },
            { name: "image", label: "写真", type: "upload", relationTo: "media" },
          ],
        },
      ],
    },
  ],
  versions: { drafts: true },
}
