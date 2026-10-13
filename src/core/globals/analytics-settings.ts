import type { GlobalConfig } from "payload"

import { hasAdminRole } from "@/core/lib/access/has-admin-role"
import { isAdminOrServiceAdmin } from "@/core/lib/access/is-admin-or-service-admin"
import { isServiceAdminField } from "@/core/lib/access/is-service-admin-field"
import { validateGa4PropertyId } from "@/core/lib/validation/validate-ga4-property-id"

/**
 * ダッシュボードのアクセス解析の設定。GA4 の鍵は DB に置かず、
 * 環境変数 GA4_SERVICE_ACCOUNT_JSON でのみ扱う。
 * プロパティ ID は導入時に実装会社が設定するため、更新はサービス管理者に限る。
 */
export const analyticsSettings: GlobalConfig = {
  slug: "analytics-settings",
  label: "アクセス解析設定",
  admin: {
    group: "システム",
    hidden: (args) => !hasAdminRole(args.user),
    description: "管理画面のダッシュボードに表示する GA4 のアクセス解析を設定します。",
  },
  access: {
    read: isAdminOrServiceAdmin,
    update: isAdminOrServiceAdmin,
  },
  fields: [
    {
      name: "propertyId",
      label: "GA4 プロパティ ID",
      type: "text",
      validate: validateGa4PropertyId,
      access: { update: isServiceAdminField },
      admin: {
        description:
          "GA4 の「管理 > プロパティの詳細」にある数字だけの ID です。G- から始まる測定 ID ではありません。変更できるのはサービス管理者だけです。",
      },
    },
    {
      name: "viewerRoles",
      label: "アクセス解析を見られるロール",
      type: "select",
      hasMany: true,
      defaultValue: ["admin"],
      options: [
        { label: "管理者", value: "admin" },
        { label: "編集者", value: "editor" },
      ],
      admin: {
        description:
          "サービス管理者は選択に関係なく常に見られます。何も選ばなければサービス管理者だけが見られます。",
      },
    },
  ],
}
