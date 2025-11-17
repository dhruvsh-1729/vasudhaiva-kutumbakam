import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AuthenticatedFetchInit, clientAuth } from "@/lib/auth/clientAuth";

export default function LogoutPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Signing you out...");

  useEffect(() => {
    const reason = typeof router.query.reason === "string" ? router.query.reason : null;
    if (reason) {
      setMessage(reason);
    }

    const runLogout = async () => {
      const token = clientAuth.getToken();
      clientAuth.clearSession();

      if (token) {
        try {
          const options: AuthenticatedFetchInit = {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            skipAuthHeader: true, // avoid recursive interceptor header injection
          };
          await fetch("/api/auth/logout", options);
        } catch (error) {
          console.warn("Failed to notify server about logout", error);
        }
      }

      // Redirect to login after a short delay to show the status message
      setTimeout(() => {
        router.replace("/login");
      }, 600);
    };

    runLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 px-6">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md text-center border border-orange-100">
        <div className="mx-auto h-14 w-14 mb-4 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center text-2xl font-bold">
          VK
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Signing out</h1>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-center">
          <span className="h-10 w-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" aria-hidden="true"></span>
        </div>
      </div>
    </div>
  );
}
