import type { CollectionConfig } from "payload"

import { guardServiceAdminAccountChange } from "@/core/lib/access/guard-service-admin-account-change"
import { guardServiceAdminAccountDelete } from "@/core/lib/access/guard-service-admin-account-delete"
import { isAdmin } from "@/core/lib/access/is-admin"
import { isAdminField } from "@/core/lib/access/is-admin-field"
import { isUserAccount } from "@/core/lib/access/is-user-account"
import { readUsers } from "@/core/lib/access/read-users"

export const users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: "ユーザー",
    plural: "ユーザー一覧",
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "roles", "updatedAt"],
    group: "システム",
  },
  auth: {
    useAPIKey: true,
  },
  access: {
    // 管理ロール以外は自分自身だけを閲覧可。API Keyを含む他ユーザー情報を漏らさない。
    read: readUsers,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    // admin プロパティは boolean | Promise<boolean> しか返せない仕様のため直書き
    admin: (args) => isUserAccount(args.req.user),
  },
  hooks: {
    // serviceAdmin アカウントの更新・削除・ロール付与はサービス管理者のみ
    // （クライアント admin の自己昇格や、パスワード変更・削除による乗っ取り/無効化を防ぐ）
    beforeChange: [guardServiceAdminAccountChange],
    beforeDelete: [guardServiceAdminAccountDelete],
  },
  fields: [
    {
      name: "roles",
      label: "ロール",
      type: "select",
      hasMany: true,
      required: true,
      defaultValue: ["editor"],
      options: [
        { label: "管理者", value: "admin" },
        { label: "編集者", value: "editor" },
        { label: "サービス管理者（実装会社）", value: "serviceAdmin" },
      ],
      access: {
        // roles は admin のみ編集可（自分自身を admin に昇格させる事故を防ぐ）
        update: isAdminField,
      },
      admin: {
        description:
          "管理者: 全権限。編集者: コンテンツ編集のみ可能（ユーザー追加・削除や設定変更は不可）。サービス管理者: AI翻訳設定などサービス提供側の設定を扱う実装会社用ロール（付け外しはサービス管理者のみ可能）。",
      },
    },
  ],
}
