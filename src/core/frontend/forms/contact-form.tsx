'use client'

import React, { useState } from 'react'

import { submitContact } from './contact-form-action'
import { Button } from '@/project/shared/ui/button'
import { Input } from '@/project/shared/ui/input'
import { Textarea } from '@/project/shared/ui/textarea'
import { Label } from '@/project/shared/ui/label'
import { NativeSelect } from '@/project/shared/ui/native-select'
import { Alert, AlertDescription } from '@/project/shared/ui/alert'
import { Spinner } from '@/project/shared/ui/spinner'
import { AlertCircleIcon } from 'lucide-react'

type InquiryOption = { value: string; label: string }

type Props = {
  turnstileSiteKey?: string
  inquiryOptions?: InquiryOption[]
  showCompanyName?: boolean
}

type FormState = 'idle' | 'submitting' | 'error'

export function ContactForm(props: Props) {
  const [state, setState] = useState<FormState>('idle')
  const [errors, setErrors] = useState<string[]>([])
  const showCompanyName = props.showCompanyName ?? true

  return (
    <form
      action={async (formData) => {
        setState('submitting')
        setErrors([])
        const result = await submitContact(formData)
        if (result.status === 'ok') {
          window.location.href = '/contact/thanks'
          return
        }
        if (result.status === 'validationFailed') {
          setErrors(result.errors)
        }
        if (result.status === 'turnstileFailed') {
          setErrors(['スパム判定されました。もう一度お試しください'])
        }
        setState('error')
      }}
      className="space-y-5"
    >
      {errors.length > 0 ? (
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="name">
          お名前 <span className="text-destructive">*</span>
        </Label>
        <Input id="name" name="name" required placeholder="山田 太郎" />
      </div>

      {showCompanyName ? (
        <div className="space-y-2">
          <Label htmlFor="companyName">
            会社名 <span className="text-muted-foreground text-xs">（任意）</span>
          </Label>
          <Input id="companyName" name="companyName" placeholder="株式会社◯◯" />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">
          メールアドレス <span className="text-destructive">*</span>
        </Label>
        <Input id="email" type="email" name="email" required placeholder="example@company.com" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          電話番号 <span className="text-muted-foreground text-xs">（任意）</span>
        </Label>
        <Input id="phone" name="phone" placeholder="03-1234-5678" />
      </div>

      {props.inquiryOptions && props.inquiryOptions.length > 0 ? (
        <div className="space-y-2">
          <Label htmlFor="inquiryType">
            お問い合わせ種別 <span className="text-destructive">*</span>
          </Label>
          <NativeSelect id="inquiryType" name="inquiryType" required>
            <option value="">選択してください</option>
            {props.inquiryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="message">
          お問い合わせ内容 <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="message"
          name="message"
          rows={6}
          required
          placeholder="ご相談内容をご記入ください"
        />
      </div>

      {props.turnstileSiteKey ? (
        <div
          className="cf-turnstile"
          data-sitekey={props.turnstileSiteKey}
          data-callback="onTurnstile"
        />
      ) : (
        <input type="hidden" name="turnstileToken" value="dev-bypass" />
      )}

      <Button type="submit" disabled={state === 'submitting'} className="w-full" size="lg">
        {state === 'submitting' ? (
          <>
            <Spinner data-icon="inline-start" />
            送信中...
          </>
        ) : (
          '送信する'
        )}
      </Button>
    </form>
  )
}
