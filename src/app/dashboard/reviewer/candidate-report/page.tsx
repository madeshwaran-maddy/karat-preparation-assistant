"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import TablePagination from "@/components/TablePagination";
import ReviewerSidebar from "@/components/ReviewerSidebar";

const PAGE_SIZE = 10;

type CandidateReportRow = {
  id: string;
  candidateName: string;
  language: string;
  startDate: string;
  karatPrepTimeline: string;
  leadName: string;
  totalR1Attempt: number;
  totalR2Attempt: number;
  totalPracticeMock: number;
  totalMock: number;
  learningProgress: string;
  assessmentReport: string;
};

export default function CandidateReportPage() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<CandidateReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
    const load = async () => {
      setLoading(true);
      try {
        const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
        const response = await fetch(`/api/reviewer/report${query}`);
        const data = await response.json();
        setRows(data?.candidates || []);
      } catch (error) {
        console.error(error);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [search]);

  const paginatedRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      <Header screenName="Lead / Reviewer Workspace" />
      <div className="flex min-h-screen bg-[#f3f4f6] text-slate-800">
          <ReviewerSidebar />

        <main className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-6xl rounded-[20px] border border-slate-300 bg-[#f3f4f6] p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-4">
              <label className="w-40 text-lg font-semibold text-slate-700">Search</label>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search candidate"
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div className="rounded-2xl border border-slate-300 bg-[#f3f4f6] p-4">
              <h2 className="mb-5 text-center text-[2rem] font-semibold text-slate-800">Candidate Search Results</h2>

              <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-[#f0f1f4] text-slate-700">
                      <th className="border border-slate-300 px-3 py-3 font-semibold">Candidate Name</th>
                      <th className="border border-slate-300 px-3 py-3 font-semibold">Language Selected</th>
                      <th className="border border-slate-300 px-3 py-3 font-semibold">Start Date</th>
                      <th className="border border-slate-300 px-3 py-3 font-semibold">Karat Prep Timeline</th>
                      <th className="border border-slate-300 px-3 py-3 font-semibold">Lead Name</th>
                      <th className="border border-slate-300 px-3 py-3 font-semibold">Total R1 Attempt</th>
                      <th className="border border-slate-300 px-3 py-3 font-semibold">Total R2 Attempt</th>
                      <th className="border border-slate-300 px-3 py-3 font-semibold">Total Practice Mock</th>
                      <th className="border border-slate-300 px-3 py-3 font-semibold">Total Mock</th>
                      <th className="border border-slate-300 px-3 py-3 font-semibold">Learning Progress</th>
                      <th className="border border-slate-300 px-3 py-3 font-semibold">Assessment Report</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={11} className="px-4 py-8 text-center text-slate-500">
                          Loading...
                        </td>
                      </tr>
                    ) : rows.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-4 py-8 text-center text-slate-500">
                          No candidates found.
                        </td>
                      </tr>
                    ) : (
                      paginatedRows.map((row) => (
                        <tr key={row.id} className="align-middle">
                          <td className="border border-slate-300 px-3 py-3 font-medium text-slate-700">{row.candidateName}</td>
                          <td className="border border-slate-300 px-3 py-3 text-slate-700">{row.language}</td>
                          <td className="border border-slate-300 px-3 py-3 text-slate-700">{row.startDate}</td>
                          <td className="border border-slate-300 px-3 py-3 text-slate-700">{row.karatPrepTimeline}</td>
                          <td className="border border-slate-300 px-3 py-3 text-slate-700">{row.leadName}</td>
                          <td className="border border-slate-300 px-3 py-3 text-slate-700">{row.totalR1Attempt}</td>
                          <td className="border border-slate-300 px-3 py-3 text-slate-700">{row.totalR2Attempt}</td>
                          <td className="border border-slate-300 px-3 py-3 text-slate-700">{row.totalPracticeMock}</td>
                          <td className="border border-slate-300 px-3 py-3 text-slate-700">{row.totalMock}</td>
                          <td className="border border-slate-300 px-3 py-3 text-slate-700">
                            <Link href={`/dashboard/reviewer/candidate-report/${row.id}/progress`}>
                              <button className="rounded-lg bg-violet-500 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-violet-600">
                                View
                              </button>
                            </Link>
                          </td>
                          <td className="border border-slate-300 px-3 py-3 text-slate-700">
                            <Link href={`/dashboard/reviewer/candidate-report/${row.id}`}>
                              <button className="rounded-lg bg-violet-500 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-violet-600">
                                View
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <TablePagination
                currentPage={currentPage}
                pageSize={PAGE_SIZE}
                totalItems={rows.length}
                onPageChange={setCurrentPage}
              />

              <div className="mt-6 rounded-xl border border-slate-300 bg-[#f0f1f4] px-4 py-3 text-center text-sm text-slate-600">
                Click “View” in any row to open the learning progress or assessment report screen.
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
