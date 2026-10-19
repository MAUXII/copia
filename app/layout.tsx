import type { Metadata } from "next"
import { Caveat, Fraunces, Geist, Geist_Mono } from "next/font/google"
import { SITE_URL } from "@/lib/site"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], style: ["italic"] })
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Copia — free, open-source UI components", template: "%s · Copia" },
  description: "Free, open-source recreations of the best UI components on the web. Copy, paste or install with the shadcn CLI.",
}

/** Applies the saved theme before paint so light mode does not flash dark. */
const themeScript = `try{if(localStorage.getItem("theme")==="light")document.documentElement.classList.remove("dark")}catch(e){}`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${caveat.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
