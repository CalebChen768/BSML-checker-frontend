import type { Metadata } from 'next'
import './globals.css'
import Footer from '../components/footer'

export const metadata: Metadata = {
  title: 'BSML Model Checker',
  description: 'A model checker for the Bilateral State-based Modal Logic(BSML) language',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {/* 页面主体内容，占据剩余空间 */}
        <main className="flex-grow">
          {children}
        </main>

        {/* 底部 Footer */}
        <Footer />
      </body>
    </html>
  )
}