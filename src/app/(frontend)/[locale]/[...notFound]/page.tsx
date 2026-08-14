import { notFound } from "next/navigation"

// [locale] 配下のどのルートにも一致しない URL を [locale]/not-found.tsx の境界に流すための捕捉ルート。
// これがないと未マッチ URL は Next デフォルトの英語 404 になる。
// [locale] の外に置くと boundary が [locale]/not-found.tsx にならないため、必ずこの位置に置く。
export default function CatchAllPage(): never {
  notFound()
}
