import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Next.JS Assognment',
  description: 'This is assignment for position of Next.Js developer intern at CareerSecure',
  keywords: ['Next.js', 'React', 'Chat App', 'AI', 'Google Gemini', 'MongoDB'],
  authors: [{ name: 'Chinmay Kulkarni'}],
  
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
