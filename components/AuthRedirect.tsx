"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function AuthRedirect({ to = "/chat" }: { to?: string }) {
  const router = useRouter();

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace(to);
      }
    });
  }, [router, to]);

  return null;
}
