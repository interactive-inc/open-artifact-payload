import { findSiteResource } from './resource-catalog'

export const CLI_HELP = `Inta CMS CLI

基本:
  intacms login --local --email admin@example.com
  intacms news --local
  intacms news <id> --local
  intacms news create --local --title "お知らせ" --slug notice --category info --draft
  intacms news <id> update --local --title "変更後"
  intacms news <id> delete --local
  intacms news <id> delete --prod --confirm
  intacms site-settings --local
  intacms site-settings update --local --site-name "新しいサイト名"

環境:
  --local
  --staging, --stg, --beta
  --staging-blue, --stg-blue
  --prod                         指定なしはprod

設定:
  intacms config get
  intacms config set endpoint.prod https://example.com
  intacms config set endpoint.staging https://staging.example.com
  intacms config set prod-lock true

安全策:
  パスワードは端末で非表示入力します。--password は履歴漏えい防止のため使えません。
  本番は既定でロックされ、明示 --prod が必要です。
  本番削除はさらに --confirm が必要です。非ローカルURLはHTTPSのみ許可します。

探す:
  intacms commands
  intacms commands --q news
  intacms news --help

値は true / false / null / number / JSON を自動型付けします。
数字に見える文字列は --room '"9"' のようにJSON文字列で指定します。
CIではOPEN_ARTIFACT_ENDPOINTとOPEN_ARTIFACT_API_KEYも利用できます。
従来の open-artifact collections ... 形式も互換コマンドとして残しています。
`

export function buildResourceHelp(slug: string): string {
  const resource = findSiteResource(slug)
  if (resource instanceof Error) return CLI_HELP
  if (resource.kind === 'global') {
    return `${resource.description} (${resource.slug})

  intacms ${resource.slug} [environment] [--locale ja] [--draft] [--depth 0]
  intacms ${resource.slug} update [environment] [field flags]

書き込みフラグはcamelCaseへ変換してJSON bodyになります。
例: --site-name "サイト名" -> { "siteName": "サイト名" }
`
  }

  return `${resource.description} (${resource.slug})

  intacms ${resource.slug} [environment] [--limit 10] [--page 1] [--locale ja]
  intacms ${resource.slug} <id> [view] [environment]
  intacms ${resource.slug} create [environment] [field flags]
  intacms ${resource.slug} <id> update [environment] [field flags]
  intacms ${resource.slug} <id> delete [environment] [--confirm]

書き込みフラグはcamelCaseへ変換してJSON bodyになります。
例: --published-at 2026-08-03T00:00:00.000Z -> { "publishedAt": "..." }
`
}
