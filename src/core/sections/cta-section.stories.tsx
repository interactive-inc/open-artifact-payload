import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { CtaSection } from "@/core/sections/cta-section"

const meta: Meta<typeof CtaSection> = {
  title: "Core/Sections/CtaSection",
  component: CtaSection,
  tags: ["autodocs"],
  args: {
    data: {
      enabled: true,
      heading: "まずはお気軽にご相談ください",
      description: "専門スタッフが貴社の課題に合わせて最適なプランをご提案します。",
      ctaLabel: "お問い合わせはこちら",
      ctaHref: "/contact",
    },
  },
}

export default meta

type Story = StoryObj<typeof CtaSection>

export const Default: Story = {}

export const WithoutCta: Story = {
  args: {
    data: {
      enabled: true,
      heading: "まずはお気軽にご相談ください",
      description: "専門スタッフが貴社の課題に合わせて最適なプランをご提案します。",
    },
  },
}

export const Disabled: Story = {
  args: {
    data: {
      enabled: false,
      heading: "まずはお気軽にご相談ください",
      description: "専門スタッフが貴社の課題に合わせて最適なプランをご提案します。",
      ctaLabel: "お問い合わせはこちら",
      ctaHref: "/contact",
    },
  },
}
