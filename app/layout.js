import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kite Sim",
  description: "Traction Kite Flight Simulator",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Open Graph */}
        <meta property="og:title" content="Kite Simulator" />
        <meta
          property="og:description"
          content="Kite Simulator For Commercial Boat Traction"
        />
        <meta
          property="og:image"
          content="https://github.com/nicOwlas/kite-sim/blob/main/public/preview.jpg?raw=true"
        />
        <meta
          property="og:url"
          content="https://kite-sim-nicolasdraber.vercel.app/"
        />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Kite Simulator" />
        <meta
          name="twitter:description"
          content="Kite Simulator For Commercial Boat Traction"
        />
        <meta
          name="twitter:image"
          content="https://github.com/nicOwlas/kite-sim/blob/main/public/preview.jpg?raw=true"
        />
      </head>
      <body className={inter.className}>
        {children} <Analytics />
      </body>
    </html>
  );
}
