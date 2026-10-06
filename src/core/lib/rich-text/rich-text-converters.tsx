import type { DefaultNodeTypes, SerializedBlockNode } from "@payloadcms/richtext-lexical"
import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react"

import type { LinkButtonBlock, MarkedListBlock } from "@/payload-types"

import { MarkedList } from "@/core/lib/rich-text/marked-list"
import { RichTextImage } from "@/core/lib/rich-text/rich-text-image"
import { RichTextLinkButton } from "@/core/lib/rich-text/rich-text-link-button"

export type RichTextNode =
  | DefaultNodeTypes
  | SerializedBlockNode<LinkButtonBlock>
  | SerializedBlockNode<MarkedListBlock>

/**
 * リッチテキストの描画規則。Payload 標準の描画に次を足す。
 * - 画像: 標準の描画を包み、エディタで指定した配置とキャプションを反映する
 * - リンクボタン・記号付きリスト: richTextEditor のブロック
 */
export const richTextConverters: JSXConvertersFunction<RichTextNode> = (args) => ({
  ...args.defaultConverters,
  upload: (uploadArgs) => {
    const defaultUpload = args.defaultConverters.upload
    const image = typeof defaultUpload === "function" ? defaultUpload(uploadArgs) : defaultUpload

    if (image === null || image === undefined) return null

    const caption = uploadArgs.node.fields?.caption

    return (
      <RichTextImage
        image={image}
        caption={typeof caption === "string" && caption.trim() !== "" ? caption.trim() : null}
        isInParagraph={uploadArgs.parent.type !== "root"}
      />
    )
  },
  blocks: {
    linkButton: (blockArgs) => <RichTextLinkButton fields={blockArgs.node.fields} />,
    markedList: (blockArgs) => <MarkedList block={blockArgs.node.fields} />,
  },
})
