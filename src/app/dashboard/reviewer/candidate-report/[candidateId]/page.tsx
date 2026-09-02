"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import TablePagination from "@/components/TablePagination";

const PAGE_SIZE = 10;

type AttemptEntry = {
  id: string;
  round: number;
  roundLabel: string;
  attemptNo: number;
  attemptedDate: string;
};

type CandidateDetail = {
  id: string;
  candidateName: string;
  startDate: string;
  karatPrepTimeline: string;
  leadName: string;
};

export default function CandidateAssessmentDetailPage() {
  const params = useParams<{ candidateId: string }>();
  const candidateId = params?.candidateId;
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [attempts, setAttempts] = useState<AttemptEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!candidateId) return;

    setCurrentPage(1);
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reviewer/report/${candidateId}`);
        const data = await response.json();
        setCandidate(data?.candidate || null);
        setAttempts(data?.attempts || []);
      } catch (error) {
        console.error(error);
        setCandidate(null);
        setAttempts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [candidateId]);

  const paginatedAttempts = attempts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      <Header screenName="Lead / Reviewer Workspace" />
      <div className="flex min-h-screen bg-[#f3f4f6] text-slate-800">
        <aside className="w-[280px] border-r border-slate-200 bg-white p-6">
          <Link
            href="/dashboard/reviewer"
            className="mb-4 block rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Reviewer Dashboard
          </Link>

          <Link
            href="/dashboard/reviewer/candidate-report"
            className="mb-4 block rounded-xl border border-violet-300 bg-violet-100 px-4 py-3 text-base font-medium text-violet-700 shadow-sm"
          >
            Candidate Report
          </Link>

          <Link
            href="/dashboard/reviewer/candidate-information"
            className="block rounded-xl px-4 py-3 text-base font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Candidate Information
          </Link>
        </aside>

        <main className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-6xl rounded-[20px] border border-slate-300 bg-[#f3f4f6] p-8 shadow-sm">
            <div className="mb-8 flex justify-end">
              <Link
                href="/dashboard/reviewer/candidate-report"
                className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
              >
                ← Back to Candidate Report
              </Link>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-500">Loading candidate details...</div>
            ) : !candidate ? (
              <div className="py-16 text-center text-slate-500">Candidate not found.</div>
            ) : (
              <>
                <div className="mb-8 grid gap-4 rounded-2xl border border-slate-300 bg-[#f3f4f6] p-4 md:grid-cols-4">
                  <div>
                    <div className="text-sm text-slate-500">Candidate Name</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-800">{candidate.candidateName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Start Date</div>
                    <div className="mt-2 text-xl font-medium text-slate-700">{candidate.startDate}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Karat Prep Timeline</div>
                    <div className="mt-2 text-xl font-medium text-slate-700">{candidate.karatPrepTimeline}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Lead Name</div>
                    <div className="mt-2 text-xl font-medium text-slate-700">{candidate.leadName}</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-300 bg-[#f3f4f6] p-4">
                  <h2 className="mb-5 text-[2rem] font-semibold text-slate-800">Attempt History</h2>

                  <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
                    <table className="min-w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="bg-[#f0f1f4] text-slate-700">
                          <th className="border border-slate-300 px-4 py-3 font-semibold">Round / Practice Mock</th>
                          <th className="border border-slate-300 px-4 py-3 font-semibold">Attempt No</th>
                          <th className="border border-slate-300 px-4 py-3 font-semibold">Attempted Date</th>
                          <th className="border border-slate-300 px-4 py-3 font-semibold">View Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                              No assessment history found for this candidate.
                            </td>
                          </tr>
                        ) : (
                          paginatedAttempts.map((attempt) => (
                            <tr key={attempt.id} className="align-middle">
                              <td className="border border-slate-300 px-4 py-4 font-medium text-slate-700">
                                {attempt.roundLabel}
                              </td>
                              <td className="border border-slate-300 px-4 py-4 text-slate-700">
                                Attempt {attempt.attemptNo}
                              </td>
                              <td className="border border-slate-300 px-4 py-4 text-slate-700">
                                {attempt.attemptedDate}
                              </td>
                              <td className="border border-slate-300 px-4 py-4">
                                <Link href={`/dashboard/reviewer/candidate-report/${candidateId}/${attempt.id}`}>
                                  <button className="rounded-xl bg-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-600">
                                    View Progress
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
                    totalItems={attempts.length}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
