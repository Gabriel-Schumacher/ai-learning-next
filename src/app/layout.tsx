import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DataStorageProvider from "./context_providers/data_context/DataProvider";
import { ToastProvider } from './components/ToastContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Learning Assistant",
  description: "An AI-powered learning assistant to help you study and learn more effectively.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="SeniorProject" className="w-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-full`}
        id="root"
      >
        <DataStorageProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </DataStorageProvider>
      </body>
    </html>
  );
}
