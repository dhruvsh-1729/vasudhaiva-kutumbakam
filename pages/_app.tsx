import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "sonner";

// In your main app initialization
import { initializeCleanupScheduler } from '../lib/scheduledCleanup';
initializeCleanupScheduler(); // Runs cleanup every 6 hours

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Toaster position="top-right" />
      <Component {...pageProps} />
    </>
  );
}
