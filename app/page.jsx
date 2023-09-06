import Head from "next/head";
import App from "./app";

export default function Home() {
  return (
    <>
      <Head>
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
      </Head>
      <App />
    </>
  );
}
