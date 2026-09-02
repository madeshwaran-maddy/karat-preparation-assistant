"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { id: "dashboard", label: "Reviewer Dashboard", href: "/dashboard/reviewer" },
  { id: "report", label: "Candidate Report", href: "/dashboard/reviewer/candidate-report" },
  { id: "info", label: "Candidate Information", href: "/dashboard/reviewer/candidate-information" },
  { id: "questions", label: "Question Manager", href: "/dashboard/reviewer/question-manager" },
];

function isActiveItem(id: string, pathname: string) {
  if (id === "dashboard") return pathname === "/dashboard/reviewer";
  if (id === "report") return pathname.startsWith("/dashboard/reviewer/candidate-report");
  if (id === "info") return pathname.startsWith("/dashboard/reviewer/candidate-information");
  return pathname.startsWith("/dashboard/reviewer/question-manager");
}

function MenuIcon({ id }: { id: string }) {
  if (id === "dashboard") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M4 4h7v7H4zm9 0h7v4h-7zm0 6h7v10h-7zm-9 3h7v7H4z" />
      </svg>
    );
  }

  if (id === "report") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
        <path d="M8 4.5h8l3 3v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 4.5v3h3M8 10.5h8M8 14.5h8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (id === "questions") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
        <path d="M5 6.5h14M5 12h14M5 17.5h9" strokeLinecap="round" />
        <circle cx="18" cy="17.5" r="2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19c1.5-2.8 4.2-4.2 7-4.2s5.5 1.4 7 4.2" strokeLinecap="round" />
    </svg>
  );
}

export default function ReviewerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[280px] shrink-0 border-r border-slate-200 bg-white p-6">
      <h2 className="mb-5 text-[1.05rem] font-semibold text-slate-800">Reviewer Menu</h2>
      <nav className="space-y-2" aria-label="Reviewer navigation">
        {menuItems.map((item) => {
          const active = isActiveItem(item.id, pathname);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex w-full items-center rounded-xl px-4 py-3 text-left text-base font-medium transition ${
                active
                  ? "border border-violet-300 bg-violet-100 text-violet-700 shadow-sm"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className={`mr-3 inline-flex h-5 w-5 items-center justify-center ${active ? "text-violet-700" : "text-slate-500"}`}>
                <MenuIcon id={item.id} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
