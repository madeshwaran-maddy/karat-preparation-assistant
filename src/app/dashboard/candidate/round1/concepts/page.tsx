"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import conceptsData from "./data/concepts.json";

interface TableData {
  title?: string;
  headers: string[];
  rows: string[][];
}

interface DetailSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  note?: string;
  codeExample?: string;
  table?: TableData;
}

interface Concept {
  id: string;
  title: string;
  summary: string;
  learningObjectives: string[];
  explanation: string[];
  detailSections: DetailSection[];
  keyConcepts: string[];
  commonMistakes: string[];
  debuggingScenario: string[];
  whenShouldYouUseIt: string[];
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
}

const conceptGroups = conceptsData as Record<string, Concept[]>;
const categories = Object.entries(conceptGroups).map(([key, items]) => ({
  key,
  title:
    key === "arrays"
      ? "Arrays"
      : key === "string"
      ? "String"
      : key === "object oriented programming (oops)"
      ? "Object Oriented Programming (OOPS)"
      : key
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
  concepts: items,
}));
const concepts = categories.flatMap((category) => category.concepts);

export default function ConceptsPage() {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(concepts[0]?.id ?? "");
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
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

  const filteredCategories = useMemo(
    () =>
      categories
        .map((category) => ({
          ...category,
          concepts: category.concepts.filter((concept) =>
            concept.title.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((category) => category.concepts.length > 0),
    [search]
  );
  const filteredConcepts = filteredCategories.flatMap((category) => category.concepts);

  const selectedConcept =
    concepts.find((concept) => concept.id === selectedId) ?? filteredConcepts[0];

  useEffect(() => {
    if (!selectedConcept && filteredConcepts.length > 0) {
      setSelectedId(filteredConcepts[0].id);
    }
  }, [filteredConcepts, selectedConcept]);

  useEffect(() => {
    if (selectedConcept) {
      setVisitedIds((ids) => new Set(ids).add(selectedConcept.id));
    }
  }, [selectedConcept]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">Loading...</div>;
  }

  if (!candidate || !selectedConcept) {
    return null;
  }

  function toggleComplete() {
    const isCompleted = completedIds.has(selectedConcept.id);

    setCompletedIds((ids) => {
      const nextIds = new Set(ids);
      nextIds.add(selectedConcept.id);
      return nextIds;
    });

    if (!isCompleted) {
      const currentIndex = concepts.findIndex((concept) => concept.id === selectedConcept.id);
      const nextConcept = concepts[currentIndex + 1];
      if (nextConcept) {
        setSelectedId(nextConcept.id);
      }
    }
  }

  return (
    <>
      <Header screenName="Round 1 Concepts" />
      <main className="min-h-screen bg-gray-50 p-6 md:p-8 lg:h-[calc(100vh-5rem)] lg:overflow-hidden">
        <div className="mx-auto max-w-7xl lg:flex lg:h-full lg:min-h-0 lg:flex-col">
          <Link
            href="/dashboard/candidate/round1"
            className="inline-flex w-fit items-center rounded-full border border-gray-300 bg-white px-5 py-2.5 font-semibold text-gray-800 shadow-sm hover:bg-gray-100"
          >
            Back to Round 1 Learning
          </Link>

          <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 flex flex-wrap justify-between gap-3 text-blue-900">
            <span><strong>{completedIds.size}</strong> / {concepts.length} concepts completed ({Math.round((completedIds.size / concepts.length) * 100)}%)</span>
            <span>Round 1 Concepts</span>
          </div>

          <div className="mt-6 grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <aside className="rounded-xl border border-gray-300 bg-white p-6 lg:min-h-0 lg:overflow-y-auto">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Complete Notes</h1>
                  <p className="mt-1 text-gray-600">{concepts.length} Concepts</p>
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50 font-semibold text-green-700">
                  {completedIds.size}/{concepts.length}
                </div>
              </div>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search a topic..."
                className="mt-6 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <div className="mt-5 border-t border-gray-200 pt-4">
                <nav className="mt-3 space-y-5">
                  {filteredCategories.map((category) => (
                    <div key={category.key}>
                      <h2 className="px-2 text-sm font-bold text-gray-900">{category.title}</h2>
                      <div className="mt-1 space-y-1">
                        {category.concepts.map((concept) => (
                          <button
                            key={concept.id}
                            onClick={() => setSelectedId(concept.id)}
                            className={`w-full rounded-lg px-3 py-2.5 pl-5 text-left text-sm transition ${
                              selectedConcept.id === concept.id
                                ? "border border-green-400 bg-green-50 font-semibold text-green-800"
                                : "text-gray-800 hover:bg-gray-100"
                            }`}
                          >
                            <span className="flex items-center justify-between gap-2">
                              <span>{concept.title}</span>
                              {completedIds.has(concept.id) ? (
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700" aria-label="Completed">✓</span>
                              ) : visitedIds.has(concept.id) ? (
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700" aria-label="In progress">↻</span>
                              ) : null}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </nav>
                {filteredConcepts.length === 0 && <p className="mt-4 text-sm text-gray-500">No topics found.</p>}
              </div>
            </aside>

            <article className="rounded-xl border border-gray-200 bg-white p-6 md:p-10 lg:min-h-0 lg:overflow-y-auto">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Concept</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-4xl font-bold text-gray-950">{selectedConcept.title}</h2>
                <button
                  onClick={toggleComplete}
                  className={`rounded-lg px-5 py-2.5 font-semibold text-white transition ${completedIds.has(selectedConcept.id) ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600"}`}
                >
                  {completedIds.has(selectedConcept.id) ? "Completed" : "Mark Complete"}
                </button>
              </div>
              <p className="mt-6 border-b border-gray-200 pb-8 text-lg leading-8 text-gray-700">{selectedConcept.summary}</p>

              <ContentList title="After this topic, you can" items={selectedConcept.learningObjectives} />

              <section className="mt-8">
                <h3 className="text-2xl font-bold text-gray-900">Explanation</h3>
                <div className="mt-4 space-y-4 text-gray-700 leading-7">
                  {selectedConcept.explanation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>

              {selectedConcept.detailSections.map((section) => (
                <section key={section.title} className="mt-8 border-t border-gray-200 pt-8">
                  <h3 className="text-2xl font-bold text-gray-900">{section.title}</h3>
                  {section.paragraphs?.map((paragraph) => <p key={paragraph} className="mt-4 leading-7 text-gray-700">{paragraph}</p>)}
                  {section.bullets && <ContentList items={section.bullets} />}
                  {section.codeExample && <pre className="mt-5 overflow-x-auto rounded-lg bg-gray-950 p-5 text-sm leading-6 text-gray-100"><code>{section.codeExample}</code></pre>}
                  {section.table && <DataTable table={section.table} />}
                  {section.note && <p className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-gray-700"><strong>Note:</strong> {section.note}</p>}
                </section>
              ))}

              <ContentList title="Key concepts" items={selectedConcept.keyConcepts} />
              <ContentList title="Common mistakes" items={selectedConcept.commonMistakes} />
              <ContentList title="Debugging scenarios" items={selectedConcept.debuggingScenario} />
              <ContentList title="When should you use it?" items={selectedConcept.whenShouldYouUseIt} />
            </article>
          </div>
        </div>
      </main>
    </>
  );
}

function ContentList({ title, items }: { title?: string; items: string[] }) {
  return (
    <section className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
      {title && <h3 className="text-xl font-bold text-blue-950">{title}</h3>}
      <ul className="mt-3 grid gap-3 md:grid-cols-2">
        {items.map((item) => <li key={item} className="flex gap-3 text-gray-800"><span className="text-blue-600">•</span><span>{item}</span></li>)}
      </ul>
    </section>
  );
}

function DataTable({ table }: { table: TableData }) {
  return (
    <div className="mt-5 overflow-x-auto rounded-lg border border-gray-200">
      {table.title && <p className="bg-gray-50 px-4 py-3 font-semibold text-gray-900">{table.title}</p>}
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-100"><tr>{table.headers.map((header) => <th key={header} className="px-4 py-3 font-semibold text-gray-900">{header}</th>)}</tr></thead>
        <tbody>{table.rows.map((row, rowIndex) => <tr key={rowIndex} className="border-t border-gray-200">{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3 align-top text-gray-700">{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
