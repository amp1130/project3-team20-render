import { type Metadata } from 'next'
import {
  ClerkProvider,
  SignIn,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'POS System',
  description: 'Point of Sale System',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <SignedOut>
              <div className="flex min-h-screen items-center justify-center">
                <SignIn routing="hash" />
              </div>
            </SignedOut>
            <SignedIn>
              {children}
            </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  )
}