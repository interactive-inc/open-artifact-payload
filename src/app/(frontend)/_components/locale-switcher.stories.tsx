import type { Meta, StoryObj } from "@storybook/react-vite"

import { LocaleSwitcher } from "./locale-switcher"

// usePathname は .storybook/mocks/next-navigation.ts が "/" を返すモックに差し替える。
const meta: Meta<typeof LocaleSwitcher> = {
  title: "Shared/Components/LocaleSwitcher",
  component: LocaleSwitcher,
  tags: ["autodocs"],
  args: {
    locale: "ja",
  },
}

export default meta

type Story = StoryObj<typeof LocaleSwitcher>

export const Japanese: Story = {
  args: { locale: "ja" },
}

export const English: Story = {
  args: { locale: "en" },
}
