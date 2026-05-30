import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cata Stoma Timișoara",
  description:
    "Cabinet stomatologic în Timișoara pentru consultații, igienizare și tratamente dentare.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
