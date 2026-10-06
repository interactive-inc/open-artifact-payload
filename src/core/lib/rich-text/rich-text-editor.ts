import {
  BlocksFeature,
  HeadingFeature,
  lexicalEditor,
  UploadFeature,
} from "@payloadcms/richtext-lexical"

import { SHORT_TEXT_MAX_LENGTH } from "@/core/lib/validation/text-limits"
import { linkButtonBlock } from "@/core/lib/rich-text/link-button-block"
import { markedListBlock } from "@/core/lib/rich-text/marked-list-block"

/**
 * ニュース本文などのエディタ。標準の機能に次の変更を加える。
 * - 見出しは h2・h3 だけにする (h1 は記事タイトルが使う)
 * - 画像にキャプションを付けられるようにする
 * - リンクボタンと記号付きリストのブロックを「+」メニューに追加する
 * ブロックとキャプションは本文の JSON に保存されるため、DB のマイグレーションは要らない。
 */
export const richTextEditor = lexicalEditor({
  features: (args) => [
    ...args.defaultFeatures.filter(
      (feature) => feature.key !== "heading" && feature.key !== "upload",
    ),
    HeadingFeature({ enabledHeadingSizes: ["h2", "h3"] }),
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
