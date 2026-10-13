import { describe, expect, it } from "vite-plus/test"

import { describeGa4ServiceAccount } from "@/core/lib/analytics/describe-ga4-service-account"
import { createTestServiceAccount } from "@/core/test-support/create-test-service-account"

describe("describeGa4ServiceAccount", () => {
  it("設定済みなら GA4 に追加するメールアドレスだけを示す", async () => {
    const account = await createTestServiceAccount()

    const description = describeGa4ServiceAccount(account.json)

    expect(description).toBe("設定済み（analytics@example-project.iam.gserviceaccount.com）")
    expect(description).not.toContain("PRIVATE KEY")
  })

  it("未設定と読み取れない鍵を区別する", () => {
    expect(describeGa4ServiceAccount(undefined)).toContain("未設定")
    expect(describeGa4ServiceAccount("{")).toContain("読み取れません")
  })
})
