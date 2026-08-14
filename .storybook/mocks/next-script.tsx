import type { ScriptHTMLAttributes } from "react"

type Props = ScriptHTMLAttributes<HTMLScriptElement> & {
  id?: string
  onReady?: () => void
  strategy?: "afterInteractive" | "beforeInteractive" | "lazyOnload" | "worker"
}

export default function NextScript({ onReady: _onReady, strategy: _strategy, ...props }: Props) {
  return <script {...props} />
}
