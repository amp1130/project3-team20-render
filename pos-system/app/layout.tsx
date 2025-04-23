import { ClerkProvider, SignIn, SignedIn, SignedOut } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ManagerProvider } from "@/context/manager-context";
import { ThemeProvider } from "@/context/theme-context";
import { FontSizeProvider } from "@/context/font-size-context";
import Image from "next/image";
import PageMagnifier from "@/components/page-magnifier";
import { MagnifierProvider } from "@/context/page-magnifier-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "POS System",
  description: "Point of Sale System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-300`}
        >
          <div id="app-content">
            <SignedOut>
              <div className="min-h-screen bg-[#edd2ad] relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute opacity-10"
                      style={{
                        top: `${Math.floor(i / 4) * 25}%`,
                        left: `${(i % 4) * 25}%`,
                        width: "25%",
                        height: "25%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <div className="relative w-24 h-24">
                        <Image
                          src="/logo.png"
                          alt="Logo"
                          fill
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute inset-0 bg-[#a67c52]/5 z-0"></div>
                <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-[#a67c52]/10 to-transparent z-0"></div>
                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#a67c52]/10 to-transparent z-0"></div>

                <div className="flex min-h-screen items-center justify-center relative z-10">
                  <SignIn routing="hash" />
                </div>
              </div>
            </SignedOut>

            <SignedIn>
              <FontSizeProvider>
                <ThemeProvider>
                  <ManagerProvider>
                    <MagnifierProvider>
                      {children}  
                      <PageMagnifier zoom={2} lensSize={500} />
                    </MagnifierProvider>
                  </ManagerProvider>
                </ThemeProvider>
              </FontSizeProvider>
            </SignedIn>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
