import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "../styles/global.scss";

export const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  style: ["normal"],
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "DevButter",
  description: "DevButter: Software Development and Data Analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/devbutter.svg" sizes="any" />
      <body className={roboto.className}>{children}</body>
    </html>
  );
}
