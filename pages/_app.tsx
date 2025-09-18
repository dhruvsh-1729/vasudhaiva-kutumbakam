import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next"

// In your main app initialization
// import { initializeCleanupScheduler } from '../lib/scheduledCleanup';
// initializeCleanupScheduler(); // Runs cleanup every 6 hours

const isProduction = process.env.NODE_ENV === "production";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {isProduction && <Analytics />}
      <Toaster position="top-right" />
      <Component {...pageProps} />
    </>
  );
}
