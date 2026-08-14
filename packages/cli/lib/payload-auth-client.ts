import { jsonValueSchema, type FetchPort, type JsonValue } from "@open-artifact/site-management"
import { z } from "zod"

import type { CliAccount } from "./cli-configuration-store"

const requestTimeoutMilliseconds = 30_000

const loginResponseSchema = z
  .object({
    token: z.string().min(1),
    user: z
      .object({
        email: z.string().email().optional(),
      })
      .passthrough(),
  })
  .passthrough()

const errorResponseSchema = z
  .object({
    message: z.string().optional(),
    errors: z.array(z.object({ message: z.string() }).passthrough()).optional(),
  })
  .passthrough()

export class PayloadAuthClient {
  constructor(private readonly fetchPort: FetchPort) {}

  async login(props: {
    endpoint: string
    email: string
    password: string
    authCollection: string
  }): Promise<CliAccount | Error> {
    const response = await this.request(
      new URL(`api/${props.authCollection}/login`, `${props.endpoint}/`),
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ email: props.email, password: props.password }),
      },
    )
    if (response instanceof Error) return response
    const raw = await readResponseJson(response)
    if (raw instanceof Error) return raw
    if (!response.ok) return new Error(toPayloadErrorMessage(response.status, raw))
    const parsed = loginResponseSchema.safeParse(raw)
    if (!parsed.success) return new Error("Payload login response did not include a token")

    return {
      email: parsed.data.user.email ?? props.email,
      token: parsed.data.token,
      authCollection: props.authCollection,
    }
  }

  async findCurrentUser(props: {
    endpoint: string
    authorization: string
    authCollection: string
  }): Promise<JsonValue | Error> {
    const response = await this.request(
      new URL(`api/${props.authCollection}/me`, `${props.endpoint}/`),
      {
        method: "GET",
        headers: { Accept: "application/json", Authorization: props.authorization },
      },
    )
    if (response instanceof Error) return response
    const raw = await readResponseJson(response)
    if (raw instanceof Error) return raw
    if (!response.ok) return new Error(toPayloadErrorMessage(response.status, raw))
    const parsed = jsonValueSchema.safeParse(raw)
    return parsed.success ? parsed.data : new Error("Payload returned an invalid user response")
  }

  async logout(props: {
    endpoint: string
    authorization: string
    authCollection: string
  }): Promise<null | Error> {
    const response = await this.request(
      new URL(`api/${props.authCollection}/logout`, `${props.endpoint}/`),
      {
        method: "POST",
        headers: { Accept: "application/json", Authorization: props.authorization },
      },
    )
    if (response instanceof Error) return response
    if (response.ok || response.status === 401) return null
    const raw = await readResponseJson(response)
    if (raw instanceof Error) return raw
    return new Error(toPayloadErrorMessage(response.status, raw))
  }

  private async request(url: URL, init: RequestInit): Promise<Response | Error> {
    try {
      return await this.fetchPort(url, {
        ...init,
        signal: init.signal ?? AbortSignal.timeout(requestTimeoutMilliseconds),
      })
    } catch (cause) {
      return cause instanceof Error
        ? new Error(`Payload authentication request failed: ${cause.message}`)
        : new Error("Payload authentication request failed")
    }
  }
}

async function readResponseJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return new Error(`Payload returned a non-JSON response with HTTP ${response.status}`)
  }
}

function toPayloadErrorMessage(status: number, body: unknown): string {
  const parsed = errorResponseSchema.safeParse(body)
  if (!parsed.success) return `Payload authentication failed with HTTP ${status}`
  return (
    parsed.data.errors?.[0]?.message ??
    parsed.data.message ??
    `Payload authentication failed with HTTP ${status}`
  )
}
