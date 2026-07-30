import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UPN QR Generator",
  description: "Local Slovenian UPN QR payment code generator"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
