import { BlocksFeature, lexicalEditor, UploadFeature } from "@payloadcms/richtext-lexical"

import { SHORT_TEXT_MAX_LENGTH } from "@/core/lib/validation/text-limits"
import { linkButtonBlock } from "@/core/lib/rich-text/link-button-block"
import { markedListBlock } from "@/core/lib/rich-text/marked-list-block"

/**
 * ニュース本文などのエディタ。ルートエディタ (config.editor) の機能を引き継ぎ、次を足す。
 * - 画像にキャプションを付けられるようにする
 * - リンクボタンと記号付きリストのブロックを「+」メニューに追加する
 * ブロックとキャプションは本文の JSON に保存されるため、DB のマイグレーションは要らない。
 * ルートエディタで BlocksFeature を使っている場合は、ここで blocks をまとめる (同じ機能は二重に登録できない)。
 */
export const richTextEditor = lexicalEditor({
  features: (args) => [
    ...args.rootFeatures.filter((feature) => feature.key !== "upload"),
    UploadFeature({
      collections: {
        media: {
          fields: [
            {
              name: "caption",
              label: "キャプション",
              type: "text",
              maxLength: SHORT_TEXT_MAX_LENGTH,
            },
          ],
        },
      },
    }),
    BlocksFeature({ blocks: [linkButtonBlock, markedListBlock] }),
  ],
})
