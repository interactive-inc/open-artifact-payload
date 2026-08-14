import Image from "next/image"
import React from "react"

type Testimonial = {
  quote: string
  name: string
  role: string
  avatarId: number
}

// お客様の声。引用は3行以内に収め、人物写真で信頼感を補強する。
// 内容はサンプル。本番では CMS 化するか実際の声に差し替える。
const testimonials: ReadonlyArray<Testimonial> = [
  {
    quote: "要件が曖昧な段階から並走してくれて、想像以上の成果物に仕上がりました。",
    name: "田村 直樹",
    role: "製造業 / 事業企画部長",
    avatarId: 1005,
  },
  {
    quote: "公開後の改善提案まで含めて、長期的なパートナーとして信頼しています。",
    name: "小林 美咲",
    role: "小売 / マーケティング責任者",
    avatarId: 1011,
  },
  {
    quote: "スピードと品質の両立に驚きました。社内の巻き込み方まで丁寧でした。",
    name: "佐々木 玲奈",
    role: "スタートアップ / 代表取締役",
    avatarId: 1027,
  },
]

export function TestimonialsSection() {
  return (
    <section className="bg-muted/40 py-24 md:py-32">
      <div className="container-site">
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-sm font-medium tracking-wide text-primary">VOICE</p>
          <h2 className="text-3xl font-heading font-semibold tracking-tight md:text-4xl">
            お客様の声
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure
              key={item.name}
              className="flex flex-col justify-between gap-8 bg-card p-8 ring-1 ring-foreground/5 shadow-sm"
            >
              <blockquote className="text-lg leading-relaxed">「{item.quote}」</blockquote>
              <figcaption className="flex items-center gap-4">
                <div className="relative size-12 overflow-hidden ring-1 ring-foreground/10">
                  <Image
                    src={`https://picsum.photos/id/${item.avatarId}/96/96`}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">{item.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
