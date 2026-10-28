/** PEM 形式（PKCS#8）の秘密鍵を Web Crypto の署名用の鍵にする。Workers にも Node にもある API だけを使う。 */
export async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const base64 = pem
    .replace(/-----(BEGIN|END) PRIVATE KEY-----/g, "")
    .replace(/\\n/g, "")
    .replace(/\s/g, "")

  const der = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))

  return crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  )
}
