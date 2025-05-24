
"use client"; // Required for useEffect

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect } from 'react'; // Added useEffect

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Removed metadata export as it conflicts with "use client"
// export const metadata: Metadata = {
//   title: 'SocietyPay',
//   description: 'Manage your society maintenance payments effortlessly.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered successfully with scope: ', registration.scope);
          })
          .catch((err) => {
            console.error('Service Worker registration failed: ', err);
          });
      });
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#64B5F6" /> 
        {/* Add other meta tags like viewport if not already handled by Next.js defaults */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthProvider>
          <SidebarProvider defaultOpen={true}>
            {children}
          </SidebarProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
