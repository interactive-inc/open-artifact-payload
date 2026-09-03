type EmailFromParts = {
  address: string
  name: string
}

// "Name <address@example.com>" / "<address@example.com>" の山括弧部分
const angleAddressPattern = /^(.*)<([^<>]+)>$/

/**
 * 送信元の設定値を表示名とアドレスへ分解する。
 * "Name <address@example.com>" と "address@example.com" の両方を受け付ける。
 *
 * 表示名が無いときはアドレスのローカル部を表示名にする。RFC 5322 の display-name に
 * "@" を含めるとクォートが必須になり、クォートを省いたまま送ると Resend 側で弾かれるため。
 */
export function parseEmailFrom(value: string): EmailFromParts | Error {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    return new Error("送信元アドレスが空です")
  }

  const matched = angleAddressPattern.exec(trimmed)
  const address = matched ? matched[2].trim() : trimmed

  if (!address.includes("@") || /\s/.test(address)) {
    return new Error("送信元アドレスの形式が不正です")
  }

  const rawName = matched ? matched[1].trim() : ""
  const unquotedName = rawName.replace(/^"(.*)"$/, "$1").trim()
  const localPart = address.slice(0, address.indexOf("@"))

  return {
    address,
    name: unquotedName.length > 0 ? unquotedName : localPart,
  }
}
