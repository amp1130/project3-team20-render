import { type Metadata } from 'next'
import {
  ClerkProvider,
  SignIn,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ManagerProvider } from '@/context/manager-context'
import Image from 'next/image'

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
              <div className="min-h-screen bg-[#edd2ad] relative overflow-hidden">
                {/* Tiled logo background pattern */}
                <div className="absolute inset-0 z-0">
                  {/* Generate a 4x4 grid of logos */}
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute opacity-10"
                      style={{
                        top: `${Math.floor(i / 4) * 25}%`,
                        left: `${(i % 4) * 25}%`,
                        width: '25%',
                        height: '25%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <div className="relative w-24 h-24">
                        <Image 
                          src="/logo.png" 
                          alt="Logo"
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Decorative elements */}
                <div className="absolute inset-0 bg-[#a67c52]/5 z-0"></div>
                <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-[#a67c52]/10 to-transparent z-0"></div>
                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#a67c52]/10 to-transparent z-0"></div>
                
                {/* Clerk sign-in component */}
                <div className="flex min-h-screen items-center justify-center relative z-10">
                    <SignIn routing="hash" />
                </div>
              </div>
            </SignedOut>
            <SignedIn>
              <ManagerProvider>
                {children}
              </ManagerProvider>
            </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  )
}