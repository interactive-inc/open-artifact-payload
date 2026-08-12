import type { Meta, StoryObj } from "@storybook/react-vite"

import { exampleSiteSettings } from "@/core/test-support/example-site-settings"

import { SiteHeader } from "./site-header"

const meta: Meta<typeof SiteHeader> = {
  title: "Shared/Sections/SiteHeader",
  component: SiteHeader,
  tags: ["autodocs"],
  args: {
    settings: exampleSiteSettings,
  },
}

export default meta

type Story = StoryObj<typeof SiteHeader>

export const Default: Story = {}
