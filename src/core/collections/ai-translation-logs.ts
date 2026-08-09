import type { CollectionConfig } from "payload"

import { hasAdminRole } from "@/core/lib/access/has-admin-role"
import { hasServiceAdminRole } from "@/core/lib/access/has-service-admin-role"
import { isAdminOrServiceAdmin } from "@/core/lib/access/is-admin-or-service-admin"
import { isServiceAdminField } from "@/core/lib/access/is-service-admin-field"

/**
 * AI翻訳の監査ログ。クライアントの admin も閲覧できる利用状況の画面を兼ねる
 * （一覧上部に当月の利用状況パネルを表示）。推定API費用はサービス管理者のみ閲覧可。
 * 作成はサーバー内部処理（overrideAccess）のみで、
 * 管理画面・REST からの作成/編集/削除は全ロールに対して禁止。
 * 月間利用上限の集計元にもなる。
 */
export const aiTranslationLogs: CollectionConfig = {
  slug: "ai-translation-logs",
  labels: {
    singular: "AI翻訳ログ",
    plural: "AI翻訳ログ",
  },
  admin: {
    useAsTitle: "targetTitle",
    defaultColumns: ["targetTitle", "status", "targetLocale", "characterCount", "createdAt"],
    group: "システム",
    // serviceAdmin 単独のアカウント（実装会社の推奨構成）でも費用監査のためログを読める
    hidden: (args) => !hasAdminRole(args.user) && !hasServiceAdminRole(args.user),
    components: {
      beforeListTable: [
        "@/core/admin/ai-translation/usage-summary-before-list#UsageSummaryBeforeList",
      ],
    },
  },
  access: {
    read: isAdminOrServiceAdmin,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: "targetKind",
      label: "対象種別",
      type: "select",
      required: true,
      options: [
        { label: "コレクション", value: "collection" },
        { label: "グローバル", value: "global" },
      ],
      admin: { readOnly: true },
    },
    {
      name: "targetSlug",
      label: "対象スラッグ",
      type: "text",
      required: true,
      admin: { readOnly: true },
    },
    { name: "targetId", label: "対象ID", type: "text", admin: { readOnly: true } },
    { name: "targetTitle", label: "対象タイトル", type: "text", admin: { readOnly: true } },
    {
      name: "executedBy",
      label: "実行者",
      type: "relationship",
      relationTo: "users",
      admin: { readOnly: true },
    },
    {
      name: "sourceLocale",
      label: "翻訳元言語",
      type: "text",
      required: true,
      admin: { readOnly: true },
    },
    {
      name: "targetLocale",
      label: "翻訳先言語",
      type: "text",
      required: true,
      admin: { readOnly: true },
    },
    { name: "model", label: "使用モデル", type: "text", required: true, admin: { readOnly: true } },
    {
      name: "status",
      label: "結果",
      type: "select",
      required: true,
      options: [
        { label: "実行中", value: "pending" },
        { label: "成功", value: "succeeded" },
        { label: "失敗", value: "failed" },
        { label: "上限・条件により拒否", value: "rejected" },
      ],
      admin: { readOnly: true },
    },
    { name: "characterCount", label: "原文文字数", type: "number", admin: { readOnly: true } },
    { name: "inputTokens", label: "入力トークン数", type: "number", admin: { readOnly: true } },
    { name: "outputTokens", label: "出力トークン数", type: "number", admin: { readOnly: true } },
    {
      name: "estimatedCostUsd",
      label: "推定API費用（USD）",
      type: "number",
      access: {
        // 原価はクライアントに見せない（サービス管理者のみ）
        read: isServiceAdminField,
      },
      admin: { readOnly: true },
    },
    {
      name: "translatedFieldCount",
      label: "翻訳フィールド数",
      type: "number",
      admin: { readOnly: true },
    },
    {
      name: "skippedFieldCount",
      label: "スキップフィールド数",
      type: "number",
      admin: { readOnly: true },
    },
    { name: "errorMessage", label: "エラー内容", type: "textarea", admin: { readOnly: true } },
  ],
}
