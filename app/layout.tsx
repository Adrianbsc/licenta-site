import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DentalClinic Timișoara",
    template: "%s | DentalClinic Timișoara",
  },
  description:
    "Cabinet stomatologic în Timișoara pentru consultații, igienizare, estetică dentară și tratamente explicate clar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
