import type { CollectionConfig } from 'payload'

import { hasAdminRole } from '@/core/lib/access/has-admin-role'
import { isAdmin } from '@/core/lib/access/is-admin'

/**
 * AI翻訳の監査ログ。作成はサーバー内部処理（overrideAccess）のみで、
 * 管理画面・REST からの作成/編集/削除は全ロールに対して禁止。
 * 月間利用上限の集計元にもなる。
 */
export const aiTranslationLogs: CollectionConfig = {
  slug: 'ai-translation-logs',
  labels: {
    singular: 'AI翻訳ログ',
    plural: 'AI翻訳ログ',
  },
  admin: {
    useAsTitle: 'targetTitle',
    defaultColumns: ['targetTitle', 'status', 'targetLocale', 'characterCount', 'estimatedCostUsd', 'createdAt'],
    group: 'システム',
    hidden: (args) => !hasAdminRole(args.user),
  },
  access: {
    read: isAdmin,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'targetKind',
      label: '対象種別',
      type: 'select',
      required: true,
      options: [
        { label: 'コレクション', value: 'collection' },
        { label: 'グローバル', value: 'global' },
      ],
      admin: { readOnly: true },
    },
    { name: 'targetSlug', label: '対象スラッグ', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'targetId', label: '対象ID', type: 'text', admin: { readOnly: true } },
    { name: 'targetTitle', label: '対象タイトル', type: 'text', admin: { readOnly: true } },
    {
      name: 'executedBy',
      label: '実行者',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
    },
    { name: 'sourceLocale', label: '翻訳元言語', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'targetLocale', label: '翻訳先言語', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'model', label: '使用モデル', type: 'text', required: true, admin: { readOnly: true } },
    {
      name: 'status',
      label: '結果',
      type: 'select',
      required: true,
      options: [
        { label: '成功', value: 'succeeded' },
        { label: '失敗', value: 'failed' },
        { label: '上限・条件により拒否', value: 'rejected' },
      ],
      admin: { readOnly: true },
    },
    { name: 'characterCount', label: '原文文字数', type: 'number', admin: { readOnly: true } },
    { name: 'inputTokens', label: '入力トークン数', type: 'number', admin: { readOnly: true } },
    { name: 'outputTokens', label: '出力トークン数', type: 'number', admin: { readOnly: true } },
    {
      name: 'estimatedCostUsd',
      label: '推定API費用（USD）',
      type: 'number',
      admin: { readOnly: true },
    },
    {
      name: 'translatedFieldCount',
      label: '翻訳フィールド数',
      type: 'number',
      admin: { readOnly: true },
    },
    {
      name: 'skippedFieldCount',
      label: 'スキップフィールド数',
      type: 'number',
      admin: { readOnly: true },
    },
    { name: 'errorMessage', label: 'エラー内容', type: 'textarea', admin: { readOnly: true } },
  ],
}
