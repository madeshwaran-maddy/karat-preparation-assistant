"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";

interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  mock_enabled?: boolean;
}

export default function CandidatePage() {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const router = useRouter();

  useEffect(() => {
    const loadCandidate = async () => {
      const candidateData = localStorage.getItem("candidate");
      if (!candidateData) {
        router.push("/login");
        setLoading(false);
        return;
      }

      const storedCandidate = JSON.parse(candidateData) as Candidate;

      try {
        const response = await fetch(`/api/reviewer/candidate?search=${encodeURIComponent(storedCandidate.email)}`);
        const data = await response.json();
        const currentCandidate = data?.candidate;

        if (response.ok && currentCandidate?.id === storedCandidate.id) {
          const refreshedCandidate = { ...storedCandidate, ...currentCandidate };
          setCandidate(refreshedCandidate);
          localStorage.setItem("candidate", JSON.stringify(refreshedCandidate));
        } else {
          setCandidate(storedCandidate);
        }
      } catch (error) {
        console.error("Failed to refresh candidate details:", error);
        setCandidate(storedCandidate);
      } finally {
        setLoading(false);
      }
    };

    void loadCandidate();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!candidate) {
    return null;
  }

  const isMockEnabled = candidate.mock_enabled === true;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", path: "/dashboard/candidate" },
    { id: "round1", label: "Round 1 Learning", path: "/dashboard/candidate/round1" },
    { id: "round2", label: "Round 2 Learning", path: "/dashboard/candidate/round2" },
    { id: "practice-mock", label: "Practice Mock Assessment", path: "/dashboard/candidate/practice-mock" },
    { id: "mock", label: "Mock Assessment", path: "/dashboard/candidate/mock-assessment" },
  ];

  const handleMenuClick = (path: string, id: string) => {
    if (id === "mock" && !isMockEnabled) {
      return;
    }

    setActiveMenu(id);
    router.push(path);
  };

  return (
    <>
      <Header screenName="Candidate Dashboard" />
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-72 bg-white border-r border-gray-200 p-6 sticky top-16 h-screen overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Candidate Menu</h2>
          <nav className="space-y-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.path, item.id)}
                disabled={item.id === "mock" && !isMockEnabled}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition duration-200 ${
                  activeMenu === item.id
                    ? "bg-green-100 text-green-700 border-2 border-green-500"
                    : item.id === "mock" && !isMockEnabled
                      ? "cursor-not-allowed text-gray-400"
                      : "text-gray-700 hover:bg-gray-100"
                } disabled:cursor-not-allowed`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-5xl">
            <div className="mb-6 flex justify-end">
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100"
              >
                ← Back to Role Based Dashboard
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Candidate Dashboard
            </h1>
            <p className="text-gray-600 text-lg mb-12">
              Select a learning path to continue.
            </p>

            {/* Learning Paths Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Round 1 Learning */}
              <Link href="/dashboard/candidate/round1">
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8 hover:shadow-lg transition cursor-pointer">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Round 1 Learning
                  </h2>
                  <p className="text-gray-700 text-sm mb-6 space-y-1">
                    <span className="block">Concepts, Practice Questions</span>
                    <span className="block">Debugging Drills</span>
                  </p>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-200">
                    Open
                  </button>
                </div>
              </Link>

              {/* Round 2 Learning */}
              <Link href="/dashboard/candidate/round2">
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8 hover:shadow-lg transition cursor-pointer">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Round 2 Learning
                  </h2>
                  <p className="text-gray-700 text-sm mb-6 space-y-1">
                    <span className="block">Practice Questions</span>
                    <span className="block">Code Editor & Assessment</span>
                  </p>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-200">
                    Open
                  </button>
                </div>
              </Link>

              {/* Practice Mock Assessment */}
              <Link href="/dashboard/candidate/practice-mock">
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8 hover:shadow-lg transition cursor-pointer">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Practice Mock Assessment
                  </h2>
                  <p className="text-gray-700 text-sm mb-6 space-y-1">
                    <span className="block">Practice in Mock Environment</span>
                    <span className="block">Untimed Practice Questions</span>
                  </p>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-200">
                    Practice
                  </button>
                </div>
              </Link>

              {/* Mock Assessment */}
              <button
                type="button"
                onClick={() => handleMenuClick("/dashboard/candidate/mock-assessment", "mock")}
                disabled={!isMockEnabled}
                className="w-full text-left disabled:cursor-not-allowed"
              >
                <div className={`bg-green-50 border-2 border-green-500 rounded-xl p-8 transition ${
                  isMockEnabled ? "cursor-pointer hover:shadow-lg" : "cursor-not-allowed opacity-50"
                }`}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Mock Assessment
                  </h2>
                  <p className="text-gray-700 text-sm mb-6 space-y-1">
                    <span className="block">Actual Assessment Style</span>
                    <span className="block">Timed Questions</span>
                  </p>
                  <span className={`block w-full rounded-lg bg-green-600 py-3 text-center font-bold text-white transition ${
                    isMockEnabled ? "hover:bg-green-700" : "opacity-60"
                  }`}>
                    Start Assessment
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
