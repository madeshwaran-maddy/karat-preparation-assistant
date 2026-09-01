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

export default function ReviewerPage() {
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

  return (
    <>
      <Header screenName="Lead / Reviewer Workspace" />
      <div className="min-h-screen bg-gray-50">
        {/* Back to Dashboard Link */}
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to Dashboard
          </Link>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Search Candidates */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500 hover:shadow-lg transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Search Candidates</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Find and view candidate profiles and information.
            </p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
              Search Now
            </button>
          </div>

          {/* Assessment Scores */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500 hover:shadow-lg transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-2.08-2.61-1.41 1.41L10.5 19l4.96-6.29-1.41-1.42z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Assessment Scores</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              View detailed assessment scores and performance metrics.
            </p>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition">
              View Scores
            </button>
          </div>

          {/* Generate Reports */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500 hover:shadow-lg transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-8-6z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Generate Reports</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Create comprehensive reports on candidate performance.
            </p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition">
              Create Report
            </button>
          </div>

          {/* Candidate Status */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500 hover:shadow-lg transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Candidate Status</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Monitor candidate progress and status updates.
            </p>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition">
              View Status
            </button>
          </div>

          {/* Feedback Management */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500 hover:shadow-lg transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Feedback Management</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Provide and manage feedback for candidates.
            </p>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition">
              Manage Feedback
            </button>
          </div>

          {/* Analytics Dashboard */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500 hover:shadow-lg transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2V17zm4 0h-2V7h2V17zm4 0h-2v-4h2V17z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              View comprehensive analytics and insights.
            </p>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition">
              View Analytics
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Total Candidates</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <div className="text-xs text-gray-500 mt-2">Active candidates</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Avg Score</div>
            <div className="text-3xl font-bold text-gray-900">0%</div>
            <div className="text-xs text-gray-500 mt-2">Overall performance</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Assessments</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <div className="text-xs text-gray-500 mt-2">Completed assessments</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Reports</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <div className="text-xs text-gray-500 mt-2">Generated reports</div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
