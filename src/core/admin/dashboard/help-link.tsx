import React from "react"

type Props = {
  email: string
}

export function HelpLink(props: Props) {
  return (
    <footer className="ictms-dashboard__help">
      操作に困ったときは <a href={`mailto:${props.email}`}>サポートへ連絡</a> してください
    </footer>
  )
}
