import type { Meta, StoryObj } from "@storybook/react-vite"

import { GenerativeCanvas } from "./generative-canvas"

// canvas は自身の clientWidth / clientHeight を見て描画するため、高さを持つ親が要る。
const meta: Meta<typeof GenerativeCanvas> = {
  title: "Shared/Components/GenerativeCanvas",
  component: GenerativeCanvas,
  tags: ["autodocs"],
  args: {
    className: "absolute inset-0 size-full",
  },
  decorators: [
    (Story) => (
      <div className="relative h-96 w-full bg-white">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof GenerativeCanvas>

export const Attractor: Story = {
  args: { variant: "attractor" },
}

export const Metaballs: Story = {
  args: { variant: "metaballs" },
}

export const Truchet: Story = {
  args: { variant: "truchet" },
}

export const Apollonian: Story = {
  args: { variant: "apollonian" },
}

export const Penrose: Story = {
  args: { variant: "penrose" },
}

export const Wang: Story = {
  args: { variant: "wang" },
}
