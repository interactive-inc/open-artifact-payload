import Link from 'next/link'
import React from 'react'
import { CheckCircleIcon } from 'lucide-react'

import { Button } from '@/project/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/project/shared/ui/card'
import '../../styles.css'

export default function ThanksPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16 px-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircleIcon className="size-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">ありがとうございました</CardTitle>
          <CardDescription className="text-base">お問い合わせを受け付けました</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            担当者より3営業日以内にご連絡いたします。
            <br />
            しばらくお待ちください。
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button render={<Link href="/" />} variant="outline">
            トップページへ戻る
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
