type TestServiceAccount = {
  json: string
  publicKey: CryptoKey
}

/** テスト用に RSA 鍵を作り、Google のサービスアカウント鍵と同じ形の JSON を返す。 */
export async function createTestServiceAccount(): Promise<TestServiceAccount> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  )

  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey("pkcs8", keyPair.privateKey))

  const base64 = btoa(String.fromCharCode(...pkcs8))

  const pem = `-----BEGIN PRIVATE KEY-----\n${base64.replace(/(.{64})/g, "$1\n")}\n-----END PRIVATE KEY-----\n`

  const json = JSON.stringify({
    type: "service_account",
    project_id: "example-project",
    private_key_id: "test-key-id",
    private_key: pem,
    client_email: "analytics@example-project.iam.gserviceaccount.com",
  })

  return { json, publicKey: keyPair.publicKey }
}
