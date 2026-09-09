import { expect, it } from "vite-plus/test"
import { readContactFormFields } from "@/core/inquiry/actions/read-contact-form-fields"

it("trims string form fields, ignores files/unknown fields, and reads the Turnstile hidden field", () => {
  const form = new FormData()
  form.set("name", " Name ")
  form.set("email", " user@example.test ")
  form.set("message", "\n text \n")
  form.set("phone", new File(["123"], "phone.txt"))
  form.set("cf-turnstile-response", " token ")
  form.set("notificationStatus", "sent")
  expect(readContactFormFields(form)).toEqual({
    name: "Name",
    email: "user@example.test",
    message: "text",
    phone: "",
    companyName: "",
    inquiryType: "",
    turnstileToken: "token",
  })
})
