"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ReviewerSidebar from "@/components/ReviewerSidebar";
import { questionManagerScreens } from "@/lib/question-manager";

type ScreenFile = { name: string; size: number; updatedAt: string };

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export default function QuestionManagerPage() {
  const [selectedScreen, setSelectedScreen] = useState(questionManagerScreens[0].id);
  const [files, setFiles] = useState<ScreenFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadFiles = async (screenId: string) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/question-manager?screen=${encodeURIComponent(screenId)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to load screen files");
      setFiles(data.files || []);
    } catch (loadError) {
      console.error(loadError);
      setFiles([]);
      setError("Unable to load files for this screen.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFiles(selectedScreen);
  }, [selectedScreen]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>, fileName: string) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploadingFile(fileName);
    setError("");
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("fileName", fileName);
      formData.append("file", file);
      const response = await fetch(`/api/question-manager?screen=${encodeURIComponent(selectedScreen)}`, { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to replace file");
      setMessage(`${fileName} replaced successfully.`);
      await loadFiles(selectedScreen);
    } catch (uploadError) {
      console.error(uploadError);
      setError(uploadError instanceof Error ? uploadError.message : "Unable to replace file.");
    } finally {
      setUploadingFile("");
    }
  };

  return (
    <>
      <Header screenName="Lead / Reviewer Workspace" />
      <div className="flex min-h-screen bg-[#f3f4f6] text-slate-800">
        <ReviewerSidebar />
        <main className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-6xl rounded-[20px] border border-slate-300 bg-[#f3f4f6] p-8 shadow-sm">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[2.2rem] font-semibold tracking-tight text-slate-800">Question Manager</h1>
                <p className="mt-2 text-base text-slate-500">Manage the data files used by each candidate learning screen.</p>
              </div>
              <Link href="/dashboard/reviewer" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100">Back to Dashboard</Link>
            </div>

            <label htmlFor="screen-select" className="mb-2 block text-sm font-semibold text-slate-700">Select screen</label>
            <select id="screen-select" value={selectedScreen} onChange={(event) => setSelectedScreen(event.target.value as typeof selectedScreen)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
              {questionManagerScreens.map((screen) => <option key={screen.id} value={screen.id}>{screen.label}</option>)}
            </select>

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-300 bg-white">
              <div className="border-b border-slate-200 bg-[#f0f1f4] px-5 py-4"><h2 className="font-semibold text-slate-800">Files in the selected screen&apos;s data folder</h2></div>
              {loading ? <p className="p-8 text-center text-slate-500">Loading files...</p> : error ? <p className="p-8 text-center text-red-600">{error}</p> : files.length === 0 ? <p className="p-8 text-center text-slate-500">No data files found.</p> : (
                <div className="divide-y divide-slate-200">
                  {files.map((file) => (
                    <div key={file.name} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                      <div><p className="font-semibold text-slate-700">{file.name}</p><p className="mt-1 text-sm text-slate-500">{formatFileSize(file.size)} · Updated {new Date(file.updatedAt).toLocaleString()}</p></div>
                      <div className="flex items-center gap-3">
                        <a href={`/api/question-manager?screen=${encodeURIComponent(selectedScreen)}&file=${encodeURIComponent(file.name)}`} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Download</a>
                        <label className="cursor-pointer rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600">{uploadingFile === file.name ? "Uploading..." : "Upload replacement"}<input type="file" className="sr-only" disabled={uploadingFile !== ""} onChange={(event) => void handleUpload(event, file.name)} /></label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {message && <p className="mt-4 text-sm font-medium text-green-700">{message}</p>}
          </div>
        </main>
      </div>
    </>
  );
}
