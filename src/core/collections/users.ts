import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/core/lib/access/is-admin'
import { isAdminField } from '@/core/lib/access/is-admin-field'
import { isAuthenticated } from '@/core/lib/access/is-authenticated'

export const users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'ユーザー',
    plural: 'ユーザー一覧',
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'roles', 'updatedAt'],
    group: 'システム',
  },
  auth: true,
  access: {
    // ログイン済みなら自分含むユーザー一覧を閲覧可。編集は admin 限定。
    read: isAuthenticated,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    // admin プロパティは boolean | Promise<boolean> しか返せない仕様のため直書き
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'roles',
      label: 'ロール',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['editor'],
      options: [
        { label: '管理者', value: 'admin' },
        { label: '編集者', value: 'editor' },
      ],
      access: {
        // roles は admin のみ編集可（自分自身を admin に昇格させる事故を防ぐ）
        update: isAdminField,
      },
      admin: {
        description: '管理者: 全権限。編集者: コンテンツ編集のみ可能（ユーザー追加・削除や設定変更は不可）。',
      },
    },
  ],
}
