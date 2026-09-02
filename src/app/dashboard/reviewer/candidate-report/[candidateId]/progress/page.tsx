"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import conceptsData from "@/app/dashboard/candidate/round1/concepts/data/concepts.json";
import practiceData from "@/app/dashboard/candidate/round1/practice-questions/data/practice-questions.json";

const LEARNING_PROGRESS_STORAGE_KEY = "karat_learning_progress";

type Status = "completed" | "in_progress" | "not_started";

type CandidateDetail = {
  candidateName?: string;
  startDate?: string;
  karatPrepTimeline?: string;
  leadName?: string;
};

type ProgressItem = {
  id: string;
  label: string;
  status: Status;
  total?: number;
  completed?: number;
  inProgress?: number;
  notStarted?: number;
};

type ProgressGroup = {
  id: string;
  label: string;
  status: Status;
  items: ProgressItem[];
};

type ProgressSection = {
  id: string;
  title: string;
  eyebrow: string;
  color: string;
  groups: ProgressGroup[];
};

type PracticeTopic = {
  id: string;
  title: string;
  questions: Array<{ questionNo: number; title: string }>;
};

type Round2Question = {
  id: string;
  number: number;
  title: string;
};

function normalizeStatus(value: unknown): Status {
  const status = String(value ?? "").toLowerCase().replace(/ /g, "_");
  if (status === "completed") return "completed";
  if (status === "in_progress") return "in_progress";
  return "not_started";
}

function readStoredProgress(candidateId: string) {
  try {
    const allProgress = JSON.parse(localStorage.getItem(LEARNING_PROGRESS_STORAGE_KEY) ?? "{}");
    return allProgress[candidateId] ?? {};
  } catch {
    return {};
  }
}

function buildItems(definitions: Array<{ id: string; label: string }>, progress: Record<string, string>): ProgressItem[] {
  return definitions.map((definition) => ({ ...definition, status: normalizeStatus(progress[definition.id]) }));
}

function getGroupStatus(items: ProgressItem[]): Status {
  if (items.length > 0 && items.every((item) => item.status === "completed")) return "completed";
  if (items.some((item) => item.status === "completed" || item.status === "in_progress")) return "in_progress";
  return "not_started";
}

function getSectionItems(section: ProgressSection) {
  return section.groups.flatMap((group) => group.items);
}

function getSectionCounts(section: ProgressSection) {
  return getSectionItems(section).reduce((counts, item) => {
    const itemCounts = getItemCounts(item);
    counts.total += itemCounts.total;
    counts.completed += itemCounts.completed;
    return counts;
  }, { total: 0, completed: 0 });
}

function getItemCounts(item: ProgressItem) {
  if (item.total !== undefined) {
    return {
      total: item.total,
      completed: item.completed ?? 0,
      inProgress: item.inProgress ?? 0,
      notStarted: item.notStarted ?? 0,
    };
  }

  return {
    total: 1,
    completed: item.status === "completed" ? 1 : 0,
    inProgress: item.status === "in_progress" ? 1 : 0,
    notStarted: item.status === "not_started" ? 1 : 0,
  };
}

function getStatusText(status: Status) {
  return status === "completed" ? "Completed" : status === "in_progress" ? "In Progress" : "Not Started";
}

function QuestionStatusDots({ item }: { item: ProgressItem }) {
  const counts = getItemCounts(item);
  const dots = Array.from({ length: counts.total }, (_, index) => {
    if (index < counts.completed) return "completed";
    if (index < counts.completed + counts.inProgress) return "in_progress";
    return "not_started";
  });

  return (
    <span className="flex max-w-[420px] flex-wrap justify-end gap-1" title={`${counts.completed} completed, ${counts.inProgress} in progress, ${counts.notStarted} not started`}>
      {dots.map((status, index) => (
        <span
          key={`${item.id}-dot-${index}`}
          className={`h-2.5 w-2.5 rounded-full border ${status === "completed" ? "border-green-500 bg-green-500" : status === "in_progress" ? "border-orange-500 bg-orange-400" : "border-slate-300 bg-white"}`}
        />
      ))}
    </span>
  );
}

function Donut({ completed, total, color }: { completed: number; total: number; color: string }) {
  const percentage = total ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="relative grid h-[92px] w-[92px] shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${color} ${percentage}%, #e8ebf0 ${percentage}% 100%)` }} aria-label={`${percentage}% completed`}>
      <div className="grid h-[68px] w-[68px] place-items-center rounded-full bg-white text-center">
        <div><div className="text-[19px] font-bold leading-none text-slate-700">{percentage}%</div><div className="mt-1 text-[9px] text-slate-400">Completed</div></div>
      </div>
    </div>
  );
}

