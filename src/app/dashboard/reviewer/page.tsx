"use client";

import Link from "next/link";
import Header from "@/components/Header";
import ReviewerSidebar from "@/components/ReviewerSidebar";

const featureCards = [
  {
    title: "Candidate Report",
    description: "Search candidates and view scores.",
    detail:
      "Review Round 1 and Round 2 attempt history. Open detailed performance reports and submitted solutions.",
    icon: "report",
    accent: "bg-violet-500",
    href: "/dashboard/reviewer/candidate-report",
  },
  {
    title: "Candidate Information",
    description: "Search and update candidate profiles.",
    detail:
      "Maintain email, phone, lead, timeline and status details. Manage candidate information.",
    icon: "info",
    accent: "bg-violet-500",
    href: "/dashboard/reviewer/candidate-information",
  },
  {
    title: "Question Manager",
    description: "Upload and Download Questions.",
    detail:
      "Upload and Download questions across all the screen.",
    icon: "questions",
    accent: "bg-violet-500",
    href: "/dashboard/reviewer/question-manager",
  },
];

function Icon({ type }: { type: "report" | "info" | "questions" }) {
  const common = "h-7 w-7 text-white";

  if (type === "report") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
        <path d="M8 3.5h8.5L18.5 5v14.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 8.5h8M8 12h8M8 15.5h5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "info") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 19c1.5-2.8 4.2-4.2 7-4.2s5.5 1.4 7 4.2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
      <path d="M5 6.5h14M5 12h14M5 17.5h9" strokeLinecap="round" />
      <circle cx="18" cy="17.5" r="2" />
    </svg>
  );
}

export default function ReviewerPage() {
  return (
    <>
      <Header screenName="Lead / Reviewer Workspace" />
      <div className="flex min-h-screen bg-[#f3f4f6] text-slate-800">
        <ReviewerSidebar />

        <main className="flex-1 px-10 py-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex justify-end">
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
              >
                Go to Main Dashboard
              </Link>
            </div>

            <h1 className="text-5xl font-semibold tracking-tight text-slate-800">
              Reviewer Workspace
            </h1>
            <p className="mt-5 text-lg text-slate-500">
              Manage candidate reports and candidate information.
            </p>

            <div className="mt-10 grid gap-8 md:grid-cols-2">
              {featureCards.map(({ title, description, detail, icon, accent, href }) => (
                <div key={title} className="rounded-2xl border border-slate-300 bg-[#f3f4f6] p-8 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-xl ${accent}`}>
                      <Icon type={icon as "report" | "info" | "questions"} />
                    </div>
                    <div className="text-3xl font-medium text-slate-700">{title}</div>
                  </div>

                  <div className="mt-6 space-y-3 text-base text-slate-600">
                    <p>{description}</p>
                    <p>{detail}</p>
                  </div>

                  <Link href={href} className="mt-8 block">
                    <button className="inline-flex w-full items-center justify-center rounded-xl bg-violet-500 px-4 py-3 text-lg font-semibold text-white shadow-sm transition hover:bg-violet-600">
                      Open
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
