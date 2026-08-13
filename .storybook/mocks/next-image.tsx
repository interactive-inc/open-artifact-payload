import React, { type CSSProperties, type ImgHTMLAttributes } from "react"

type StaticImageData = {
  blurDataURL?: string
  height: number
  src: string
  width: number
}

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "height" | "src" | "width"> & {
  blurDataURL?: string
  fill?: boolean
  height?: number | `${number}`
  loader?: unknown
  placeholder?: "blur" | "empty" | `data:image/${string}`
  priority?: boolean
  quality?: number | `${number}`
  sizes?: string
  src: string | StaticImageData
  style?: CSSProperties
  unoptimized?: boolean
  width?: number | `${number}`
}

export default function NextImage({
  blurDataURL: _blurDataURL,
  fill,
  height,
  loader: _loader,
  placeholder: _placeholder,
  priority: _priority,
  quality: _quality,
  src,
  style,
  unoptimized: _unoptimized,
  width,
  ...imageProps
}: Props) {
  const staticImage = typeof src === "string" ? undefined : src
  return React.createElement("img", {
    ...imageProps,
    height: fill ? undefined : (height ?? staticImage?.height),
    src: typeof src === "string" ? src : src.src,
    style: fill
      ? {
          height: "100%",
          inset: 0,
          objectFit: "cover",
          position: "absolute",
          width: "100%",
          ...style,
        }
      : style,
    width: fill ? undefined : (width ?? staticImage?.width),
  })
}
