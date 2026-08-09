import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card"
import { Button } from "./button"
import { Badge } from "./badge"

const meta: Meta = {
  title: "UI/Card",
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj

export const Basic: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>カードタイトル</CardTitle>
        <CardDescription>カードの説明テキストがここに入ります</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          カードのコンテンツ。任意のコンポーネントを配置できます。
        </p>
      </CardContent>
      <CardFooter>
        <Button size="sm">詳細を見る</Button>
      </CardFooter>
    </Card>
  ),
}

export const NewsCard: Story = {
  render: () => (
    <Card className="w-72">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">お知らせ</Badge>
          <time className="text-xs text-muted-foreground">2024/04/01</time>
        </div>
        <CardTitle className="text-base leading-snug">Webサイトをリニューアルしました</CardTitle>
      </CardHeader>
    </Card>
  ),
}
