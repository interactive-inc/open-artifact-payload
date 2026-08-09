import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import React from "react"

import { Input } from "./input"
import { Label } from "./label"
import { Textarea } from "./textarea"

const meta: Meta = {
  title: "UI/Form",
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj

export const TextInput: Story = {
  render: () => (
    <div className="space-y-2 w-80">
      <Label htmlFor="name">お名前</Label>
      <Input id="name" placeholder="山田 太郎" />
    </div>
  ),
}

export const TextareaInput: Story = {
  render: () => (
    <div className="space-y-2 w-80">
      <Label htmlFor="message">お問い合わせ内容</Label>
      <Textarea id="message" rows={4} placeholder="ご相談内容をご記入ください" />
    </div>
  ),
}
