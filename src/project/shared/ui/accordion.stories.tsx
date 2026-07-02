import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'

const meta: Meta = {
  title: 'UI/Accordion',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

export const FaqStyle: Story = {
  render: () => (
    <Accordion className="w-full max-w-lg">
      <AccordionItem value="q1">
        <AccordionTrigger>
          <span className="flex items-start gap-2">
            <span className="text-primary font-bold">Q</span>
            どのような規模の企業に対応していますか？
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex gap-2">
            <span className="font-bold text-muted-foreground">A</span>
            <p className="text-muted-foreground">
              スタートアップから上場企業まで幅広く対応しています。
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="q2">
        <AccordionTrigger>
          <span className="flex items-start gap-2">
            <span className="text-primary font-bold">Q</span>
            開発にかかる期間はどのくらいですか？
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex gap-2">
            <span className="font-bold text-muted-foreground">A</span>
            <p className="text-muted-foreground">
              小規模なWebサイトで1〜2ヶ月、中規模で3〜6ヶ月が目安です。
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}
