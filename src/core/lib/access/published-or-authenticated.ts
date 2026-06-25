import type { Access } from 'payload'

/**
 * drafts: true の versioned collection で使う公開フロント向けの read access。
 * 未ログイン訪問者には _status='published' のレコードのみを返し、
 * ログイン済みのエディタ/管理者はすべて (下書き含む) 閲覧できる。
 *
 * Payload は read access 関数が返す where 条件を、コレクションの一覧/取得クエリに
 * 必ず適用するため、REST/GraphQL/Local API のいずれから叩かれても下書きが匿名に漏れない。
 */
export const publishedOrAuthenticated: Access = (args) => {
  if (args.req.user) return true
  return {
    _status: { equals: 'published' },
  }
}
