"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      themes={["light", "dark", "noir", "noir-dark", "grass", "grass-dark", "ochre", "ochre-dark", "flow", "flow-dark"]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export { useTheme } from "next-themes"

