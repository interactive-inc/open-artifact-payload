import type { SerializedLexicalNode } from "@payloadcms/richtext-lexical/lexical"
import { RichText } from "@payloadcms/richtext-lexical/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vite-plus/test"

import { richTextConverters } from "@/core/lib/rich-text/rich-text-converters"

const image = {
  id: 1,
  url: "/a.png",
  mimeType: "image/png",
  width: 10,
  height: 10,
  alt: "",
  filename: "a.png",
}

// 配置はエディタ標準の機能で保存され、Payload が描画結果へ style として差し込む
const render = (children: SerializedLexicalNode[]) =>
  renderToStaticMarkup(
    <RichText
      data={{
        root: { type: "root", format: "", indent: 0, version: 1, direction: null, children },
      }}
      converters={richTextConverters}
    />,
  )

describe("richTextConverters", () => {
  it("エディタで指定した画像の配置を、キャプションの有無にかかわらず表示に反映する", () => {
    const captioned = {
      type: "upload",
      version: 3,
      format: "right",
      id: "u1",
      relationTo: "media",
      value: image,
      fields: { caption: "キャプション" },
    }
    const centered = { ...captioned, format: "center", id: "u2", fields: {} }

    const html = render([captioned, centered])

    expect(html).toContain('<figure class="rich-text-figure" style="text-align:right">')
    expect(html).toContain(
      '<figcaption class="rich-text-figure__caption">キャプション</figcaption>',
    )
    expect(html).toContain(
      '<span class="rich-text-image rich-text-image--aligned" style="text-align:center">',
    )
  })

  it("記号付きリストを 1 行 1 項目で描画し、配置を反映する", () => {
    const list = {
      type: "block",
      version: 2,
      format: "center",
      fields: {
        id: "b1",
        blockName: "",
        blockType: "markedList",
        marker: "note",
        items: "一つ目\n\n二つ目",
      },
    }

    expect(render([list])).toContain(
      '<ul class="marked-list marked-list--note" style="text-align:center"><li>一つ目</li><li>二つ目</li></ul>',
    )
  })

  it("リンクボタンを描画し、下書きで文言が未入力なら出さない", () => {
    const button = {
      type: "block",
      version: 2,
      format: "",
      fields: {
        id: "b2",
        blockName: "",
        blockType: "linkButton",
        label: "外部サイト",
        href: "https://example.com/",
        size: "small",
      },
    }
    const draft = { ...button, fields: { ...button.fields, id: "b3", label: "" } }

    const html = render([button, draft])

    expect(html).toContain('class="rich-text-button rich-text-button--small"')
    expect(html).toContain('target="_blank"')
    expect(html.match(/rich-text-link-button/g)).toHaveLength(1)
  })
})
