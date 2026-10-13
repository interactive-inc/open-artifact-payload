const CHANNEL_LABELS: ReadonlyMap<string, string> = new Map(
  Object.entries({
    Direct: "直接",
    "Organic Search": "自然検索",
    "Paid Search": "検索広告",
    "Organic Social": "SNS",
    "Paid Social": "SNS広告",
    Referral: "他サイトからのリンク",
    Email: "メール",
    Display: "ディスプレイ広告",
    "Organic Video": "動画",
    "Paid Video": "動画広告",
    Affiliates: "アフィリエイト",
    "Cross-network": "複数ネットワーク広告",
    "Organic Shopping": "ショッピング",
    "Paid Shopping": "ショッピング広告",
    "Paid Other": "その他の広告",
    "Mobile Push Notifications": "プッシュ通知",
    Unassigned: "不明",
  }),
)

/** GA4 の標準チャネルグループを日本語の表示名にする。知らない分類は元の名前のまま。 */
export function getChannelLabel(channel: string): string {
  return CHANNEL_LABELS.get(channel) ?? channel
}
