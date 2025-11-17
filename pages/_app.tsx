import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Head from "next/head";
import { useEffect } from "react";
import { clientAuth } from "@/lib/auth/clientAuth";

// In your main app initialization
// import { initializeCleanupScheduler } from '../lib/scheduledCleanup';
// initializeCleanupScheduler(); // Runs cleanup every 6 hours

const isProduction = process.env.NODE_ENV === "production";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    clientAuth.attachInterceptor();
  }, []);

  return (
    <>
    <Head>
      {/* Favicon / Head icon */}
      <link rel="icon" type="image/webp" href="/jyot_logo.webp" />
      <title>Vasudhaiva Kutumbakam</title>
    </Head>
    {isProduction && <SpeedInsights />}
    {isProduction && <Analytics />}
    <Toaster position="top-right" />
    <Component {...pageProps} />
    </>
  );
}
