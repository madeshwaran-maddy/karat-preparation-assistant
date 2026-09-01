"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import Header from "@/components/Header";

interface ExerciseQuestion {
  id: string;
  number: number;
  title: string;
  description: string;
  difficulty: string;
  prompt: string;
  starterCode: string;
  expectedOutput: string;
}

const defaultJavaTemplate = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}`;

export default function ExerciseQuestionsPage() {
  const [candidate, setCandidate] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [question, setQuestion] = useState<ExerciseQuestion | null>(null);
  const [code, setCode] = useState(defaultJavaTemplate);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string>("");
  const [status, setStatus] = useState<string>("Idle");
  const editorRef = useRef<any>(null);
  const questionIdMapRef = useRef<Map<string, string>>(new Map());
  const assessmentCreatedRef = useRef(false);

  const persistQuestionRecord = async (nextQuestion: ExerciseQuestion) => {
    if (!assessmentId || !candidate) {
      return;
    }

    const questionKey = `${assessmentId}-${nextQuestion.id}`;
    if (questionIdMapRef.current.has(questionKey)) {
      return;
    }

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assessment_id: assessmentId,
          candidate_id: candidate.id,
          topic: nextQuestion.title,
          difficulty: nextQuestion.difficulty,
          description: nextQuestion.description,
          code: nextQuestion.starterCode,
          subtopic: nextQuestion.title,
          question_no: nextQuestion.number,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Unable to create question record");
      }

      questionIdMapRef.current.set(questionKey, data.question.id);
    } catch (error) {
      console.error("Failed to create question record:", error);
      setStatus(error instanceof Error ? error.message : "Failed to create question record");
    }
  };

  useEffect(() => {
    if (assessmentCreatedRef.current) {
      return;
    }

    const initializeScreen = async () => {
      const candidateData = localStorage.getItem("candidate");
      if (!candidateData) {
        window.location.href = "/login";
        return;
      }

      const parsedCandidate = JSON.parse(candidateData) as { id: string; name: string; email: string; role: string };
      setCandidate(parsedCandidate);
      assessmentCreatedRef.current = true;

      try {
        const response = await fetch("/api/assessments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidate_id: parsedCandidate.id,
            round: 2,
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error || "Unable to create assessment record");
        }

        setAssessmentId(data.assessment.id);
      } catch (error) {
        console.error("Failed to create assessment record:", error);
        setStatus(error instanceof Error ? error.message : "Failed to create assessment record");
      }
    };

    void initializeScreen();
  }, []);

  const loadRandomQuestion = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/exercise-questions");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load question");
      }

      const nextQuestion = data.question ?? data.questions?.[0] ?? null;
      setQuestion(nextQuestion);
      setCode(nextQuestion?.starterCode || defaultJavaTemplate);
      setResult("");
      setStatus("Ready");
    } catch (error) {
      console.error(error);
      setStatus("Failed to load question");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!question || !assessmentId || !candidate) {
      return;
    }

    void persistQuestionRecord(question);
  }, [question, assessmentId, candidate]);

  useEffect(() => {
    if (!assessmentId) {
      return;
    }

    void loadRandomQuestion();
  }, [assessmentId]);

  const handleRun = async () => {
    if (!code.trim()) {
      setStatus("No code to run");
      return;
    }

    setRunning(true);
    setStatus("Running...");
    setResult("");

    try {
      const submissionBody = {
        source_code: btoa(unescape(encodeURIComponent(code))),
        language_id: 62,
        stdin: "",
        cpu_time_limit: 2,
        memory_limit: 512000,
        wait: false,
      };

      const submitResponse = await fetch(
        "https://ce.judge0.com/submissions?base64_encoded=true&wait=false",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submissionBody),
        }
      );

      const submitData = await submitResponse.json();

      if (!submitResponse.ok || !submitData.token) {
        throw new Error(submitData?.error || submitData?.message || "Failed to run code");
      }

      let resultData: any = null;
      for (let attempt = 0; attempt < 20; attempt += 1) {
        const resultResponse = await fetch(
          `https://ce.judge0.com/submissions/${submitData.token}?base64_encoded=true&fields=*`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        resultData = await resultResponse.json();
        const statusId = resultData?.status?.id;

        if (
          statusId === 3 ||
          statusId === 4 ||
          statusId === 5 ||
          statusId === 6 ||
          statusId === 7 ||
          statusId === 8 ||
          statusId === 9 ||
          statusId === 10 ||
          statusId === 11 ||
          statusId === 12 ||
          statusId === 13 ||
          statusId === 14
        ) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const decodedOutput = [
        resultData?.stdout ? atob(resultData.stdout) : "",
        resultData?.stderr ? atob(resultData.stderr) : "",
        resultData?.compile_output ? atob(resultData.compile_output) : "",
        resultData?.message ? atob(resultData.message) : "",
      ]
        .filter(Boolean)
        .join("\n")
        .trim();

      const finalOutput = decodedOutput || "Program ran successfully with no output.";
      setStatus(resultData?.status?.description || "Completed");
      setResult(finalOutput);

      if (assessmentId && question && candidate) {
        const questionId = questionIdMapRef.current.get(`${assessmentId}-${question.id}`);
        if (questionId) {
          await fetch("/api/evaluations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              assessment_id: assessmentId,
              candidate_id: candidate.id,
              question_id: questionId,
              user_code: code,
              user_analysis: finalOutput,
            }),
          });
        }
      }
    } catch (error) {
      console.error(error);
      setStatus("Execution failed");
      setResult(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setRunning(false);
    }
  };

  const handleBackToLearning = async () => {
    if (assessmentId) {
      try {
        await fetch("/api/assessments", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assessment_id: assessmentId,
            status: "completed",
          }),
        });
      } catch (error) {
        console.error("Failed to mark assessment as completed:", error);
      }
    }

    window.location.href = "/dashboard/candidate/round2";
  };

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
  };

  return (
    <>
      <Header screenName="Exercise Questions" />
      <div className="min-h-screen bg-gray-50 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBackToLearning}
              className="inline-flex w-fit items-center rounded-full border border-gray-300 bg-white px-5 py-2.5 font-semibold text-gray-800 shadow-sm hover:bg-gray-100"
            >
              Back to Round 2 Learning
            </button>

            <button
              onClick={() => void loadRandomQuestion()}
              className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white hover:bg-violet-700"
            >
              Load Random Question
            </button>
          </div>

          {loading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-gray-600">
              Loading a random exercise question...
            </div>
          ) : question ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Java Compiler</h2>
                  <button
                    onClick={handleRun}
                    disabled={running}
                    className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {running ? "Running..." : "Run"}
                  </button>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <Editor
                    height="420px"
                    language="java"
                    theme="vs-dark"
                    value={code}
                    onMount={handleEditorMount}
                    onChange={(value: string | undefined) => setCode(value ?? "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      automaticLayout: true,
                      wordWrap: "on",
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>

                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Output</h3>
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">
                      {status}
                    </span>
                  </div>
                  <pre className="min-h-[120px] whitespace-pre-wrap rounded-md bg-slate-900 p-3 text-sm text-slate-100">
                    {result || "Run your Java code to see the output here."}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-red-700">
              No exercise questions were found in the workbook.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
