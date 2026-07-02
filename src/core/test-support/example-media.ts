import type { Media } from '@/payload-types'

// Storybook / テスト用のサンプル Media。
export const exampleMedia: Media = {
  id: 1,
  alt: 'サンプル画像',
  url: 'https://placehold.co/1200x600/png',
  width: 1200,
  height: 600,
  mimeType: 'image/png',
  filename: 'sample.png',
  filesize: 123456,
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
}
