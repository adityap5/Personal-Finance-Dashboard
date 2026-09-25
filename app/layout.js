/**
 * Root layout — pure dark mode fintech theme with SessionProvider, ThemeProvider, Toaster.
 */
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"

export const metadata = {
  title: "FinanceIQ — Personal Finance Dashboard",
  description: "Track your expenses, manage budgets, reminders, and visualize your financial health",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <body className="bg-[#030c07] text-white antialiased">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors theme="dark" position="top-right" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