function SummaryCard({ section, onSelect, selected }: { section: ProgressSection; onSelect: () => void; selected: boolean }) {
  const { total, completed } = getSectionCounts(section);
  return (
    <button type="button" onClick={onSelect} className={`overflow-hidden rounded-xl border bg-white text-left shadow-[0_2px_8px_rgba(30,42,60,0.06)] transition hover:-translate-y-0.5 hover:shadow-md ${selected ? "border-slate-400" : "border-slate-200"}`} style={{ borderLeft: `3px solid ${section.color}` }}>
      <div className="flex min-h-[164px] items-center gap-4 px-5 py-5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl" style={{ backgroundColor: `${section.color}18`, color: section.color }}>{section.id === "concepts" ? "▣" : section.id === "round1-practice" ? "?" : "▤"}</div>
        <div className="min-w-0 flex-1"><div className="text-[15px] font-bold text-slate-700">{section.title}</div><div className="mt-3 text-[10px] font-bold tracking-[0.12em] text-slate-400">{section.eyebrow}</div></div>
        <Donut completed={completed} total={total} color={section.color} />
        <div className="text-sm font-bold whitespace-nowrap text-slate-600">{completed} / {total}</div>
      </div>
      <div className="border-t border-slate-100 py-3 text-center text-xs font-bold text-slate-500">View Details <span className="ml-1 text-sm">→</span></div>
    </button>
  );
}

function DetailPanel({ section }: { section: ProgressSection }) {
  const { total, completed } = getSectionCounts(section);
  const percentage = total ? Math.round((completed / total) * 100) : 0;
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(30,42,60,0.05)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><div className="text-[10px] font-bold tracking-[0.14em] text-slate-400">{section.eyebrow}</div><h2 className="mt-1 text-[16px] font-bold text-slate-700">Details: {section.title} Progress</h2></div><div className="text-sm font-bold text-slate-500">{completed} / {total} <span className="ml-2">⌃</span></div></div>
      <div className="flex items-center justify-between bg-[#fbfcfd] px-5 py-3 text-sm font-bold text-slate-600"><span><span className="mr-2 text-green-500">●</span>Overall Progress</span><span className="text-xs font-normal text-slate-400">{percentage}% complete</span></div>
      <div className="max-h-[440px] overflow-y-auto px-5 py-3">{section.groups.map((group) => <div key={group.id} className="border-b border-slate-100 py-3 last:border-0"><div className="flex items-center gap-2 py-1 text-[14px] font-bold text-slate-700"><span className={group.status === "completed" ? "text-green-500" : group.status === "in_progress" ? "text-orange-500" : "text-slate-300"}>{group.status === "completed" ? "●" : group.status === "in_progress" ? "◐" : "○"}</span><span>{group.label}</span><span className={`ml-auto text-[11px] font-semibold ${group.status === "completed" ? "text-green-600" : group.status === "in_progress" ? "text-orange-600" : "text-slate-400"}`}>{getStatusText(group.status)}</span></div><div className="ml-6">{group.items.map((item) => <div key={item.id} className="flex items-center gap-3 py-1.5 text-[13px] text-slate-500"><span className={item.status === "completed" ? "text-green-500" : item.status === "in_progress" ? "text-orange-500" : "text-slate-300"}>{item.status === "completed" ? "●" : item.status === "in_progress" ? "◐" : "○"}</span><span className={`min-w-0 flex-1 ${item.status === "completed" ? "font-semibold text-green-600" : ""}`}>{item.label}</span><QuestionStatusDots item={item} />{item.status === "completed" && <span className="text-[11px] font-semibold text-green-600">Completed</span>}</div>)}</div></div>)}</div>
    </section>
  );
}

