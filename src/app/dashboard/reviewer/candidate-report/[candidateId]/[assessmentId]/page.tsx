"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import TablePagination from "@/components/TablePagination";

const PAGE_SIZE = 10;

type QuestionRow = {
  id: string;
  questionNo: number;
  topic: string;
  subtopic: string;
  description: string;
  code: string;
  userCode: string;
  userAnalysis: string;
};

type AssessmentView = {
  round: number;
  roundLabel: string;
  attemptNo: number;
  attemptedDate: string;
};

export default function CandidateAttemptProgressPage() {
  const params = useParams<{ candidateId: string; assessmentId: string }>();
  const candidateId = params?.candidateId;
  const assessmentId = params?.assessmentId;
  const [candidateName, setCandidateName] = useState("");
  const [assessment, setAssessment] = useState<AssessmentView | null>(null);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const selectedQuestionUsesConsoleOutput =
    selectedQuestion &&
    (assessment?.round === 2 ||
      ((assessment?.round === 3 || assessment?.round === 4) && selectedQuestion.questionNo === 5));

  useEffect(() => {
    if (!candidateId || !assessmentId) return;

    setCurrentPage(1);
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/reviewer/assessment-detail?candidateId=${encodeURIComponent(candidateId)}&assessmentId=${encodeURIComponent(assessmentId)}`,
        );
        const data = await response.json();
        setCandidateName(data?.candidate?.name || "");
        setAssessment(data?.assessment || null);
        setQuestions(data?.questions || []);
      } catch (error) {
        console.error(error);
        setCandidateName("");
        setAssessment(null);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [candidateId, assessmentId]);

  const paginatedQuestions = questions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
                href={`/dashboard/reviewer/candidate-report/${candidateId}`}
                className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
              >
                ← Back to Attempt History
              </Link>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-500">Loading assessment progress...</div>
            ) : !assessment ? (
              <div className="py-16 text-center text-slate-500">Assessment details not found.</div>
            ) : (
              <>
                <div className="mb-8 grid gap-4 rounded-2xl border border-slate-300 bg-[#f3f4f6] p-4 md:grid-cols-4">
                  <div>
                    <div className="text-sm text-slate-500">Candidate Name</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-800">{candidateName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Round</div>
                    <div className="mt-2 text-xl font-medium text-slate-700">{assessment.roundLabel}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Attempt No</div>
                    <div className="mt-2 text-xl font-medium text-slate-700">Attempt {assessment.attemptNo}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Attempted Date</div>
                    <div className="mt-2 text-xl font-medium text-slate-700">{assessment.attemptedDate}</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-300 bg-[#f3f4f6] p-4">
                  <h2 className="mb-5 text-[2rem] font-semibold text-slate-800">Questions in This Attempt</h2>

                  <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
                    <table className="min-w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="bg-[#f0f1f4] text-slate-700">
                          <th className="border border-slate-300 px-4 py-3 font-semibold">Question No</th>
                          <th className="border border-slate-300 px-4 py-3 font-semibold">Topic</th>
                          <th className="border border-slate-300 px-4 py-3 font-semibold">Subtopic</th>
                          <th className="border border-slate-300 px-4 py-3 font-semibold">View Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {questions.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                              No questions recorded for this attempt.
                            </td>
                          </tr>
                        ) : (
                          paginatedQuestions.map((question) => (
                            <tr key={question.id || `${question.questionNo}-${question.topic}`} className="align-middle">
                              <td className="border border-slate-300 px-4 py-4 font-medium text-slate-700">{question.questionNo}</td>
                              <td className="border border-slate-300 px-4 py-4 text-slate-700">{question.topic || "-"}</td>
                              <td className="border border-slate-300 px-4 py-4 text-slate-700">{question.subtopic || "-"}</td>
                              <td className="border border-slate-300 px-4 py-4">
                                <button
                                  onClick={() => setSelectedQuestion(question)}
                                  className="rounded-xl bg-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-600"
                                >
                                  View Progress
                                </button>
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
                    totalItems={questions.length}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-3 sm:p-4">
          <div className="w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-xl border border-slate-200 bg-[#f5f5f7] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-[#f5f5f7] px-4 py-3 sm:px-6">
              <div className="text-xl font-semibold uppercase tracking-wide text-slate-700 sm:text-2xl">
                Question {selectedQuestion.questionNo}
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="max-h-[calc(92vh-72px)] overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
              <div className="mb-6 rounded-xl border border-slate-200 bg-white px-4 py-5 text-2xl font-bold text-slate-800 sm:text-3xl">
                {selectedQuestion.description || "Question"}
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-[#eef0f4] p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Topic</div>
                  <div className="text-xl font-medium text-slate-700">{selectedQuestion.topic || "-"}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-[#eef0f4] p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Subtopic</div>
                  <div className="text-xl font-medium text-slate-700">{selectedQuestion.subtopic || "-"}</div>
                </div>
              </div>

              <div className="mb-6 grid gap-5 xl:grid-cols-2">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 bg-[#f5f5f7] px-4 py-3 text-base font-semibold text-slate-700">Question Code</div>
                  <pre className="max-h-72 overflow-auto bg-[#0f172a] p-4 text-sm leading-7 text-slate-100">
                    {selectedQuestion.code || "No question code available."}
                  </pre>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 bg-[#f5f5f7] px-4 py-3 text-base font-semibold text-slate-700">User Code</div>
                  <pre className="max-h-72 overflow-auto bg-[#0f172a] p-4 text-sm leading-7 text-slate-100">
                    {selectedQuestion.userCode || "No user code submitted."}
                  </pre>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-[#f5f5f7] px-4 py-3 text-base font-semibold text-slate-700">
                  {selectedQuestionUsesConsoleOutput ? "Console Output" : "User Analysis"}
                </div>
                <div className="max-h-64 overflow-y-auto whitespace-pre-wrap bg-white p-4 text-base leading-7 text-slate-700">
                  {selectedQuestion.userAnalysis ||
                    (selectedQuestionUsesConsoleOutput ? "No console output available." : "No user analysis provided.")}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
