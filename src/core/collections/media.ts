import type { CollectionConfig } from "payload"

import { isAdmin } from "@/core/lib/access/is-admin"
import { isAuthenticated } from "@/core/lib/access/is-authenticated"
import { guardMediaFileSize } from "@/core/lib/validation/guard-media-file-size"
import {
  ALLOWED_MEDIA_MIME_TYPES,
  MEDIA_MAX_FILE_SIZE_MEGABYTES,
} from "@/core/lib/validation/media-limits"
import { SHORT_TEXT_MAX_LENGTH } from "@/core/lib/validation/text-limits"

export const media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: "メディア",
    plural: "メディア一覧",
  },
  admin: {
    group: "システム",
    description: `JPEG / PNG / WebP / GIF / AVIF、1 ファイル ${MEDIA_MAX_FILE_SIZE_MEGABYTES}MB まで`,
  },
  access: {
    read: () => true,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [guardMediaFileSize],
  },
  fields: [
    {
      name: "alt",
      label: "代替テキスト",
      type: "text",
      required: true,
      maxLength: SHORT_TEXT_MAX_LENGTH,
    },
  ],
  upload: {
    crop: false,
    focalPoint: false,
    // SVG はスクリプトを埋め込めるため既定では受け付けない。
    // 必要な案件だけ media-limits.ts の一覧へ "image/svg+xml" を追加する。
    mimeTypes: [...ALLOWED_MEDIA_MIME_TYPES],
  },
}
