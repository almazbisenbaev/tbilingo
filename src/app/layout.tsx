import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';
import { Inter } from 'next/font/google';
import { Noto_Serif_Georgian } from 'next/font/google';
import "./globals.css";

const notoS_Georgian = Noto_Serif_Georgian({
  subsets: ['georgian'],
  display: 'swap',
  variable: '--font-noto-serif-georgian',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// import IOSInstallPrompt from '@/components/IOSInstallPrompt';

export const metadata: Metadata = {
  title: "Tbilingo – Learn Georgian alphabet with flashcards",
  description: "An easy way to learn the Georgian alphabet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a202c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body
        className={`${notoS_Georgian.variable} ${inter.variable} antialiased`}
      >
        {children}

        {/* <IOSInstallPrompt /> */}

        <Analytics />
      </body>
    </html>
  );
}
