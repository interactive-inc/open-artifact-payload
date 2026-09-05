import { getPayload, handleEndpoints, type Payload } from "payload"
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test"

import config from "@/payload.config"
import type { User } from "@/payload-types"

let payload: Payload
let admin: User
let serviceAdmin: User
let editor: User
const adminKey = crypto.randomUUID()
const serviceKey = crypto.randomUUID()
const editorKey = crypto.randomUUID()

async function request(path: string, key?: string, body?: Record<string, unknown>) {
  return handleEndpoints({
    config: await config,
    request: new Request(`http://127.0.0.1:3000/api/${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        "content-type": "application/json",
        ...(key ? { authorization: `users API-Key ${key}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
  })
}

describe("認証情報・ロック解除・問い合わせのアクセス境界", () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const create = (roles: User["roles"], apiKey: string) =>
      payload.create({
        collection: "users",
        data: {
          email: `security-${crypto.randomUUID()}@example.com`,
          password: crypto.randomUUID(),
          roles,
          enableAPIKey: true,
          apiKey,
        },
      })
    admin = await create(["admin"], adminKey)
    serviceAdmin = await create(["admin", "serviceAdmin"], serviceKey)
    editor = await create(["editor"], editorKey)
  })

  afterAll(async () => {
    for (const user of [admin, serviceAdmin, editor]) {
      if (user) await payload.delete({ collection: "users", id: user.id })
    }
  })

  test("管理者でも他ユーザーのAPIキーを取得できず、本人のキーは利用できる", async () => {
    for (const path of [
      `users/${serviceAdmin.id}`,
      `users/${serviceAdmin.id}?select[apiKey]=true`,
    ]) {
      const response = await request(path, adminKey)
      expect(response.status).toBe(200)
      const doc = await response.json()
      expect(doc).not.toHaveProperty("apiKey")
    }
    const list = await request("users?depth=0&limit=1000", adminKey)
    const body = await list.json()
    expect(body).toEqual(
      expect.objectContaining({
        docs: expect.arrayContaining([expect.objectContaining({ id: serviceAdmin.id })]),
      }),
    )
    expect(JSON.stringify(body).includes(serviceKey)).toBe(false)
    const own = await request(`users/${serviceAdmin.id}`, serviceKey)
    expect(own.status).toBe(200)
    expect(JSON.stringify(await own.json()).includes(serviceKey)).toBe(true)
    expect((await request("globals/ai-translation-settings", adminKey)).status).toBe(403)
    expect((await request("globals/ai-translation-settings", serviceKey)).status).toBe(200)
  })

  test("編集者と一般管理者はサービス管理者のロックを解除できない", async () => {
    await payload.db.updateOne({
      collection: "users",
      id: serviceAdmin.id,
      data: { loginAttempts: 5, lockUntil: new Date(Date.now() + 3600000).toISOString() },
    })
    for (const key of [undefined, editorKey, adminKey]) {
      expect((await request("users/unlock", key, { email: serviceAdmin.email })).status).toBe(403)
    }
    const locked = await payload.db.findOne({
      collection: "users",
      where: { id: { equals: serviceAdmin.id } },
    })
    expect(locked).toHaveProperty("loginAttempts", 5)
    expect((await request("users/unlock", serviceKey, { email: serviceAdmin.email })).status).toBe(
      200,
    )
    const unlocked = await payload.db.findOne({
      collection: "users",
      where: { id: { equals: serviceAdmin.id } },
    })
    expect(unlocked).toMatchObject({ loginAttempts: 0, lockUntil: null })
  })

  test("一般管理者は編集者のロックを解除できる", async () => {
    await payload.db.updateOne({
      collection: "users",
      id: editor.id,
      data: { loginAttempts: 5, lockUntil: new Date(Date.now() + 3600000).toISOString() },
    })
    expect((await request("users/unlock", adminKey, { email: editor.email })).status).toBe(200)
  })

  test("匿名RESTの問い合わせ作成を拒否し、status指定でも検証経路を迂回できない", async () => {
    const email = `security-contact-${crypto.randomUUID()}@example.com`
    const response = await request("contact-submissions", undefined, {
      name: "テスト",
      email,
      message: "検証",
      status: "done",
    })
    expect(response.status).toBe(403)
    const saved = await payload.count({
      collection: "contact-submissions",
      where: { email: { equals: email } },
    })
    expect(saved.totalDocs).toBe(0)
  })

  test("管理者は問い合わせを登録・管理できる", async () => {
    const email = `security-admin-contact-${crypto.randomUUID()}@example.com`
    const response = await request("contact-submissions", adminKey, {
      name: "テスト",
      email,
      message: "管理者の登録",
      status: "inProgress",
    })
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual(
      expect.objectContaining({
        doc: expect.objectContaining({ status: "inProgress" }),
      }),
    )
    await payload.delete({ collection: "contact-submissions", where: { email: { equals: email } } })
  })
})
