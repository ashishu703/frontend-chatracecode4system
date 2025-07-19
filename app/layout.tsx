import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { useQuery } from '@tanstack/react-query';
import React, { createContext, useContext } from 'react';
import { AppProvider } from './AppSettingsProvider';

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MBG - Business Automation Platform",
  description: "Transform your business with AI-powered automation",
    generator: 'v0.dev'
}

export function useAppSettings() {
  return useContext(AppSettingsContext);
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={inter.className}>
        <Providers>
          <AppProvider>{children}</AppProvider>
        </Providers>
      </body>
    </html>
  )
}
