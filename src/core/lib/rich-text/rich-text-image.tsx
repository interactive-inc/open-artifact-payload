import type { CSSProperties, ReactNode } from "react"

type Props = {
  image: ReactNode
  caption: string | null
  isInParagraph: boolean
  style?: CSSProperties
}

/**
 * 本文の画像。エディタで指定した配置 (中央・右) は Payload が style として差し込むため、包む要素へ渡す。
 * 移行した画像は段落の中にあり、p の中に figure を置くとブラウザが段落を閉じてしまうため、段落の中では span で包む。
 */
export function RichTextImage(props: Props) {
  if (props.caption === null) {
    const className =
      props.style === undefined ? "rich-text-image" : "rich-text-image rich-text-image--aligned"

    return (
      <span className={className} style={props.style}>
        {props.image}
      </span>
    )
  }

  if (props.isInParagraph) {
    return (
      <span className="rich-text-figure" style={props.style}>
        {props.image}
        <span className="rich-text-figure__caption">{props.caption}</span>
      </span>
    )
  }

  return (
    <figure className="rich-text-figure" style={props.style}>
      {props.image}
      <figcaption className="rich-text-figure__caption">{props.caption}</figcaption>
    </figure>
  )
}
