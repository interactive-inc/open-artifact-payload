import React from "react"
import type { Preview } from "@storybook/react-vite"
import { withThemeByClassName } from "@storybook/addon-themes"

import { TooltipProvider } from "../src/project/shared/ui/tooltip"
import "../src/app/(frontend)/[locale]/styles.css"

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#111111" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: { test: "error" },
  },
  decorators: [
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
    (Story) => (
      <TooltipProvider>
        <div className="font-sans antialiased bg-background text-foreground p-4">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
}

export default preview
