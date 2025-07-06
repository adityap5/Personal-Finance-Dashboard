import './globals.css'

export const metadata = {
  title: 'Finance Dashboard',
  description: 'Track your expenses, manage budgets, and visualize your financial health'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