export default function CandidateProgressDashboardPage() {
  const params = useParams<{ candidateId: string }>();
  const candidateId = params?.candidateId;
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [sections, setSections] = useState<ProgressSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState("concepts");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!candidateId) return;
    const loadDashboard = async () => {
      try {
        const [candidateResponse, progressResponse, questionsResponse] = await Promise.all([fetch(`/api/reviewer/report/${candidateId}`), fetch(`/api/progress?candidateId=${encodeURIComponent(candidateId)}`), fetch("/api/questions")]);
        const candidateData = await candidateResponse.json();
        const progressData = await progressResponse.json();
        const round2Questions = (await questionsResponse.json()) as Round2Question[];
        const progress = readStoredProgress(candidateId);
        for (const item of progressData.items ?? []) if (item.item_id) progress[item.item_id] = normalizeStatus(item.status);

        const conceptGroups = Object.entries(conceptsData).map(([topicId, topicConcepts]) => {
          const subtopics = topicConcepts.map((concept) => ({
            id: concept.id,
            label: concept.title,
            status: normalizeStatus(progress[concept.id]),
          }));
          const label = topicId === "oops"
            ? "Object Oriented Programming (OOPS)"
            : topicId.charAt(0).toUpperCase() + topicId.slice(1);
          return { id: topicId, label, status: getGroupStatus(subtopics), items: subtopics };
        });

        const practiceGroups = Object.entries(practiceData).map(([categoryId, categoryTopics]) => {
          const topicItems = (categoryTopics as PracticeTopic[]).map((topic) => {
            const questionItems = buildItems(
              topic.questions.map((question) => ({ id: `${topic.id}-${question.questionNo}`, label: question.title })),
              progress,
            );
            const counts = questionItems.reduce((result, item) => {
              result.total += 1;
              if (item.status === "completed") result.completed += 1;
              if (item.status === "in_progress") result.inProgress += 1;
              if (item.status === "not_started") result.notStarted += 1;
              return result;
            }, { total: 0, completed: 0, inProgress: 0, notStarted: 0 });

            return {
              id: topic.id,
              label: topic.title,
              status: getGroupStatus(questionItems),
              ...counts,
            };
          });
          const label = categoryId === "oops"
            ? "Object Oriented Programming (OOPS)"
            : categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
          return { id: categoryId, label, status: getGroupStatus(topicItems), items: topicItems };
        });

        const round2PracticeItems = round2Questions.map((question) => ({
          id: question.id,
          label: `Question ${question.number}: ${question.title}`,
          status: normalizeStatus(progress[question.id]),
        }));
        const round2Groups = [
          { id: "format", label: "Format", status: normalizeStatus(progress.format), items: [{ id: "format", label: "Format", status: normalizeStatus(progress.format) }] },
          { id: "round2-practice", label: "Practice Questions", status: getGroupStatus(round2PracticeItems), items: round2PracticeItems },
        ];

        setCandidate(candidateData?.candidate ?? null);
        setSections([
          { id: "concepts", title: "Concepts", eyebrow: "ROUND 1", color: "#338bc4", groups: conceptGroups },
          { id: "round1-practice", title: "Practice Questions", eyebrow: "ROUND 1", color: "#4da56d", groups: practiceGroups },
          { id: "round2-practice", title: "Practice Questions", eyebrow: "ROUND 2", color: "#8065b6", groups: round2Groups },
        ]);
      } catch {
        setSections([]);
      } finally {
        setLoading(false);
      }
    };
    void loadDashboard();
  }, [candidateId]);

  if (loading) return <><Header screenName="Lead / Reviewer Workspace" /><div className="grid min-h-screen place-items-center bg-[#f7f8fa] text-slate-500">Loading learning progress...</div></>;

  const selectedSection = sections.find((section) => section.id === selectedSectionId) ?? sections[0];
  return (
    <>
      <Header screenName="Lead / Reviewer Workspace" />
      <div className="min-h-screen bg-[#f7f8fa] text-slate-700"><div className="mx-auto flex max-w-[1500px]">
        <aside className="hidden min-h-[calc(100vh-72px)] w-[280px] shrink-0 border-r border-slate-200 bg-white px-5 py-7 lg:block"><Link href="/dashboard/reviewer" className="mb-3 block rounded-lg px-4 py-3 text-[15px] font-semibold text-slate-600 hover:bg-slate-50">▦ &nbsp; Reviewer Dashboard</Link><Link href="/dashboard/reviewer/candidate-report" className="mb-3 block rounded-lg border border-[#cbbbe8] bg-[#f0eafa] px-4 py-3 text-[15px] font-bold text-[#6845a0]">▣ &nbsp; Candidate Report</Link><Link href="/dashboard/reviewer/candidate-information" className="block rounded-lg px-4 py-3 text-[15px] font-semibold text-slate-600 hover:bg-slate-50">♟ &nbsp; Candidate Information</Link></aside>
        <main className="min-w-0 flex-1 px-5 py-7 sm:px-8"><div className="mb-6 flex items-center justify-between gap-4"><div><div className="text-xs font-bold tracking-[0.14em] text-slate-400 uppercase">Learning Progress</div><h1 className="mt-1 text-2xl font-bold text-slate-800">{candidate?.candidateName ?? "Candidate"}</h1></div><Link href="/dashboard/reviewer/candidate-report" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm hover:bg-slate-50">← Back to Report</Link></div>
          <div className="mb-6 grid gap-4 xl:grid-cols-3">{sections.map((section) => <SummaryCard key={section.id} section={section} selected={selectedSection?.id === section.id} onSelect={() => setSelectedSectionId(section.id)} />)}</div>
          {selectedSection && <DetailPanel section={selectedSection} />}
        </main>
      </div></div>
    </>
  );
}
