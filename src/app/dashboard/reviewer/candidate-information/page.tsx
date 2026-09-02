"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ReviewerSidebar from "@/components/ReviewerSidebar";

type CandidateFormData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  lead_name: string;
  status: string;
  role: string;
  language_selected: string;
  mock_enabled: boolean;
  start_date: string;
  karat_assessment_date: string;
  karat_prep_timeline: string;
};

const EMPTY_FORM: CandidateFormData = {
  id: "",
  name: "",
  email: "",
  phone: "",
  lead_name: "",
  status: "Preparation",
  role: "candidate",
  language_selected: "Java",
  mock_enabled: false,
  start_date: "",
  karat_assessment_date: "",
  karat_prep_timeline: "",
};

export default function CandidateInformationPage() {
  const [form, setForm] = useState<CandidateFormData>(EMPTY_FORM);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CandidateFormData[]>([]);
  const [loadedName, setLoadedName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const dateOptions = useMemo(
    () => [
      "2 week",
      "4 week",
      "6 week",
      "8 week",
      "12 week",
    ],
    [],
  );

  const statusOptions = [
    "Preparation",
    "Completed Assessment",
    "Cleared Assessment",
    "Rejected",
  ];

  const mapCandidateToForm = (candidate: any): CandidateFormData => ({
    id: candidate.id || "",
    name: candidate.name || "",
    email: candidate.email || "",
    phone: candidate.phone || "",
    lead_name: candidate.lead_name || "",
    status: [
      "Preparation",
      "Completed Assessment",
      "Cleared Assessment",
      "Rejected",
    ].includes(candidate.status || "")
      ? candidate.status
      : "Preparation",
    role: candidate.role || "candidate",
    language_selected: candidate.language_selected || "Java",
    mock_enabled: Boolean(candidate.mock_enabled),
    start_date: candidate.start_date || "",
    karat_assessment_date: candidate.karat_assessment_date || "",
    karat_prep_timeline: candidate.karat_prep_timeline || "",
  });

  const loadCandidate = async (term = "") => {
    const trimmed = term.trim();
    if (!trimmed || trimmed.length < 3) {
      setSearchResults([]);
      setForm({ ...EMPTY_FORM, role: "candidate" });
      setLoadedName("");
      setStatusMessage("");
      return;
    }

    setLoading(true);
    setStatusMessage("");

    try {
      const response = await fetch(`/api/reviewer/candidate?search=${encodeURIComponent(trimmed)}`);

      if (!response.ok) {
        throw new Error("Failed to load candidate data");
      }

      const data = await response.json();
      const candidates = Array.isArray(data?.candidates) ? data.candidates : [];
      const candidate = data?.candidate || candidates[0] || null;

      setSearchResults(candidates);

      if (!candidate) {
        setForm({ ...EMPTY_FORM, role: "candidate" });
        setLoadedName("");
        setStatusMessage("No matching candidate found");
        return;
      }

      const nextForm = mapCandidateToForm(candidate);
      setForm(nextForm);
      setLoadedName(candidate.name || "");
    } catch (error) {
      console.error(error);
      setStatusMessage("Unable to fetch candidate data right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    const trimmed = value.trim();
    setSearchTerm(value);

    if (!trimmed || trimmed.length < 3) {
      setSearchResults([]);
      setStatusMessage("");
      return;
    }

    loadCandidate(trimmed);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = event.target;
    const checked = type === "checkbox" ? (event.target as HTMLInputElement).checked : undefined;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setStatusMessage("");

    try {
      const response = await fetch("/api/reviewer/candidate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to submit candidate details");
      }

      const candidateName = form.name || loadedName || "Candidate";
      setLoadedName(candidateName);
      setStatusMessage("Candidate information updated successfully");
    } catch (error) {
      console.error(error);
      setStatusMessage(error instanceof Error ? error.message : "Unable to save candidate information.");
    } finally {
      setSaving(false);
    }
  };

  const searchCandidate = async () => {
    await loadCandidate(searchTerm);
  };

  return (
    <>
      <Header screenName="Lead / Reviewer Workspace" />
      <div className="flex min-h-screen bg-[#f3f4f6] text-slate-800">
          <ReviewerSidebar />

        <main className="flex-1 px-10 py-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex justify-end">
              <Link
                href="/dashboard/reviewer"
                className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
              >
                Go to Main Dashboard
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-300 bg-[#f3f4f6] p-8">
              <h1 className="mb-8 text-[2.2rem] font-semibold tracking-tight text-slate-800">
                Edit Candidate
              </h1>

              <div className="mb-8 flex items-center gap-4">
                <label className="w-32 text-base font-semibold text-slate-700">Search</label>
                <div className="relative flex-1">
                  <input
                    type="text"
                    name="search"
                    value={searchTerm}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    placeholder="Search by candidate name or email"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />

                  {searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                      {searchResults.map((candidate) => (
                        <button
                          key={candidate.id || `${candidate.name}-${candidate.email}`}
                          type="button"
                          onClick={() => {
                            setSearchTerm(candidate.name || candidate.email || "");
                            setSearchResults([]);
                            const nextForm = mapCandidateToForm(candidate);
                            setForm(nextForm);
                            setLoadedName(candidate.name || "");
                            setStatusMessage("");
                          }}
                          className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left transition hover:bg-violet-50 last:border-b-0"
                        >
                          <span className="font-medium text-slate-700">{candidate.name || "Unknown"}</span>
                          <span className="text-sm text-slate-500">{candidate.email || "No email"}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => loadCandidate(searchTerm)}
                  disabled={loading || !searchTerm.trim() || searchTerm.trim().length < 3}
                  className="rounded-xl bg-violet-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
                {loadedName && (
                  <div className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700">
                    Loaded: {loadedName}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-base font-semibold text-slate-700">Candidate Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-semibold text-slate-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-semibold text-slate-700">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-semibold text-slate-700">Programming Language</label>
                    <select
                      name="language_selected"
                      value={form.language_selected}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    >
                      <option value="Java">Java</option>
                      <option value="Python">Python</option>
                      <option value="JavaScript">JavaScript</option>
                      <option value="C++">C++</option>
                      <option value="Go">Go</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-semibold text-slate-700">Lead Name</label>
                    <input
                      type="text"
                      name="lead_name"
                      value={form.lead_name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-semibold text-slate-700">Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-semibold text-slate-700">Mock Enable</label>
                    <select
                      name="mock_enabled"
                      value={form.mock_enabled ? "true" : "false"}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          mock_enabled: event.target.value === "true",
                        }))
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    >
                      <option value="false">false</option>
                      <option value="true">true</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-semibold text-slate-700">Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-semibold text-slate-700">Karat Assessment Date</label>
                    <input
                      type="date"
                      name="karat_assessment_date"
                      value={form.karat_assessment_date}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-semibold text-slate-700">Karat Prep Timeline</label>
                    <select
                      name="karat_prep_timeline"
                      value={form.karat_prep_timeline}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    >
                      {dateOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-semibold text-slate-700">Role</label>
                    <div className="flex items-center gap-6 rounded-xl border border-slate-300 bg-white px-4 py-3">
                      <label className="flex items-center gap-2 text-base text-slate-700">
                        <input
                          type="radio"
                          name="role"
                          value="candidate"
                          checked={form.role === "candidate"}
                          onChange={handleChange}
                        />
                        Candidate
                      </label>
                      <label className="flex items-center gap-2 text-base text-slate-700">
                        <input
                          type="radio"
                          name="role"
                          value="reviewer"
                          checked={form.role === "reviewer"}
                          onChange={handleChange}
                        />
                        Reviewer
                      </label>
                    </div>
                  </div>
                </div>

                {statusMessage && (
                  <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-700">
                    {statusMessage}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-violet-500 px-7 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
