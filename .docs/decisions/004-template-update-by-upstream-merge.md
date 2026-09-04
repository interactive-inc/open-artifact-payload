# 雛形更新をテンプレート main の Git マージで配布する

## Status

Accepted

## Context

テンプレートの修正はセキュリティ修正、依存更新、マイグレーション、CLI パッケージ、テスト、運用文書に及び、`src/core/` だけに閉じません。以前の案内は `git subtree pull --prefix=src/core upstream main` でしたが、テンプレートの `main` は split 済みブランチではないため、実行すると `src/core/src/core/...` と入れ子になり、`src/core/` 以外の変更は案件に届きませんでした。

検討した選択肢は次のとおりです。

- subtree 方式の修正: `git subtree split` で `src/core` だけのブランチを配布する。`src/migrations/`、`packages/`、ルート設定、`bun.lock` が対象外のまま残るため却下
- 所有境界の manifest と専用 sync コマンド: dry-run、競合一覧、fixture 案件での更新 E2E を備える。案件数が少ない段階では保守対象が増え、Git が既に持つ差分・競合・履歴の機能を再実装することになるため見送り
- テンプレート `main` の Git マージ: 既存の Git 運用だけで全ファイルを対象にできる。競合の判断基準を所有境界として文書化すれば運用できるため採用

## Decision

- 案件リポジトリはテンプレートを clone して作成し、テンプレートを `upstream` remote として保持する
- 更新は `git merge upstream/main` で取り込む。履歴を共有しない既存案件は、初回だけ最初のコミットをテンプレートの元コミットへ `git replace --graft` で接ぎ木してからマージする（履歴を書き換えず force push も不要。`--allow-unrelated-histories` は全ファイルが競合するため使わない）。取り込みは merge commit で行い、squash しない
- 競合の判断基準は [[architecture]] の「コード所有境界」に置き、テンプレート所有は upstream、案件所有は案件、共有編集は両方を残す
- 専用 sync コマンド、manifest による自動マージ、fixture 案件による更新 E2E は導入しない。マージ運用で競合が常態化した領域が見えてから判断する

## Consequences

- `src/migrations/`、`packages/`、ルート設定、`bun.lock`、テストが更新対象に含まれる
- 案件が `src/core/` を直接変更すると毎回競合するため、読み取り専用の規約が運用上も強制される
- テンプレート側は `main` を常にマージ可能な状態に保つ必要がある。運用者に影響する変更は CHANGELOG に記録し、案件はマージ前に差分を確認する
- 一括更新の自動化が必要になった場合は、この決定を改訂して manifest と sync コマンドを検討する

関連: [[architecture]]、[[guide]]
