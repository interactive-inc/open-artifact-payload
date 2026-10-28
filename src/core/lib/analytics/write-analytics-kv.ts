import type { Payload } from "payload"

type Props = {
  payload: Payload
  key: string
  value: object
}

/**
 * KV へ保存する。Payload 3.90 の kv.set は D1 アダプタで upsert が更新としてしか動かず、
 * 新しいキーを黙って保存しないため、削除してから作り直す。
 * 同時に書いて一意制約に当たっても、一時保存なので次の取得で上書きされる。
 */
export async function writeAnalyticsKv(props: Props): Promise<null | Error> {
  try {
    await props.payload.kv.delete(props.key)

    await props.payload.db.create({
      collection: "payload-kv",
      data: { key: props.key, data: props.value },
      req: {},
      returning: false,
    })

    return null
  } catch (error) {
    return error instanceof Error ? error : new Error("failed to write the analytics cache")
  }
}
