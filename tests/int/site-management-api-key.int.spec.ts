import { mkdtemp, rm, stat } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { getPayload, handleEndpoints } from "payload"
import { describe, expect, test } from "vite-plus/test"

import config from "@/payload.config"
import { runCli } from "../../packages/cli/lib/run-cli"

type CliExecution = {
  exitCode: number
  output: string
  errorOutput: string
}

describe("intacms CLI integration", () => {
  test("logs in and runs REST-style CRUD commands through Payload access control", async () => {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const email = `site-tools-${crypto.randomUUID()}@example.com`
    const password = "test-password-1234"
    const configDirectory = await mkdtemp(join(tmpdir(), "intacms-integration-"))
    let sessionToken = ""
    await payload.create({
      collection: "users",
      data: {
        email,
        password,
        roles: ["admin"],
      },
    })

    const executeCli = async (argv: ReadonlyArray<string>): Promise<CliExecution> => {
      let output = ""
      let errorOutput = ""
      const exitCode = await runCli({
        argv,
        env: {
          INTACMS_CONFIG_DIR: configDirectory,
          INTACMS_LOCAL_ENDPOINT: "https://payload.local",
        },
        fetchPort: async (input, init) => {
          const request = new Request(input, init)
          const response = await handleEndpoints({ config: payloadConfig, request })
          if (new URL(request.url).pathname === "/api/users/login") {
            const body: unknown = await response.clone().json()
            if (typeof body === "object" && body !== null) {
              const token = Reflect.get(body, "token")
              if (typeof token === "string") sessionToken = token
            }
          }
          return response
        },
        io: {
          writeOutput: (value) => {
            output += value
          },
          writeError: (value) => {
            errorOutput += value
          },
          readSecret: async () => password,
        },
      })
      return { exitCode, output, errorOutput }
    }

    const loginResult = await executeCli(["login", "--local", "--email", email])
    expect(loginResult).toMatchObject({ exitCode: 0, errorOutput: "" })
    expect(loginResult.output).toContain(email)
    expect((await stat(join(configDirectory, "accounts.json"))).mode & 0o777).toBe(0o600)

    const whoamiResult = await executeCli(["whoami", "--local"])
    expect(whoamiResult).toMatchObject({ exitCode: 0, errorOutput: "" })
    expect(whoamiResult.output).toContain(email)

    const slug = `cli-crud-${crypto.randomUUID()}`
    const createResult = await executeCli([
      "news",
      "create",
      "--local",
      "--title",
      "CLI create",
      "--slug",
      slug,
      "--published-at",
      new Date().toISOString(),
      "--category",
      "info",
      "--_status",
      "published",
    ])
    expect(createResult).toMatchObject({ exitCode: 0, errorOutput: "" })
    expect(createResult.output).toContain(slug)

    const createdDocuments = await payload.find({
      collection: "news",
      where: { slug: { equals: slug } },
      limit: 1,
    })
    expect(createdDocuments.docs).toHaveLength(1)
    const createdDocument = createdDocuments.docs[0]
    if (!createdDocument) return

    const getResult = await executeCli(["news", String(createdDocument.id), "view", "--local"])
    expect(getResult).toMatchObject({ exitCode: 0, errorOutput: "" })
    expect(getResult.output).toContain(slug)

    const listResult = await executeCli(["news", "--local", "--limit", "100"])
    expect(listResult).toMatchObject({ exitCode: 0, errorOutput: "" })
    expect(listResult.output).toContain('"docs"')

    const updateResult = await executeCli([
      "news",
      String(createdDocument.id),
      "update",
      "--local",
      "--title",
      "CLI update",
    ])
    expect(updateResult).toMatchObject({ exitCode: 0, errorOutput: "" })
    expect(updateResult.output).toContain("CLI update")

    const updatedDocument = await payload.findByID({
      collection: "news",
      id: createdDocument.id,
      locale: "ja",
    })
    expect(updatedDocument.title).toBe("CLI update")

    const deleteResult = await executeCli(["news", String(createdDocument.id), "delete", "--local"])
    expect(deleteResult).toMatchObject({ exitCode: 0, errorOutput: "" })

    const remainingDocuments = await payload.find({
      collection: "news",
      where: { slug: { equals: slug } },
      limit: 1,
    })
    expect(remainingDocuments.docs).toHaveLength(0)

    const logoutResult = await executeCli(["logout", "--local"])
    expect(logoutResult).toMatchObject({ exitCode: 0, errorOutput: "" })
    const expiredSessionResponse = await handleEndpoints({
      config: payloadConfig,
      request: new Request("https://payload.local/api/users/me", {
        headers: { Authorization: `JWT ${sessionToken}` },
      }),
    })
    const expiredSessionBody: unknown = await expiredSessionResponse.json()
    expect(expiredSessionBody).toBeTypeOf("object")
    if (typeof expiredSessionBody === "object" && expiredSessionBody !== null) {
      expect(Reflect.get(expiredSessionBody, "user")).toBeNull()
    }
    const afterLogout = await executeCli(["news", "--local"])
    expect(afterLogout.exitCode).toBe(1)
    expect(afterLogout.errorOutput).toContain("Not logged in")
    await rm(configDirectory, { recursive: true })
  })
})
