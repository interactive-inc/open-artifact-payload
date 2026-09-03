import type { Meta, StoryObj } from "@storybook/react-vite"

import { exampleMedia } from "@/core/test-support/example-media"
import { exampleNewsItems } from "@/core/test-support/example-news-items"
import { exampleWorks } from "@/core/test-support/example-works"

import { HomeGrid } from "./home-grid"

const serviceItems = [
  {
    icon: "🧭",
    title: "戦略とサイト設計",
    description: "事業の目的から情報設計を組み立て、伝わる導線に整えます。",
  },
  {
    icon: "🎨",
    title: "デザインと実装",
    description: "デザインから実装まで一貫して担当し、表示速度も作り込みます。",
  },
  {
    icon: "🛠",
    title: "公開後の運用支援",
    description: "CMS の運用設計と改善サイクルまで並走します。",
  },
]

const hero = {
  enabled: true,
  title: "つくるを、\nもっと自由に。",
  subtitle: "Payload CMS と Cloudflare で、更新しやすいサイトを届けます。",
  image: exampleMedia,
  ctaLabel: "サービスを見る",
  ctaHref: "/service",
}

const about = {
  enabled: true,
  heading: "小さく作り、\n長く育てる。",
  description: "要件の整理から運用までを一つのチームで担当し、公開後の改善まで見届けます。",
  image: exampleMedia,
  ctaLabel: "会社概要を見る",
  ctaHref: "/about",
}

const meta: Meta<typeof HomeGrid> = {
  title: "Pages/Home/HomeGrid",
  component: HomeGrid,
  tags: ["autodocs"],
  args: {
    locale: "ja",
    isDraft: false,
    hero,
    services: {
      enabled: true,
      heading: "事業の課題から、Web の打ち手を組み立てる。",
      subheading: "設計・実装・運用を分断せず、ひとつの流れとして引き受けます。",
      items: serviceItems,
    },
    about,
    works: exampleWorks,
    news: { enabled: true, heading: "お知らせ", items: exampleNewsItems },
    cta: {
      enabled: true,
      heading: "サイトの相談から、はじめませんか。",
      description: "現状の課題を伺ったうえで、進め方の案をお出しします。",
      ctaLabel: "お問い合わせ",
      ctaHref: "/contact",
    },
  },
}

export default meta

type Story = StoryObj<typeof HomeGrid>

export const Default: Story = {}

// CMS で全セクションを非表示にし、実績とお知らせも未登録の状態。
// enabled に依存しない固定セクション (使用技術・実績・お客様の声) だけが残る。
export const Empty: Story = {
  args: {
    hero: { enabled: false },
    services: { enabled: false },
    about: { enabled: false },
    works: [],
    news: { enabled: false, items: [] },
    cta: { enabled: false },
  },
}

// 画像未設定時。KV は GenerativeCanvas のアトラクター描画に切り替わる。
export const WithoutImages: Story = {
  args: {
    hero: { ...hero, image: null },
    about: { ...about, image: null },
  },
}
