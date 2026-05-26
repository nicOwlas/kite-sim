import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const previewImage =
  "https://github.com/nicOwlas/kite-sim/blob/main/public/preview.jpg?raw=true";

export const metadata: Metadata = {
  title: "Kite Sim",
  description:
    "Simulate kite-powered boat journeys with this Traction Kite Flight Simulator",
  openGraph: {
    title: "Kite Sim",
    description:
      "Simulate kite-powered boat journeys with this Traction Kite Flight Simulator",
    images: [previewImage],
    url: "https://kite-sim-nicolasdraber.vercel.app/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kite Sim",
    description:
      "Simulate kite-powered boat journeys with this Traction Kite Flight Simulator",
    images: [previewImage],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children} <Analytics />
      </body>
    </html>
  );
}
