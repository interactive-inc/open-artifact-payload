import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { exampleMedia } from "@/core/test-support/example-media"
import { HeroSection } from "@/core/sections/hero-section"

const meta: Meta<typeof HeroSection> = {
  title: "Core/Sections/HeroSection",
  component: HeroSection,
  tags: ["autodocs"],
  args: {
    data: {
      enabled: true,
      title: "未来をつくるWebソリューションHero",
      subtitle: "Inta CMS で、誰でも簡単にコンテンツを編集できます。",
      ctaLabel: "お問い合わせ",
      ctaHref: "/contact",
    },
  },
}

export default meta

type Story = StoryObj<typeof HeroSection>

export const Default: Story = {}

export const WithImage: Story = {
  args: {
    data: {
      enabled: true,
      title: "未来をつくるWebソリューションHero",
      subtitle: "Inta CMS で、誰でも簡単にコンテンツを編集できます。",
      image: exampleMedia,
      ctaLabel: "お問い合わせ",
      ctaHref: "/contact",
    },
  },
}

export const NoCta: Story = {
  args: {
    data: {
      enabled: true,
      title: "未来をつくるWebソリューションHero",
      subtitle: "Inta CMS で、誰でも簡単にコンテンツを編集できます。",
    },
  },
}

export const Disabled: Story = {
  args: {
    data: {
      enabled: false,
      title: "未来をつくるWebソリューションHero",
      subtitle: "Inta CMS で、誰でも簡単にコンテンツを編集できます。",
      ctaLabel: "お問い合わせ",
      ctaHref: "/contact",
    },
  },
}
