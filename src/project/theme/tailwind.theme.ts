// 案件のブランドカラー・フォントはここで一元管理する。
// hex はこのファイルにのみ記述し、コンポーネントでは Tailwind クラス (bg-brand, text-muted 等) を使う。
// neutral / surface / error / success は管理画面 (custom.scss) のパレットに揃えてある。
export const projectTailwindTheme = {
  colors: {
    brand: {
      DEFAULT: '#1a5f7a',
      light: '#3a7a94',
      dark: '#0f4558',
    },
    accent: {
      DEFAULT: '#ff6b35',
    },
    // サーフェス系 (背景・本文・補助テキスト・枠線)
    surface: '#ffffff',
    foreground: '#111212',
    // 補助テキスト。surface(#fff) 上で WCAG AA (4.5:1) を満たす濃さにしてある。
    muted: '#5c5f5f',
    border: '#d2d4d5',
    // 意味的な色
    error: '#c42b2b',
    success: '#2d7a4f',
    // グレースケール (必要に応じて利用)
    neutral: {
      50: '#f7f8f8',
      100: '#e4e6e6',
      200: '#d2d4d5',
      300: '#b0b3b3',
      400: '#888b8b',
      500: '#535555',
      600: '#3a3c3c',
      700: '#2d2f2f',
      800: '#1e2020',
      900: '#111212',
    },
  },
  fontFamily: {
    sans: ['"Noto Sans JP"', 'Hiragino Sans', 'sans-serif'],
  },
}
