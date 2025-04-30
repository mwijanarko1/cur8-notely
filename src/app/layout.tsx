import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import FirebaseInitializer from "@/components/FirebaseInitializer";

// Initialize the Geist font with Latin subset
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Initialize the Geist Mono font with Latin subset
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define metadata for better SEO
export const metadata: Metadata = {
  title: "Cur8 Notely - Simple & Secure Note-Taking",
  description: "A secure note-taking application with user authentication",
  keywords: ["Notes", "Security", "Authentication", "Firebase", "Next.js"],
  authors: [{ name: "Built by @mikhailbuilds" }],
  creator: "Built by @mikhailbuilds",
  publisher: "Cur8 Notely",
  openGraph: {
    title: "Cur8 Notely - Simple & Secure Note-Taking",
    description: "A secure note-taking application with user authentication",
    url: "https://cur8-notely.example.com/",
    siteName: "Cur8 Notely",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cur8 Notely",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cur8 Notely - Simple & Secure Note-Taking",
    description: "A secure note-taking application with user authentication",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <FirebaseInitializer />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
