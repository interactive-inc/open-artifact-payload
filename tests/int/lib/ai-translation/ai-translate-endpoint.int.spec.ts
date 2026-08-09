import { getPayload, type Payload, type PayloadRequest } from "payload"
import { beforeAll, describe, expect, it } from "vite-plus/test"

import config from "@/payload.config"
import { aiTranslateEndpoint } from "@/core/lib/ai-translation/ai-translate-endpoint"

let payload: Payload

// PayloadRequest の部分モック（tests/** はフレームワークオブジェクトの部分モックに限り assertion 許可）
const buildRequest = (props: { user: unknown; body: unknown }): PayloadRequest =>
  ({
    payload,
    user: props.user,
    json: () => Promise.resolve(props.body),
  }) as unknown as PayloadRequest

describe("aiTranslateEndpoint", () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it("POST /api/ai-translate として登録されている", () => {
    expect(aiTranslateEndpoint.path).toBe("/ai-translate")
    expect(aiTranslateEndpoint.method).toBe("post")
  })

  it("未ログインは 401", async () => {
    const response = await aiTranslateEndpoint.handler(
      buildRequest({
        user: null,
        body: {
          targetKind: "collection",
          targetSlug: "news",
          targetId: "1",
          targetLocale: "en",
        },
      }),
    )

    expect(response.status).toBe(401)
  })

  it("JSON として不正な body も 500 ではなく 400", async () => {
    const admin = await payload.create({
      collection: "users",
      data: {
        email: `endpoint-badjson-${Date.now()}@example.com`,
        password: "test-password-1234",
        roles: ["admin"],
      },
    })

    const response = await aiTranslateEndpoint.handler({
      payload,
      user: admin,
      json: () => Promise.reject(new SyntaxError("Unexpected token")),
    } as unknown as PayloadRequest)

    expect(response.status).toBe(400)
  })

  it("不正な body は 400", async () => {
    const admin = await payload.create({
      collection: "users",
      data: {
        email: `endpoint-${Date.now()}@example.com`,
        password: "test-password-1234",
        roles: ["admin"],
      },
    })

    const response = await aiTranslateEndpoint.handler(
      buildRequest({ user: admin, body: { targetKind: "chat", freePrompt: "何でも答えて" } }),
    )

    expect(response.status).toBe(400)
  })
})
