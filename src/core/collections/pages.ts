import type { CollectionConfig } from "payload"

import { isAdmin } from "@/core/lib/access/is-admin"
import { isAuthenticated } from "@/core/lib/access/is-authenticated"
import { publishedOrAuthenticated } from "@/core/lib/access/published-or-authenticated"
import { buildCollectionRevalidateAfterChange } from "@/core/lib/revalidate/build-collection-revalidate-after-change"
import { buildCollectionRevalidateAfterDelete } from "@/core/lib/revalidate/build-collection-revalidate-after-delete"

type PageDoc = { slug?: string }

const resolvePaths = (props: { doc: PageDoc }): string[] => {
  if (!props.doc.slug) return []
  return [`/${props.doc.slug}`]
}

export const pages: CollectionConfig = {
  slug: "pages",
  labels: {
    singular: "ページ",
    plural: "ページ一覧",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
    group: "コンテンツ",
  },
  access: {
    // 未ログイン訪問者には _status='published' のみ。エディタ/管理者は下書きも閲覧可。
    read: publishedOrAuthenticated,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAdmin,
  },
  fields: [
    {
      name: "title",
      label: "タイトル",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "slug",
      label: "スラッグ",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "body",
      label: "本文",
      type: "richText",
      localized: true,
    },
    // SEO の meta フィールドは seoPlugin が付与する (config-base の enableFreePages 分岐参照)。
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 2000,
      },
    },
  },
  hooks: {
    afterChange: [buildCollectionRevalidateAfterChange<PageDoc>(resolvePaths)],
    afterDelete: [buildCollectionRevalidateAfterDelete<PageDoc>(resolvePaths)],
  },
}
