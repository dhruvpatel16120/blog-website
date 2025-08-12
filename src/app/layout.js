import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "@/components/layout/Providers";
import Layout from "@/components/layout/Layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TechBlog - Modern Tech News & Tutorials",
  description: "A modern tech blog featuring the latest in technology, programming tutorials, and digital innovation. Built with Next.js and Tailwind CSS.",
  keywords: "tech blog, programming, tutorials, web development, technology news",
  authors: [{ name: "TechBlog Team" }],
  openGraph: {
    title: "TechBlog - Modern Tech News & Tutorials",
    description: "A modern tech blog featuring the latest in technology, programming tutorials, and digital innovation.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechBlog - Modern Tech News & Tutorials",
    description: "A modern tech blog featuring the latest in technology, programming tutorials, and digital innovation.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'};document.documentElement.setAttribute('data-theme',t);if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})();`}
        </Script>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
