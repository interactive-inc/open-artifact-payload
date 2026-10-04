"use client"

import type { FocusEvent, ReactNode } from "react"

import type { FieldFocusMessage } from "@/core/lib/preview/field-focus-message"
import { fieldFocusMessageType } from "@/core/lib/preview/field-focus-message"
import { getFocusedFieldPath } from "@/core/admin/preview/get-focused-field-path"

type Props = { children?: ReactNode }

const livePreviewFrameId = "live-preview-iframe"

/**
 * 管理画面で項目にフォーカスしたとき、横に開いたライブプレビューへその項目のパスを知らせる。
 * プレビュー側は対応する要素を枠で示す。別ウィンドウで開いたプレビューには送らない
 */
export function FieldFocusBridge(props: Props) {
  return (
    <div style={{ display: "contents" }} onFocus={notifyLivePreview}>
      {props.children}
    </div>
  )
}

/** React のフォーカスイベントは子孫とポータルから伝わるため、管理画面全体の入力をここで受ける */
function notifyLivePreview(event: FocusEvent<HTMLDivElement>) {
  const frame = document.getElementById(livePreviewFrameId)
  if (!(frame instanceof HTMLIFrameElement) || frame.contentWindow === null) return

  const message = {
    type: fieldFocusMessageType,
    path: getFocusedFieldPath(event.target),
  } satisfies FieldFocusMessage

  frame.contentWindow.postMessage(message, new URL(frame.src, window.location.href).origin)
}
