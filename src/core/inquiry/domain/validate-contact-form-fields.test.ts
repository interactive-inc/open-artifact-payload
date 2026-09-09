import { describe, expect, it } from "vite-plus/test"
import {
  CONTACT_FIELD_LIMITS,
  type ContactFormFields,
} from "@/core/inquiry/domain/contact-form-fields"
import { CONTACT_INQUIRY_TYPES } from "@/core/inquiry/domain/contact-inquiry-type"
import { validateContactFormFields } from "@/core/inquiry/domain/validate-contact-form-fields"

const fields: ContactFormFields = {
  name: "Template User",
  email: "user@example.test",
  message: "Inquiry",
  phone: "",
  companyName: "",
  inquiryType: "",
  turnstileToken: "",
}

describe("contact input constraints", () => {
  it.each(["", ...CONTACT_INQUIRY_TYPES])("accepts the existing inquiry code %s", (inquiryType) => {
    expect(validateContactFormFields({ ...fields, inquiryType })).toEqual([])
  })

  it.each(Object.entries(CONTACT_FIELD_LIMITS))(
    "retains the exact upper limit for %s",
    (field, limit) => {
      // inquiryType also has a code constraint; email also has a format constraint.
      const value = field === "email" ? `${"a".repeat(limit - 3)}@b.c` : "a".repeat(limit + 1)
      const errors = validateContactFormFields({ ...fields, [field]: value })
      expect(errors.some((error) => error.includes(`${limit}文字以内`))).toBe(true)
      const atLimit = field === "email" ? `${"a".repeat(limit - 4)}@b.c` : "a".repeat(limit)
      expect(
        validateContactFormFields({ ...fields, [field]: atLimit }).some((error) =>
          error.includes("文字以内"),
        ),
      ).toBe(false)
    },
  )

  it.each([0, 8, 11, 12, 14, 31, 127])("rejects control U+%s in each text field", (codePoint) => {
    for (const field of ["name", "email", "companyName", "phone", "inquiryType", "message"]) {
      expect(
        validateContactFormFields({ ...fields, [field]: `a${String.fromCodePoint(codePoint)}b` }),
      ).toContain("入力内容に使用できない制御文字が含まれています")
    }
  })

  it("allows existing whitespace in text and does not add phone, company or token constraints", () => {
    expect(
      validateContactFormFields({
        ...fields,
        name: "A\tB",
        phone: "+81 (0) 90-1234",
        message: "First\r\nSecond\tend",
        turnstileToken: "\u0000",
      }),
    ).toEqual([])
  })
})
