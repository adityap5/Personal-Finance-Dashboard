/**
 * Root layout — wraps entire app with SessionProvider, ThemeProvider, Toaster.
 */
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"

export const metadata = {
  title: "Finance Dashboard",
  description: "Track your expenses, manage budgets, and visualize your financial health",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
