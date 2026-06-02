import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/(frontend)/**/*.{ts,tsx}',
    './src/core/sections/**/*.{ts,tsx}',
    './src/core/frontend/**/*.{ts,tsx}',
    './src/project/pages/**/*.{ts,tsx}',
    './src/project/shared/**/*.{ts,tsx}',
    './.storybook/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans JP"', 'Hiragino Sans', 'Yu Gothic', 'sans-serif'],
        mono: ['"Roboto Mono"', 'monospace'],
      },
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'collapsible-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'collapsible-down': 'collapsible-down 0.2s ease-out',
        'collapsible-up': 'collapsible-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    // shadcn sera スタイルの data-open:/data-closed: バリアントを v3 で再現
    plugin(({ addVariant }) => {
      addVariant('data-open', ['&[data-state="open"]', '&[data-open]:not([data-open="false"])'])
      addVariant('data-closed', [
        '&[data-state="closed"]',
        '&[data-closed]:not([data-closed="false"])',
      ])
      addVariant('data-checked', [
        '&[data-state="checked"]',
        '&[data-checked]:not([data-checked="false"])',
      ])
      addVariant('data-unchecked', [
        '&[data-state="unchecked"]',
        '&[data-unchecked]:not([data-unchecked="false"])',
      ])
      addVariant('data-selected', ['&[data-selected="true"]'])
      addVariant('data-disabled', [
        '&[data-disabled="true"]',
        '&[data-disabled]:not([data-disabled="false"])',
      ])
      addVariant('data-active', [
        '&[data-state="active"]',
        '&[data-active]:not([data-active="false"])',
      ])
    }),
  ],
}

export default config
