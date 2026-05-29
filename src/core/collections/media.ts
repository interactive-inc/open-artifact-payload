import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/core/lib/access/is-admin'
import { isAuthenticated } from '@/core/lib/access/is-authenticated'

export const media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'メディア',
    plural: 'メディア一覧',
  },
  admin: {
    group: 'システム',
  },
  access: {
    read: () => true,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'alt',
      label: '代替テキスト',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    crop: false,
    focalPoint: false,
  },
}
