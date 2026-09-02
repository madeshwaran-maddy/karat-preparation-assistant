"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewerLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const candidateData = localStorage.getItem("candidate");
    if (!candidateData) {
      router.replace("/login");
      return;
    }

    try {
      const candidate = JSON.parse(candidateData) as { role?: string };
      if (candidate.role?.toLowerCase() !== "reviewer") {
        router.replace("/dashboard");
        return;
      }

      setAuthorized(true);
    } catch {
      localStorage.removeItem("candidate");
      router.replace("/login");
    }
  }, [router]);

  if (!authorized) {
    return null;
  }

  return children;
}