"use client";

import Link from "next/link";
import Header from "@/components/Header";

const menuItems = [
  { id: "dashboard", label: "Reviewer Dashboard", active: true },
  { id: "report", label: "Candidate Report" },
  { id: "info", label: "Candidate Information" },
];

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
];

function Icon({ type }: { type: "report" | "info" }) {
  const common = "h-7 w-7 text-white";

  if (type === "report") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
        <path d="M8 3.5h8.5L18.5 5v14.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 8.5h8M8 12h8M8 15.5h5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19c1.5-2.8 4.2-4.2 7-4.2s5.5 1.4 7 4.2" strokeLinecap="round" />
    </svg>
  );
}

export default function ReviewerPage() {
  return (
    <>
      <Header screenName="Lead / Reviewer Workspace" />
      <div className="flex min-h-screen bg-[#f3f4f6] text-slate-800">
        <aside className="w-[280px] border-r border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-[1.05rem] font-semibold text-slate-800">Reviewer Menu</h2>
          <div className="space-y-2">
            {menuItems.map((item) => {
              const isInfoItem = item.id === "info";
              const isReportItem = item.id === "report";
              const destination = isInfoItem
                ? "/dashboard/reviewer/candidate-information"
                : isReportItem
                  ? "/dashboard/reviewer/candidate-report"
                  : "/dashboard/reviewer";

              return (
                <Link key={item.id} href={destination}>
                  <button
                    className={`flex w-full items-center rounded-xl px-4 py-3 text-left text-base font-medium transition ${
                      item.active
                        ? "border border-violet-300 bg-violet-100 text-violet-700 shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className={`mr-3 inline-flex h-5 w-5 items-center justify-center ${item.active ? "text-violet-700" : "text-slate-500"}`}>
                      {item.id === "dashboard" ? (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <path d="M4 4h7v7H4zm9 0h7v4h-7zm0 6h7v10h-7zm-9 3h7v7H4z" />
                        </svg>
                      ) : item.id === "report" ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                          <path d="M8 4.5h8l3 3v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2Z" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M16 4.5v3h3M8 10.5h8M8 14.5h8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                          <circle cx="12" cy="8" r="3.5" />
                          <path d="M5 19c1.5-2.8 4.2-4.2 7-4.2s5.5 1.4 7 4.2" strokeLinecap="round" />
                        </svg>
                      )}
                    </span>
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </div>
        </aside>

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
                      <Icon type={icon as "report" | "info"} />
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
