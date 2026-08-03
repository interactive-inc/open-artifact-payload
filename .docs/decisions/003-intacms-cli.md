# Hiract型のintacms CLIを採用する

## Status

Accepted

## Context

JSONを直接渡す低水準コマンドはCIには適する一方、人が日常的に使うにはresource名、ID、操作を毎回オプションへ展開する必要がありました。案件ごとのローカル、staging、本番URLや認証情報をシェル環境変数だけで管理すると、本番誤操作と秘密の混在も起こりやすくなります。

## Decision

- 主コマンド名を `intacms` とし、`open-artifact` は互換aliasとして残す
- `<resource>`、`<resource> <id>`、`create / update / delete` のREST型コマンド体系を使う
- 書き込みフラグをJSON bodyへ変換し、boolean、number、null、JSONを自動型付けする
- `--local / --staging / --staging-blue / --prod` で環境を選び、指定なしはprodにする
- 本番URLは明示設定し、既定で有効なprod-lockにより本番操作へ `--prod` を要求する。本番削除は `--confirm` も要求する
- 非ローカルendpointはHTTPSに限定し、外部通信を30秒でtimeoutする
- 人のログインはPayload標準JWTを環境URL単位で `~/.config/intacms/accounts.json` へ保存する
- パスワードは非表示TTY入力だけで受け取り、argvの `--password` は拒否する。ログアウト時はサーバーsessionも失効する
- CIでは既存のUsers API Key環境変数を優先する
- CLIと公式MCPの公開リソースはSite Management Domainの共有カタログを正本にする
- 業務固有操作は汎用CLIルーターへ埋め込まず、Application use caseとして追加する

## Consequences

- 人は管理画面と同じメールアドレス・パスワードでログインし、短いコマンドで操作できる
- URLやセッションは環境ごとに保持され、prod-lockで意図しない本番接続を防げる
- CLIの引数処理を変更しても、CRUD ApplicationとPayload access / validation / hooksは重複しない
- 公開resourceの追加・削除はCLIとMCPへ同時に反映され、操作上限はチャネル別に安全側へ絞れる
- JWTには有効期限があるため、期限切れ時は再ログインが必要になる

関連: [[architecture]]、[[domain]]、[[features/site-tools]]、[[001-site-management-boundary]]、[[002-official-payload-mcp]]
