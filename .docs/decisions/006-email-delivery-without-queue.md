# Queueを使わずにメール配信を信頼できる状態にする

## Status

Accepted

## Context

パスワード再設定メールは、Payloadにメールアダプタを渡していなかったため、管理画面とREST APIから再設定を要求できるのに実際には配送されず、consoleへ記録されるだけでした。問い合わせ通知はResend SDKを直接呼び、フォーム保存の直後に同期で待っていました。送信に失敗しても記録は残らず、運用者は通知が届かなかったこと自体に気づけません。再送する手段もありませんでした。

Cloudflare Queuesで非同期化する案は、Worker entryのカスタマイズと環境ごとのQueue作成、consumerの追加が必要になります。テンプレートの初期構成として重く、案件ごとのCloudflare設定も増えます。一方で問い合わせ通知は1件あたり1通で、量が多くなく、遅延の許容度も高い性質を持ちます。

## Decision

- Payload公式の`@payloadcms/email-resend`アダプタを唯一のメール基盤にする。`buildCoreConfig`の`email`へ渡し、認証メールと問い合わせ通知を同じ経路に載せる
- 送信元は`EMAIL_FROM`で設定する。未設定なら従来の`CONTACT_NOTIFICATION_FROM`を使う。`RESEND_API_KEY`か送信元が欠けている環境ではアダプタを渡さず、Payload既定のconsoleアダプタへフォールバックする
- 問い合わせレコードに配信状態を持たせる。`notificationStatus`、`notificationError`、`notifiedAt`の3フィールドを追加し、送信待ち、送信済み、送信失敗、送信スキップを管理画面の一覧と編集画面で見えるようにする
- 送信と状態更新は`deliverContactNotification`へ集約する。フォームからの初回送信も管理画面からの再送も同じ関数を通す
- 二重送信の防止はキューのidempotency keyではなく、レコードの状態ガードで行う。`notificationStatus`がすでに送信済みなら送信しない
- フォーム送信時の一時障害には、1秒待って1回だけ再試行する。それでも失敗した場合は送信失敗として記録し、フォームの成功応答は妨げない
- 管理画面の編集画面に「通知を再送」ボタンを置き、`POST /api/contact-submissions/:id/resend-notification`を叩く。実行できるのはadminとサービス管理者のみ
- ログに残す文字列は`sanitizeErrorMessage`を通す。メールアドレスを伏せ字にして200文字で打ち切り、本文や再設定トークンがログへ流れないようにする

## Consequences

- Cloudflareの追加リソースを作らずに、認証メールが実際に配送され、通知の失敗が可視化される
- 送信はリクエスト処理の中で完結するため、Resendの応答が遅いとフォーム送信の応答も遅くなる。再試行の1秒を含めて最悪1往復ぶん待つ
- 失敗した通知の復旧は運用者の手動操作になる。自動再試行は初回の1回だけで、その後の再送は管理画面から実行する
- 通知件数が増えて手動再送が現実的でなくなった場合、または送信の遅延がフォームの体感速度に影響する場合は、Cloudflare Queuesの導入を再検討する。そのときも配信状態フィールドはそのまま使えるため、consumerが同じ`deliverContactNotification`を呼ぶ形へ移行できる
- ローカル開発では既定でメールが送られない。パスワード再設定の動作確認はstaging以上で行う

関連: [[architecture]]、[[guide]]、[[domain]]
