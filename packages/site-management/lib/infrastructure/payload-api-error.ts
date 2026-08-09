import type { JsonValue } from "../domain/json-value"

export class PayloadApiError extends Error {
  constructor(
    readonly status: number,
    readonly details: JsonValue,
  ) {
    super(`Payload API request failed with HTTP ${status}`)
    this.name = "PayloadApiError"
    Object.freeze(this)
  }
}
