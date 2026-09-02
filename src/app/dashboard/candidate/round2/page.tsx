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

export default function Round2Page() {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
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

  const sections = [
    {
      id: "format-practice",
      title: "Format and Practice Questions",
      description: "Review Round 2 format guidance, question structure, and answer examples.",
      status: "",
      statusColor: "",
      icon: "📄",
      buttonText: "Open",
      buttonColor: "bg-green-600 hover:bg-green-700",
    },
    {
      id: "exercise-questions",
      title: "Exercise Questions",
      description: "Practice implementation-based exercises and verify your answers.",
      status: "",
      statusColor: "",
      icon: "💻",
      buttonText: "Start",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
  ];

  return (
    <>
      <Header screenName="Round 2 Learning" />
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
            <Link href="/dashboard/candidate/round1" className="block">
              <button className="w-full text-left px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition duration-200">
              Round 1 Learning
              </button>
            </Link>
            <button className="w-full text-left px-4 py-3 rounded-lg font-medium bg-green-100 text-green-700 border-2 border-green-500">
              Round 2 Learning
            </button>
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
              Round 2 Learning
            </h1>
            <p className="text-gray-600 text-lg mb-12">
              Advanced topics and coding challenges for Round 2.
            </p>

            {/* Learning Sections Grid */}
            <div className="grid grid-cols-2 gap-6">
              {sections.map((section) => (
                <Link
                  key={section.id}
                  href={
                    section.id === "format-practice"
                      ? "/dashboard/candidate/round2/format-practice-questions"
                      : section.id === "exercise-questions"
                        ? "/dashboard/candidate/round2/exercise-questions"
                        : "#"
                  }
                >
                  <div
                    className={`border-2 rounded-xl p-8 hover:shadow-lg transition cursor-pointer h-full ${
                      section.id === "format-practice"
                        ? "border-green-500 bg-green-50"
                        : "border-blue-400 bg-blue-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{section.icon}</div>
                      {section.status && (
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                            section.status === "Completed"
                              ? "border-green-500 text-green-700 bg-white"
                              : "border-orange-500 text-orange-700 bg-white"
                          }`}
                        >
                          {section.status}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {section.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6">
                      {section.description}
                    </p>
                    <button
                      className={`w-full ${section.buttonColor} text-white font-semibold py-2 rounded-lg transition duration-200`}
                    >
                      {section.buttonText}
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
