import { getPayload, handleEndpoints, type Payload } from "payload"
import { GRAPHQL_POST } from "@payloadcms/next/routes"
import { beforeAll, describe, expect, it } from "vite-plus/test"

import config from "@/payload.config"

let payload: Payload

describe("contact-submissions の公開API境界", () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it("匿名REST createを403で拒否する", async () => {
    const email = `anonymous-rest-${crypto.randomUUID()}@example.com`
    const payloadConfig = await config
    const response = await handleEndpoints({
      config: payloadConfig,
      request: new Request("http://payload.local/api/contact-submissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Anonymous REST",
          email,
          message: "Turnstileを迂回する投稿",
          status: "new",
        }),
      }),
    })

    expect(response.status).toBe(403)
    const saved = await payload.find({
      collection: "contact-submissions",
      where: { email: { equals: email } },
    })
    expect(saved.docs).toHaveLength(0)
  })

  it("匿名GraphQL createを拒否する", async () => {
    const email = `anonymous-graphql-${crypto.randomUUID()}@example.com`
    const payloadConfig = await config
    const response = await GRAPHQL_POST(payloadConfig)(
      new Request("http://payload.local/api/graphql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation {
              createContactSubmission(
                data: {
                  name: "Anonymous GraphQL"
                  email: "${email}"
                  message: "Turnstileを迂回する投稿"
                  status: new
                }
              ) { id }
            }
          `,
        }),
      }),
    )

    expect(response.status).toBe(200)
    const body: unknown = await response.json()
    expect(body).toBeTypeOf("object")
    expect(Reflect.get(body as object, "errors")).toBeInstanceOf(Array)
    const saved = await payload.find({
      collection: "contact-submissions",
      where: { email: { equals: email } },
    })
    expect(saved.docs).toHaveLength(0)
  })

  it("認証済み管理者と信頼済みLocal APIの保存は維持する", async () => {
    const user = await payload.create({
      collection: "users",
      data: {
        email: `contact-admin-${crypto.randomUUID()}@example.com`,
        password: "test-password-1234",
        roles: ["admin"],
      },
    })
    const authenticated = await payload.create({
      collection: "contact-submissions",
      data: {
        name: "Authenticated Admin",
        email: `authenticated-${crypto.randomUUID()}@example.com`,
        message: "管理画面からの保存",
        status: "new",
      },
      overrideAccess: false,
      user,
    })
    const trusted = await payload.create({
      collection: "contact-submissions",
      data: {
        name: "Trusted Service",
        email: `trusted-${crypto.randomUUID()}@example.com`,
        message: "application serviceからの保存",
        status: "new",
      },
    })

    expect(authenticated.id).toBeDefined()
    expect(trusted.id).toBeDefined()
    await payload.delete({ collection: "contact-submissions", id: authenticated.id })
    await payload.delete({ collection: "contact-submissions", id: trusted.id })
    await payload.delete({ collection: "users", id: user.id })
  })
})
