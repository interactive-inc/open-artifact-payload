import type { CollectionBeforeDeleteHook } from "payload"

/**
 * ユーザー削除前に、そのユーザーが所有する編集ロックを削除する。
 *
 * Payload の内部ロックは user relationship の行だけが外部キーの cascade で消えると、
 * 親の payload-locked-documents が孤立する。その状態で管理画面がロックを populate すると
 * user が undefined になり、グローバル編集画面が描画できなくなる。
 */
export const deleteUserDocumentLocks: CollectionBeforeDeleteHook = async ({ id, req }) => {
  await req.payload.db.deleteMany({
    collection: "payload-locked-documents",
    req,
    where: {
      and: [{ "user.value": { equals: id } }, { "user.relationTo": { equals: "users" } }],
    },
  })
}
