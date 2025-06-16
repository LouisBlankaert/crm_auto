import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRM Auto - Gestion de clients automobile",
  description: "Application de gestion de clients pour concessionnaire automobile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <header className="bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <Link href="/" className="text-xl font-bold text-blue-600">
                  CRM Auto
                </Link>
              </div>
              <nav className="flex items-center space-x-4">
                <Link href="/" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md">
                  Tableau de bord
                </Link>
                <Link href="/sellers" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md">
                  Vendeurs
                </Link>
                <Link href="/buyers" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md">
                  Acheteurs
                </Link>
                <Link href="/vehicles" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md">
                  Stock
                </Link>
                <Link href="/reminders" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md">
                  Rappels
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-gray-50 border-t py-4">
          <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} CRM Auto - Tous droits réservés
          </div>
        </footer>
      </body>
    </html>
  );
}
