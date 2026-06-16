import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "LeadCop | Stop Fake Emails",
  description: "Protect your website forms from low-quality, disposable, and role-based email addresses.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://leadcop.com"),
  openGraph: {
    title: "LeadCop | Stop Fake Emails",
    description: "Protect your website forms from low-quality, disposable, and role-based email addresses.",
    url: "/",
    siteName: "LeadCop",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LeadCop | Stop Fake Emails",
    description: "Protect your website forms from low-quality, disposable, and role-based email addresses.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        {/* We will add ThemeProvider and AuthProvider wrappers here later */}
        {children}
      </body>
    </html>
  );
}
