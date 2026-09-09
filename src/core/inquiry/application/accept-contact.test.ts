import { describe, expect, it, vi } from "vite-plus/test"
import { acceptContact } from "@/core/inquiry/application/accept-contact"
import type { ContactAcceptanceDependencies } from "@/core/inquiry/application/accept-contact"
import type { ContactFormFields } from "@/core/inquiry/domain/contact-form-fields"
import type { ContactNotificationDelivery } from "@/core/inquiry/application/contact-notification-delivery"

const fields: ContactFormFields = {
  name: "Template User",
  email: "user@example.test",
  companyName: "",
  phone: "",
  inquiryType: "",
  message: "Inquiry",
  turnstileToken: "test-token",
}

function setup() {
  const operations: string[] = []
  const dependencies = {
    createRateLimitKey: vi.fn(async () => {
      operations.push("key")
      return "contact:hash"
    }),
    checkRateLimit: vi.fn<ContactAcceptanceDependencies["checkRateLimit"]>(async () => {
      operations.push("rate")
      return "allowed"
    }),
    verifyTurnstile: vi.fn(async () => {
      operations.push("turnstile")
      return true
    }),
    saveSubmission: vi.fn(async () => {
      operations.push("save")
      return 7
    }),
    notify: vi.fn(async (): Promise<ContactNotificationDelivery | Error> => {
      operations.push("notify")
      return { status: "sent" }
    }),
    wait: vi.fn(async () => {
      operations.push("wait")
    }),
    reportNotificationFailure: vi.fn(),
  } satisfies ContactAcceptanceDependencies
  return { operations, dependencies }
}

describe("contact acceptance without external runtime", () => {
  it("validates before any operation and preserves error results", async () => {
    const scenario = setup()
    const result = await acceptContact({ ...fields, name: "" }, scenario.dependencies)
    expect(result).toEqual({ status: "validationFailed", errors: ["お名前を入力してください"] })
    expect(scenario.operations).toEqual([])
  })

  it("checks key/rate/Turnstile, then saves before notifying; empty optional fields are allowed", async () => {
    const scenario = setup()
    expect(await acceptContact(fields, scenario.dependencies)).toEqual({ status: "ok" })
    expect(scenario.operations).toEqual(["key", "rate", "turnstile", "save", "notify"])
    expect(scenario.dependencies.createRateLimitKey).toHaveBeenCalledWith(fields.email)
    expect(scenario.dependencies.checkRateLimit).toHaveBeenCalledWith("contact:hash")
    expect(scenario.dependencies.verifyTurnstile).toHaveBeenCalledWith(fields.turnstileToken)
    expect(scenario.dependencies.saveSubmission).toHaveBeenCalledWith(fields)
    expect(scenario.dependencies.notify).toHaveBeenCalledWith(7)
  })

  it.each([
    ["createRateLimitKey", new Error("hash unavailable"), "serverError", []],
    ["checkRateLimit", "limited", "rateLimited", ["key"]],
    ["checkRateLimit", "unavailable", "serverError", ["key"]],
    ["verifyTurnstile", new Error("missing configuration"), "serverError", ["key", "rate"]],
    ["verifyTurnstile", false, "turnstileFailed", ["key", "rate"]],
    ["saveSubmission", null, "serverError", ["key", "rate", "turnstile"]],
  ] as const)("stops after %s returns %s", async (operation, outcome, status, calls) => {
    const scenario = setup()
    const dependencies: ContactAcceptanceDependencies = {
      ...scenario.dependencies,
      [operation]: vi.fn(async () => outcome),
    }
    expect(await acceptContact(fields, dependencies)).toEqual({ status })
    expect(scenario.operations).toEqual(calls)
    expect(scenario.dependencies.notify).not.toHaveBeenCalled()
  })

  it.each([
    { status: "sent" },
    { status: "alreadySent" },
    { status: "skipped", reason: "not configured" },
    new Error("submission not found"),
  ] satisfies Array<ContactNotificationDelivery | Error>)("does not retry %s", async (delivery) => {
    const scenario = setup()
    scenario.dependencies.notify.mockResolvedValue(delivery)
    expect(await acceptContact(fields, scenario.dependencies)).toEqual({ status: "ok" })
    expect(scenario.dependencies.notify).toHaveBeenCalledTimes(1)
    expect(scenario.dependencies.wait).not.toHaveBeenCalled()
  })

  it.each([
    { status: "sent" },
    { status: "failed", error: "still unavailable" },
    new Error("submission not found"),
  ] satisfies Array<ContactNotificationDelivery | Error>)(
    "retries failed delivery exactly once after 1000 ms, returning ok for %s",
    async (retried) => {
      const scenario = setup()
      scenario.dependencies.notify
        .mockResolvedValueOnce({ status: "failed", error: "unavailable" })
        .mockResolvedValueOnce(retried)
      expect(await acceptContact(fields, scenario.dependencies)).toEqual({ status: "ok" })
      expect(scenario.dependencies.saveSubmission).toHaveBeenCalledTimes(1)
      expect(scenario.dependencies.notify).toHaveBeenCalledTimes(2)
      expect(scenario.dependencies.wait).toHaveBeenCalledExactlyOnceWith(1000)
      expect(scenario.dependencies.reportNotificationFailure).toHaveBeenCalledWith(
        "initial",
        "unavailable",
      )
    },
  )
})
