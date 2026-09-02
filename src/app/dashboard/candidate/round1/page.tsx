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

export default function Round1Page() {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const candidateData = localStorage.getItem("candidate");
    if (candidateData) {
      setCandidate(JSON.parse(candidateData));
    } else {
      router.push("/login");
    }
    setLoading(false);
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

  const sections = [
    {
      id: "concepts",
      title: "Concepts",
      description: "Java fundamentals and topic explanations completed successfully.",
      icon: "📚",
      buttonText: "Review",
      buttonColor: "bg-green-600 hover:bg-green-700",
    },
    {
      id: "practice",
      title: "Practice Questions",
      description: "Questions with answers are currently being reviewed.",
      icon: "❓",
      buttonText: "Continue",
      buttonColor: "bg-orange-600 hover:bg-orange-700",
    },
    {
      id: "debugging",
      title: "Debugging Drills",
      description: "Practice concept-based buggy code scenarios whenever needed.",
      icon: "💻",
      buttonText: "Start",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
  ];

  return (
    <>
      <Header screenName="Round 1 Learning" />
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-72 bg-white border-r border-gray-200 p-6 sticky top-16 h-screen overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Candidate Menu</h2>
          <nav className="space-y-3">
            <Link href="/dashboard/candidate">
              <button className="w-full text-left px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition duration-200">
                Dashboard
              </button>
            </Link>
            <button className="w-full text-left px-4 py-3 rounded-lg font-medium bg-green-100 text-green-700 border-2 border-green-500">
              Round 1 Learning
            </button>
            <Link href="/dashboard/candidate/round2" className="block">
              <button className="w-full text-left px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition duration-200">
              Round 2 Learning
              </button>
            </Link>
            <Link href="/dashboard/candidate/practice-mock" className="block">
              <button className="w-full text-left px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition duration-200">
              Practice Mock Assessment
              </button>
            </Link>
            <button
              type="button"
              onClick={() => isMockEnabled && router.push("/dashboard/candidate/mock-assessment")}
              disabled={!isMockEnabled}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition duration-200 disabled:cursor-not-allowed ${
                isMockEnabled ? "text-gray-700 hover:bg-gray-100" : "cursor-not-allowed text-gray-400"
              }`}
            >
              Mock Assessment
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-5xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Round 1 Learning
            </h1>
            <p className="text-gray-600 text-lg mb-12">
              Review learning sections and access debugging practice anytime.
            </p>

            {/* Learning Sections Grid */}
            <div className="grid grid-cols-2 gap-6">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`${section.id === "debugging" ? "col-span-2 " : ""}border-2 rounded-xl p-8 hover:shadow-lg transition ${
                    section.id === "concepts"
                      ? "border-green-500 bg-green-50"
                      : section.id === "practice"
                      ? "border-orange-400 bg-orange-50"
                      : "border-blue-400 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{section.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    {section.description}
                  </p>
                  {section.id === "concepts" || section.id === "practice" ? (
                    <Link
                      href={section.id === "concepts" ? "/dashboard/candidate/round1/concepts" : "/dashboard/candidate/round1/practice-questions"}
                      className={`block w-full ${section.buttonColor} text-center text-white font-semibold py-2 rounded-lg transition duration-200`}
                    >
                      {section.buttonText}
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard/candidate/round1/debugging-drill"
                      className={`block w-full ${section.buttonColor} text-center text-white font-semibold py-2 rounded-lg transition duration-200`}
                    >
                      {section.buttonText}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
