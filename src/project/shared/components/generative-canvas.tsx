'use client'

import React from 'react'

type Variant = 'attractor' | 'metaballs' | 'truchet' | 'apollonian' | 'penrose' | 'wang'

type Props = {
  variant: Variant
  className?: string
}

type Rgb = readonly [number, number, number]

// モノクロ基調。濃淡のグレーで幾何学を描き、クールな印象にする。
const palette: ReadonlyArray<Rgb> = [
  [30, 30, 34],
  [90, 90, 96],
  [150, 150, 156],
  [60, 60, 66],
  [120, 120, 128],
]

// 白地に複数のジェネラティブアルゴリズムを描き分ける Canvas。
// メインの metaballs だけアニメーションし、装飾系（truchet/apollonian/penrose/wang）は静的に一度描く。
export function GenerativeCanvas(props: Props) {
  const setupCanvas = (canvas: HTMLCanvasElement | null) => {
    if (canvas === null) return

    const context = canvas.getContext('2d')

    if (context === null) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let time = 0
    let frameId = 0

    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * ratio
      canvas.height = height * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const clearWhite = () => {
      context.globalCompositeOperation = 'source-over'
      context.fillStyle = 'rgb(255,255,255)'
      context.fillRect(0, 0, width, height)
    }

    // 粒状ノイズを重ねてフィルムのような質感を出す。決定的な擬似乱数で毎回同じ模様にする。
    const addNoise = (density: number, alpha: number) => {
      context.globalCompositeOperation = 'source-over'
      const count = Math.floor(width * height * density)

      for (let i = 0; i < count; i++) {
        const seed = (i * 9301 + 49297) % 233280
        const rand = seed / 233280
        const x = (rand * width * 7.3) % width
        const y = ((seed * 1.7) % 233280) / 233280 * height
        const shade = 20 + ((seed * 3) % 120)
        context.fillStyle = `rgba(${shade},${shade},${shade},${alpha})`
        context.fillRect(x, y, 1, 1)
      }
    }

    // 発光する有機的なブロブが漂い融合する液体的表現。
    const drawMetaballs = () => {
      clearWhite()
      context.globalCompositeOperation = 'multiply'

      const blobCount = 9

      for (let index = 0; index < blobCount; index++) {
        const baseX = ((index * 137) % 100) / 100
        const baseY = ((index * 79) % 100) / 100
        const radius = 0.18 + (((index * 53) % 100) / 100) * 0.16
        const ax = 0.12 + (((index * 31) % 100) / 100) * 0.18
        const ay = 0.1 + (((index * 47) % 100) / 100) * 0.2
        const phase = (((index * 61) % 100) / 100) * Math.PI * 2
        const speed = 0.18 + (((index * 23) % 100) / 100) * 0.3
        const rgb = palette[index % palette.length]

        const cx = (baseX + Math.cos(time * speed + phase) * ax) * width
        const cy = (baseY + Math.sin(time * speed * 0.9 + phase) * ay) * height
        const r = radius * Math.min(width, height) * 1.4
        const pulse = 0.85 + Math.sin(time * speed * 1.7 + phase) * 0.15

        const gradient = context.createRadialGradient(cx, cy, 0, cx, cy, r * pulse)
        gradient.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.85)`)
        gradient.addColorStop(0.5, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.4)`)
        gradient.addColorStop(1, 'rgba(255,255,255,0)')

        context.fillStyle = gradient
        context.beginPath()
        context.arc(cx, cy, r * pulse, 0, Math.PI * 2)
        context.fill()
      }

      context.globalCompositeOperation = 'source-over'
    }

    // トルシェタイル。各セルにランダムな向きの四分円を2本描き、繋がる迷路状の曲線を作る。
    const drawTruchet = () => {
      clearWhite()
      const cell = Math.max(40, Math.min(width, height) / 14)
      context.lineWidth = 1.4

      for (let gy = 0; gy * cell < height; gy++) {
        for (let gx = 0; gx * cell < width; gx++) {
          const x = gx * cell
          const y = gy * cell
          const flip = (gx * 7 + gy * 13) % 2 === 0
          const rgb = palette[(gx + gy) % palette.length]
          context.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.5)`

          context.beginPath()
          if (flip) {
            context.arc(x, y, cell / 2, 0, Math.PI / 2)
            context.arc(x + cell, y + cell, cell / 2, Math.PI, Math.PI * 1.5)
          } else {
            context.arc(x + cell, y, cell / 2, Math.PI / 2, Math.PI)
            context.arc(x, y + cell, cell / 2, Math.PI * 1.5, Math.PI * 2)
          }
          context.stroke()
        }
      }
    }

    // アポロニウスのギャスケット。3つの相互接触円から再帰的に内接円を詰めていく。
    const drawApollonian = () => {
      clearWhite()
      const cx = width / 2
      const cy = height / 2
      const big = Math.min(width, height) * 0.42

      const drawCircle = (x: number, y: number, r: number, depth: number) => {
        if (r < 4 || depth > 5) return
        const rgb = palette[depth % palette.length]
        context.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.55)`
        context.lineWidth = 1.2
        context.beginPath()
        context.arc(x, y, r, 0, Math.PI * 2)
        context.stroke()

        const child = r * 0.5
        drawCircle(x, y - r + child, child, depth + 1)
        drawCircle(x - r + child, y + child * 0.6, child * 0.8, depth + 1)
        drawCircle(x + r - child, y + child * 0.6, child * 0.8, depth + 1)
      }

      drawCircle(cx, cy, big, 0)
    }

    // ペンローズ風の五回対称。中心から放射する菱形を回転配置し、準結晶的なパターンを作る。
    const drawPenrose = () => {
      clearWhite()
      const cx = width / 2
      const cy = height / 2
      const scale = Math.min(width, height) * 0.45
      const rings = 5

      for (let ring = 1; ring <= rings; ring++) {
        const count = ring * 5
        const radius = (ring / rings) * scale
        const rgb = palette[ring % palette.length]
        context.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.5)`
        context.lineWidth = 1.1

        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2
          const x = cx + Math.cos(angle) * radius
          const y = cy + Math.sin(angle) * radius
          const size = scale / rings / 2.2

          context.beginPath()
          context.moveTo(x, y - size)
          context.lineTo(x + size * 0.6, y)
          context.lineTo(x, y + size)
          context.lineTo(x - size * 0.6, y)
          context.closePath()
          context.stroke()
        }
      }
    }

    // Wang タイル風。各セルの四辺に色を割り当て、隣接が連続する帯模様を敷き詰める。
    const drawWang = () => {
      clearWhite()
      const cell = Math.max(48, Math.min(width, height) / 12)

      for (let gy = 0; gy * cell < height; gy++) {
        for (let gx = 0; gx * cell < width; gx++) {
          const x = gx * cell
          const y = gy * cell
          const rgb = palette[(gx * 3 + gy * 5) % palette.length]
          const dir = (gx + gy) % 2 === 0

          context.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.45)`
          context.lineWidth = 2
          context.beginPath()
          if (dir) {
            context.moveTo(x, y)
            context.lineTo(x + cell, y + cell)
          } else {
            context.moveTo(x + cell, y)
            context.lineTo(x, y + cell)
          }
          context.stroke()
        }
      }
    }

    const renderOnce = () => {
      if (props.variant === 'truchet') drawTruchet()
      else if (props.variant === 'apollonian') drawApollonian()
      else if (props.variant === 'penrose') drawPenrose()
      else if (props.variant === 'wang') drawWang()
      else drawMetaballs()

      addNoise(0.04, 0.5)
    }

    const loop = () => {
      drawMetaballs()
      time = time + 0.01
      if (!reduceMotion) frameId = window.requestAnimationFrame(loop)
    }

    // Clifford ストレンジアトラクター。黒い点が紙の上に堆積し、水墨画のような有機的な軌跡を描く。
    const startAttractor = () => {
      const a = -2.0
      const b = -2.34
      const c = 1.28
      const d = 2.6
      const scale = width / 4.4
      const ox = width / 2
      const oy = height / 2
      let x = 0.1
      let y = 0.1

      context.globalCompositeOperation = 'source-over'
      context.fillStyle = 'rgb(255,255,255)'
      context.fillRect(0, 0, width, height)

      const tick = () => {
        // 直前のフレームを薄い紙色で覆い、軌跡をゆっくり堆積させる。
        context.fillStyle = 'rgba(255,255,255,0.04)'
        context.fillRect(0, 0, width, height)

        context.fillStyle = 'rgba(20,20,24,0.25)'
        const iterations = reduceMotion ? 120000 : 3000

        for (let i = 0; i < iterations; i++) {
          const nx = Math.sin(a * y) - Math.cos(b * x)
          const ny = Math.sin(c * x) - Math.cos(d * y)
          x = nx
          y = ny
          context.fillRect(ox + x * scale, oy + y * scale, 1, 1)
        }

        if (!reduceMotion) frameId = window.requestAnimationFrame(tick)
      }

      tick()
    }

    resize()
    window.addEventListener('resize', resize)

    if (props.variant === 'attractor') {
      startAttractor()
    } else if (props.variant === 'metaballs' && !reduceMotion) {
      loop()
    } else {
      renderOnce()
    }
  }

  return <canvas ref={setupCanvas} aria-hidden className={props.className} />
}
