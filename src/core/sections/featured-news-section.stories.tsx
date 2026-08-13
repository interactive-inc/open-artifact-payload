import type { Meta, StoryObj } from "@storybook/react-vite"

import { exampleNewsItems } from "@/core/test-support/example-news-items"

import { FeaturedNewsSection } from "./featured-news-section"

const meta: Meta<typeof FeaturedNewsSection> = {
  title: "Core/Sections/FeaturedNewsSection",
  component: FeaturedNewsSection,
  tags: ["autodocs"],
  args: {
    data: {
      enabled: true,
      heading: "最新のお知らせ",
      items: exampleNewsItems,
    },
  },
}

export default meta

type Story = StoryObj<typeof FeaturedNewsSection>

export const Default: Story = {
  args: {
    data: {
      enabled: true,
      heading: "最新のお知らせ",
      items: exampleNewsItems,
    },
  },
}

export const DefaultHeading: Story = {
  args: {
    data: {
      enabled: true,
      items: exampleNewsItems,
    },
  },
}

export const Empty: Story = {
  args: {
    data: {
      enabled: true,
      items: [],
    },
  },
}

export const Disabled: Story = {
  args: {
    data: {
      enabled: false,
    },
  },
}
