import type { Metadata } from 'next'
import './globals.css'
import Footer from '../components/footer'

export const metadata: Metadata = {
  title: 'BSML Model Checker',
  description: 'A model checker for the Bilateral State-based Modal Logic(BSML) language',
  // generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Footer />
      </body>
      
    </html>
  )
}
