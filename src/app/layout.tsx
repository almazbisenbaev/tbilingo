import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';
import { GoogleAnalytics } from '@next/third-parties/google'
import { Inter } from 'next/font/google';
import { Noto_Serif_Georgian } from 'next/font/google';
import "./globals.css";
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import { AuthProvider } from '@/contexts/AuthContext';
import AnimationProvider from '@/components/AnimationProvider';

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

export const metadata: Metadata = {
  title: "Tbilingo – Learn Georgian alphabet with flashcards",
  description: "Learn Georgian alphabet, words and phrases",
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
        <meta name="google-site-verification" content="cfuRApAKvRomU8FRnyOL2giMwdwF-q1WMg1l7Q-W1og" />
      </head>
      <body
        className={`${notoS_Georgian.variable} ${inter.variable} antialiased`}
      >
        <div className="app">
          <AuthProvider>
            <ServiceWorkerRegistration />
            <AnimationProvider>
              {children}
            </AnimationProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
