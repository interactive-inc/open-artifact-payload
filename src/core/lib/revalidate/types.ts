// 文字列はページ単位の revalidate。{ path, type:'layout' } は配下全体 (ヘッダー/フッター等) を revalidate する。
export type RevalidateTarget = string | { path: string; type: 'layout' | 'page' }

export type CollectionPathResolver<T = Record<string, unknown>> = (props: {
  doc: T
  previousDoc?: T
}) => RevalidateTarget[]

export type GlobalPathResolver = () => RevalidateTarget[]
