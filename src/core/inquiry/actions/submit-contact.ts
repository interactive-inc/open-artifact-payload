import { acceptContact } from "@/core/inquiry/application/accept-contact"
import { readContactFormFields } from "@/core/inquiry/actions/read-contact-form-fields"
import {
  createContactDependencies,
  type ContactSubmissionOptions,
} from "@/core/inquiry/infrastructure/create-contact-dependencies"

/** Server Actionと統合テストが共有する入口。フォームをDTOに変換して受付へ渡す。 */
export async function submitContact(formData: FormData, options: ContactSubmissionOptions = {}) {
  return acceptContact(readContactFormFields(formData), createContactDependencies(options))
}
