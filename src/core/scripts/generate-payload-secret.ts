import { randomBytes } from "node:crypto"

export function generatePayloadSecret(): string {
  return randomBytes(32).toString("hex")
}
