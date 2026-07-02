import { notFound } from 'next/navigation'

// どのルートにも一致しない URL を (frontend) の not-found 境界に流すための捕捉ルート。
// これがないと未マッチ URL は Next デフォルトの英語 404 になる。
export default function CatchAllPage(): never {
  notFound()
}
