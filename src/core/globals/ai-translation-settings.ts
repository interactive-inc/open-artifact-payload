import type { GlobalConfig } from 'payload'

import { hasAdminRole } from '@/core/lib/access/has-admin-role'
import { isAdmin } from '@/core/lib/access/is-admin'
import { isAuthenticated } from '@/core/lib/access/is-authenticated'
import { translationModels } from '@/core/lib/ai-translation/translation-models'

/**
 * AI翻訳の運用設定。enabled のオン/オフが即時の提供開始・停止スイッチになる
 * （オフにしても保存済みの翻訳データはそのまま残る）。
 * API キーは DB に保存せず、環境変数（ANTHROPIC_API_KEY / OPENAI_API_KEY）でのみ扱う。
 */
export const aiTranslationSettings: GlobalConfig = {
  slug: 'ai-translation-settings',
  label: 'AI翻訳設定',
  admin: {
    group: 'システム',
    hidden: (args) => !hasAdminRole(args.user),
  },
  access: {
    // 管理画面のボタン表示判定などで editor も読むが、設定変更は admin のみ
    read: isAuthenticated,
    update: isAdmin,
  },
  fields: [
    {
      name: 'usageSummary',
      label: '利用状況',
      type: 'ui',
      admin: {
        components: {
          Field: '@/core/admin/ai-translation/usage-summary-field#UsageSummaryField',
        },
      },
    },
    {
      name: 'enabled',
      label: 'AI翻訳を有効にする',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          '月額プランの停止時はオフにすると即座に翻訳機能が止まります。保存済みの翻訳文は残り、手動での多言語入力も引き続き使えます。',
      },
    },
    {
      name: 'model',
      label: '翻訳モデル',
      type: 'select',
      required: true,
      defaultValue: 'anthropic/claude-haiku-4-5',
      options: translationModels.map((model) => ({ label: model.label, value: model.value })),
      admin: {
        description:
          'API キーは環境変数（ANTHROPIC_API_KEY / OPENAI_API_KEY）で設定します。管理画面からは設定できません。',
      },
    },
    {
      name: 'limits',
      label: '利用上限',
      type: 'group',
      admin: {
        description: '上限に達すると AI API を呼び出す前に翻訳を停止します（日本時間の月初に集計をリセット）。',
      },
      fields: [
        {
          name: 'monthlyRunLimit',
          label: '月間翻訳実行回数の上限',
          type: 'number',
          required: true,
          defaultValue: 100,
          min: 0,
        },
        {
          name: 'monthlyCharacterLimit',
          label: '月間翻訳文字数の上限',
          type: 'number',
          required: true,
          defaultValue: 300000,
          min: 0,
        },
        {
          name: 'monthlyCostLimitUsd',
          label: '月間推定API費用の上限（USD）',
          type: 'number',
          required: true,
          defaultValue: 10,
          min: 0,
        },
        {
          name: 'perRunCharacterLimit',
          label: '1回あたりの最大翻訳文字数',
          type: 'number',
          required: true,
          defaultValue: 20000,
          min: 0,
        },
        {
          name: 'cooldownSeconds',
          label: '連続実行の間隔下限（秒）',
          type: 'number',
          required: true,
          defaultValue: 30,
          min: 0,
        },
      ],
    },
  ],
}
