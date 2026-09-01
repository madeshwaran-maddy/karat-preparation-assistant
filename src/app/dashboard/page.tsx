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
}

export default function DashboardPage() {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get candidate info from localStorage
    const candidateData = localStorage.getItem("candidate");
    if (candidateData) {
      setCandidate(JSON.parse(candidateData));
    } else {
      // Redirect to login if not authenticated
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

  return (
    <>
      <Header screenName="Role Based Landing Page" />
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            Karat Preparation Assistant
          </h1>
          <h2 className="text-2xl text-gray-700 mb-4">Role Based Landing Page</h2>
          <p className="text-gray-600 text-lg">
            Choose your workspace to continue
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Candidate Card */}
          <Link href="/dashboard/candidate">
            <div className="group border-2 border-green-500 rounded-2xl p-8 hover:shadow-lg transition duration-300 cursor-pointer bg-white">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition duration-300">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  For Candidate
                </h3>
                <p className="text-gray-600 mb-6">
                  Access learning modules, practice questions, debugging drills and mock assessments.
                </p>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-200">
                  Continue
                </button>
              </div>
            </div>
          </Link>

          {/* Leads/Reviewer Card */}
          <Link href="/dashboard/reviewer">
            <div className="group border-2 border-blue-500 rounded-2xl p-8 hover:shadow-lg transition duration-300 cursor-pointer bg-white">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition duration-300">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  For Leads / Reviewer
                </h3>
                <p className="text-gray-600 mb-6">
                  Search candidates, assessment scores, and reports.
                </p>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200">
                  Continue
                </button>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-600 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-blue-800 text-sm">
            After selection, user will be redirected to the selected workspace.
          </p>
        </div>
      </div>
      </div>
    </>
  );
}
