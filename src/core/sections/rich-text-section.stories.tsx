import type { Meta, StoryObj } from "@storybook/react-vite"

import { exampleRichText } from "@/core/test-support/example-rich-text"

import { RichTextSection } from "./rich-text-section"

const meta: Meta<typeof RichTextSection> = {
  title: "Core/Sections/RichTextSection",
  component: RichTextSection,
  tags: ["autodocs"],
  args: {
    data: {
      enabled: true,
      heading: "セクション見出し",
      body: exampleRichText,
    },
  },
}

export default meta

type Story = StoryObj<typeof RichTextSection>

export const WithHeading: Story = {
  args: {
    data: {
      enabled: true,
      heading: "セクション見出し",
      body: exampleRichText,
    },
  },
}

export const WithoutHeading: Story = {
  args: {
    data: {
      enabled: true,
      body: exampleRichText,
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
