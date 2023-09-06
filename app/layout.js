//layout.js
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import Head from "next/head";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kite Sim",
  description:
    "Simulate kite-powered boat journeys with this Traction Kite Flight Simulator",
  image:
    "https://github.com/nicOwlas/kite-sim/blob/main/public/preview.jpg?raw=true",
  url: "https://kite-sim-nicolasdraber.vercel.app/",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        {/* Open Graph */}
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta
          property="og:image"
          content="https://github.com/nicOwlas/kite-sim/blob/main/public/preview.jpg?raw=true"
        />
        <meta property="og:url" content={metadata.url} />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta
          name="twitter:image"
          content="https://github.com/nicOwlas/kite-sim/blob/main/public/preview.jpg?raw=true"
        />
      </Head>
      <body className={inter.className}>
        {children} <Analytics />
      </body>
    </html>
  );
}
