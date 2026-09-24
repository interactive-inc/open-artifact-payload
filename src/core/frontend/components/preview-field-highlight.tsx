"use client"

import { startPreviewFieldHighlight } from "@/core/lib/preview/start-preview-field-highlight"

/**
 * 管理画面のライブプレビュー内でだけ、編集中の項目に対応する要素を枠で示す。
 * 通常の閲覧では枠を隠したまま何も購読しない
 */
export function PreviewFieldHighlight() {
  return (
    <div
      ref={attachPreviewFieldHighlight}
      hidden
      aria-hidden="true"
      data-preview-field-highlight=""
      className="pointer-events-none fixed top-0 left-0 z-[2147483647] rounded-[6px] border-[1.5px] border-preview-highlight bg-preview-highlight/[0.04] transition-opacity duration-150 ease-out starting:opacity-0 data-moving:transition-[opacity,transform,width,height] data-moving:duration-200 motion-reduce:transition-none"
    />
  )
}

/** 枠が描画されている間だけ編集画面からの通知を購読する */
function attachPreviewFieldHighlight(overlay: HTMLDivElement | null) {
  if (overlay === null || window.parent === window) return

  const editorOrigin = new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? window.location.origin).origin

  return startPreviewFieldHighlight({ overlay, editor: window.parent, editorOrigin })
}
