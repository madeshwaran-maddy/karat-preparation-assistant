"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/Header";
import JavaCodeEditor from "@/components/JavaCodeEditor";
import practiceQuestionsData from "./data/practice-questions.json";

interface PracticeQuestion {
  questionNo: number;
  title: string;
  difficulty: string;
  task: string;
  buggyCode: string;
  answer: string;
  explanation: string;
  correctedCode: string;
  followUpQuestions: string[];
}

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

function shuffleList<T>(items: T[]) {
  const nextItems = [...items];
  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]];
  }
  return nextItems;
}

const round1QuestionPool = Object.values(
  practiceQuestionsData as Record<string, Array<{ questions: PracticeQuestion[] }>>
).flatMap((group) => group.flatMap((topic) => topic.questions));

const defaultJavaTemplate = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}`;

const ROUND1_QUESTION_TIME = 4 * 60;
const ROUND2_TIME = 30 * 60;

export default function PracticeMockPage() {
  const [candidate, setCandidate] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<1 | 2>(1);
  const [selectedRound1Index, setSelectedRound1Index] = useState(0);
  const [round1Questions, setRound1Questions] = useState<PracticeQuestion[]>([]);
  const [round2Question, setRound2Question] = useState<ExerciseQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [round1Timers, setRound1Timers] = useState<number[]>([]);
  const [round2TimeLeft, setRound2TimeLeft] = useState(ROUND2_TIME);
  const [editorCode, setEditorCode] = useState(defaultJavaTemplate);
  const [runStatus, setRunStatus] = useState("Idle");
  const [runResult, setRunResult] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [submittedRound1Questions, setSubmittedRound1Questions] = useState<boolean[]>([]);
  const [isRound2Submitted, setIsRound2Submitted] = useState(false);
  const [interviewerName, setInterviewerName] = useState("");
  const [isStartModalOpen, setIsStartModalOpen] = useState(true);
  const [startingAssessment, setStartingAssessment] = useState(false);
  const round1SubmitHandlerRef = useRef<() => Promise<void>>(async () => undefined);
  const round2SubmitHandlerRef = useRef<() => Promise<void>>(async () => undefined);
  const questionIdMapRef = useRef<Map<string, string>>(new Map());
  const assessmentCreatedRef = useRef(false);
  const router = useRouter();

  const persistQuestionRecord = async (question: PracticeQuestion | ExerciseQuestion, roundNumber: 1 | 2) => {
    if (!assessmentId || !candidate) {
      return;
    }

    const questionKey = `${assessmentId}-${roundNumber}-${"questionNo" in question ? question.questionNo : question.id}`;
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
          topic: question.title,
          difficulty: question.difficulty,
          description: roundNumber === 1 ? (question as PracticeQuestion).task : (question as ExerciseQuestion).description || (question as ExerciseQuestion).prompt,
          code: roundNumber === 1 ? (question as PracticeQuestion).buggyCode : (question as ExerciseQuestion).starterCode,
          subtopic: roundNumber === 2 ? `Question ${(question as ExerciseQuestion).number}` : question.title,
          question_no: "questionNo" in question ? question.questionNo : question.number,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Unable to create question record");
      }

      questionIdMapRef.current.set(questionKey, data.question.id);
    } catch (error) {
      console.error("Failed to create question record:", error);
      setRunStatus(error instanceof Error ? error.message : "Failed to create question record");
    }
  };

  const saveEvaluationRecord = async (questionId: string, userCode: string, userAnalysis: string) => {
    if (!assessmentId || !candidate) {
      return;
    }

    try {
      await fetch("/api/evaluations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assessment_id: assessmentId,
          candidate_id: candidate.id,
          question_id: questionId,
          user_code: userCode,
          user_analysis: userAnalysis,
        }),
      });
    } catch (error) {
      console.error("Failed to create evaluation record:", error);
    }
  };

  useEffect(() => {
    if (assessmentCreatedRef.current) {
      return;
    }

    const candidateData = localStorage.getItem("candidate");
    if (!candidateData) {
      router.push("/login");
      return;
    }

    setCandidate(JSON.parse(candidateData) as { id: string; name: string; email: string; role: string });
  }, [router]);

  const handleStartAssessment = async () => {
    const trimmedInterviewerName = interviewerName.trim();
    if (!candidate || !trimmedInterviewerName || startingAssessment) {
      return;
    }

    setStartingAssessment(true);

    try {
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidate_id: candidate.id,
          round: 4,
          interviewer_name: trimmedInterviewerName,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Unable to create assessment record");
      }

      assessmentCreatedRef.current = true;
      setAssessmentId(data.assessment.id);
      setIsStartModalOpen(false);
    } catch (error) {
      console.error("Failed to create assessment record:", error);
      setRunStatus(error instanceof Error ? error.message : "Failed to create assessment record");
    } finally {
      setStartingAssessment(false);
    }
  };

  useEffect(() => {
    if (!assessmentId) {
      return;
    }

    const timer = window.setInterval(() => {
      if (selectedRound === 1) {
        if (submittedRound1Questions[selectedRound1Index]) {
          return;
        }

        setRound1Timers((currentTimers) =>
          currentTimers.map((value, index) =>
            index === selectedRound1Index ? Math.max(value - 1, 0) : value
          )
        );
        return;
      }

      if (isRound2Submitted) {
        return;
      }

      setRound2TimeLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [assessmentId, selectedRound, selectedRound1Index, submittedRound1Questions, isRound2Submitted]);

  useEffect(() => {
    const randomQuestions = shuffleList(round1QuestionPool).slice(0, 4);
    setRound1Questions(randomQuestions);
    setRound1Timers(Array(randomQuestions.length).fill(ROUND1_QUESTION_TIME));
    setSubmittedRound1Questions(Array(randomQuestions.length).fill(false));
  }, []);

  const activeQuestion = useMemo(() => {
    if (selectedRound === 1) {
      return round1Questions[selectedRound1Index] ?? null;
    }

    return round2Question ?? null;
  }, [selectedRound, selectedRound1Index, round1Questions, round2Question]);

  const round1ActiveQuestion = selectedRound === 1 ? (activeQuestion as PracticeQuestion | null) : null;
  const round2ActiveQuestion = selectedRound === 2 ? (activeQuestion as ExerciseQuestion | null) : null;

  useEffect(() => {
    if (!assessmentId || !candidate) {
      return;
    }

    if (selectedRound === 1 && round1ActiveQuestion) {
      void persistQuestionRecord(round1ActiveQuestion, 1);
      return;
    }

    if (selectedRound === 2 && round2ActiveQuestion) {
      void persistQuestionRecord(round2ActiveQuestion, 2);
    }
  }, [assessmentId, candidate, selectedRound, round1ActiveQuestion, round2ActiveQuestion]);

  useEffect(() => {
    let active = true;

    const loadRound2Question = async () => {
      try {
        const response = await fetch("/api/exercise-questions");
        const data = await response.json();

        if (!active) {
          return;
        }

        if (!response.ok) {
          throw new Error(data?.error || "Unable to load Question");
        }

        setRound2Question(data.question ?? data.questions?.[0] ?? null);
      } catch (error) {
        console.error(error);
        if (active) {
          setRound2Question(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadRound2Question();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (selectedRound === 1) {
      setEditorCode(round1ActiveQuestion?.buggyCode || defaultJavaTemplate);
      return;
    }

    setEditorCode(round2ActiveQuestion?.starterCode || defaultJavaTemplate);
  }, [selectedRound, round1ActiveQuestion, round2ActiveQuestion]);

  const displayTitle = activeQuestion?.title || "Loading question...";
  const description =
    selectedRound === 1
      ? round1ActiveQuestion?.task || "Question is loading."
      : round2ActiveQuestion?.description || round2ActiveQuestion?.prompt || "Question is loading.";

  const activeTimeLeft =
    selectedRound === 1
      ? round1Timers[selectedRound1Index] ?? ROUND1_QUESTION_TIME
      : round2TimeLeft;

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  const handleRunCode = async () => {
    if (!editorCode.trim()) {
      setRunStatus("No code to run");
      setRunResult("");
      return;
    }

    setIsRunning(true);
    setRunStatus("Running...");
    setRunResult("");

    try {
      const response = await fetch("/api/judge0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sourceCode: editorCode, languageId: 5 }),
      });

      const data = await response.json();

      if (!response.ok || data?.error) {
        throw new Error(data?.error || "Failed to run code");
      }

      const output = [data.stdout, data.stderr, data.compile_output, data.message]
        .filter(Boolean)
        .join("\n")
        .trim();

      setRunStatus(data.status || "Completed");
      setRunResult(output || "Program ran successfully with no output.");
    } catch (error) {
      console.error(error);
      setRunStatus("Execution failed");
      setRunResult(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsRunning(false);
    }
  };

  const currentRound1Submitted = submittedRound1Questions[selectedRound1Index] ?? false;

  const handleRound1Submit = async () => {
    if (currentRound1Submitted) {
      return;
    }

    const activeQuestionForSubmit = round1Questions[selectedRound1Index];
    if (activeQuestionForSubmit) {
      await persistQuestionRecord(activeQuestionForSubmit, 1);
      const questionId = questionIdMapRef.current.get(`${assessmentId}-1-${activeQuestionForSubmit.questionNo}`);
      if (questionId) {
        await saveEvaluationRecord(questionId, editorCode, "");
      }
    }

    setSubmittedRound1Questions((current) =>
      current.map((value, index) => (index === selectedRound1Index ? true : value))
    );
    setRunStatus("Submitted");
    setRunResult("Your answer has been submitted for this question.");
  };

  const handleRound1Next = () => {
    if (!currentRound1Submitted) {
      return;
    }

    if (selectedRound1Index >= round1Questions.length - 1) {
      setSelectedRound(2);
      setRound2TimeLeft(ROUND2_TIME);
      setRunStatus("Idle");
      setRunResult("");
      return;
    }

    setSelectedRound(1);
    setSelectedRound1Index((currentIndex) => Math.min(currentIndex + 1, round1Questions.length - 1));
    setRunStatus("Idle");
    setRunResult("");
  };

  const handleRound2Submit = async () => {
    if (isRound2Submitted) {
      router.push("/dashboard/candidate");
      return;
    }

    if (round2ActiveQuestion) {
      await persistQuestionRecord(round2ActiveQuestion, 2);
      const questionId = questionIdMapRef.current.get(`${assessmentId}-2-${round2ActiveQuestion.id}`);
      if (questionId) {
        await saveEvaluationRecord(questionId, editorCode, runResult || "");
      }
    }

    setIsRound2Submitted(true);
    setRunStatus("Submitted");
    setRunResult("Your Round 2 answer has been submitted.");
  };

  round1SubmitHandlerRef.current = handleRound1Submit;
  round2SubmitHandlerRef.current = handleRound2Submit;

  useEffect(() => {
    const activeTimeLeft = round1Timers[selectedRound1Index] ?? ROUND1_QUESTION_TIME;
    if (selectedRound !== 1 || !round1ActiveQuestion || currentRound1Submitted || activeTimeLeft !== 0) {
      return;
    }

    void round1SubmitHandlerRef.current();
  }, [selectedRound, round1ActiveQuestion, round1Timers, selectedRound1Index, currentRound1Submitted]);

  useEffect(() => {
    if (selectedRound !== 2 || !round2ActiveQuestion || isRound2Submitted || round2TimeLeft !== 0) {
      return;
    }

    void round2SubmitHandlerRef.current();
  }, [selectedRound, round2ActiveQuestion, isRound2Submitted, round2TimeLeft]);

  if (loading && round1Questions.length === 0) {
    return (
      <>
        <Header screenName="Mock Assessment" />
        <div className="flex min-h-screen items-center justify-center bg-slate-100 text-lg text-slate-600">
          Loading assessment...
        </div>
      </>
    );
  }

  return (
    <>
      <Header screenName="Mock Assessment" />

      {isStartModalOpen && candidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-800">Start Mock Assessment</h2>
            <p className="mt-2 text-sm text-slate-600">Enter the interviewer name to begin the assessment.</p>
            <label htmlFor="interviewer-name" className="mt-5 block text-sm font-semibold text-slate-700">
              Interviewer Name
            </label>
            <input
              id="interviewer-name"
              type="text"
              value={interviewerName}
              onChange={(event) => setInterviewerName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleStartAssessment();
                }
              }}
              autoFocus
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Enter interviewer name"
            />
            <button
              type="button"
              onClick={() => void handleStartAssessment()}
              disabled={!interviewerName.trim() || startingAssessment}
              className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {startingAssessment ? "Starting..." : "Start Assessment"}
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#edf0f2] px-6 py-8 text-slate-800 antialiased">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-700">Mock Assessment</h1>
        </div>

        <div className="grid grid-cols-[300px_minmax(0,1fr)] gap-6">
          <aside className="rounded-[18px] border border-slate-300 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-slate-700">Assessment</h2>
              <h3 className="mt-1 text-xl font-bold text-slate-700">Questions</h3>
              <p className="mt-3 text-sm text-slate-500">Select a question</p>
            </div>

            <div className="mb-8">
              <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Round 1
              </div>
              <div className="space-y-3">
                {round1Questions.map((question, index) => {
                  const isSelected = selectedRound === 1 && selectedRound1Index === index;

                  return (
                    <button
                      key={`${question.title}-${index}`}
                      type="button"
                      disabled
                      onClick={() => {
                        setSelectedRound(1);
                        setSelectedRound1Index(index);
                        setRound1Timers((currentTimers) =>
                          currentTimers.map((value, timerIndex) =>
                            timerIndex === index ? ROUND1_QUESTION_TIME : value
                          )
                        );
                      }}
                      className={`flex h-12 w-full cursor-not-allowed items-center justify-center rounded-lg border text-lg font-semibold opacity-60 ${
                        isSelected
                          ? "border-[#6ebd7d] bg-[#d9f0df] text-[#1c6d36]"
                          : "border-slate-200 bg-slate-100 text-slate-700"
                      }`}
                    >
                      Q{index + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-5">
              <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Round 2
              </div>
              <button
                type="button"
                disabled
                onClick={() => {
                  setSelectedRound(2);
                  setRound2TimeLeft(ROUND2_TIME);
                }}
                className={`flex w-full cursor-not-allowed items-center justify-center rounded-full border px-4 py-3 text-base font-medium opacity-60 ${
                  selectedRound === 2
                    ? "border-slate-300 bg-slate-200 text-slate-700"
                    : "border-slate-200 bg-slate-100 text-slate-600"
                }`}
              >
                {round2Question?.title || "Question title"}
              </button>
            </div>
          </aside>

          <main className="rounded-[18px] border border-slate-300 bg-[#f5f4f0] p-6 shadow-sm">
            <div className="flex items-center justify-between rounded-[14px] border border-[#d5a942] bg-[#f6f0dc] px-5 py-4">
              <div className="text-xl font-bold text-slate-700">Time remaining</div>
              <div className="text-3xl font-bold text-[#a46614]">{formatTime(activeTimeLeft)}</div>
            </div>

            <div className="mt-8">
              <div className="mb-3 text-base font-medium text-slate-700">Question {selectedRound === 1 ? selectedRound1Index + 1 : 1}</div>

              <div className="flex items-start justify-between gap-6">
                <h2 className="max-w-4xl text-[2rem] font-bold leading-snug text-slate-700">
                  {displayTitle}
                </h2>

                <span className="mt-1 inline-flex rounded-full border border-slate-300 bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                  Round {selectedRound}
                </span>
              </div>

              <p className="mt-6 max-w-5xl text-base leading-7 text-slate-600">{description}</p>

              <div className="mt-8 overflow-hidden rounded-[14px] border border-slate-800 bg-[#1b2941] shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-700 bg-[#1a2336] px-5 py-4 text-xl text-slate-200">
                  <div className="font-medium">Main.java</div>
                  <div className="font-semibold text-slate-200">Java</div>
                </div>

                <div className="h-[420px] w-full bg-[#1b2941]">
                  <JavaCodeEditor
                    value={editorCode}
                    onChange={setEditorCode}
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {selectedRound === 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={handleRound1Submit}
                        disabled={currentRound1Submitted}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        onClick={handleRound1Next}
                        disabled={!currentRound1Submitted}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                      >
                        {selectedRound1Index >= round1Questions.length - 1 ? "Next to Round 2" : "Next"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleRunCode()}
                        disabled={isRunning}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isRunning ? "Running..." : "Run"}
                      </button>
                      <button
                        type="button"
                        onClick={handleRound2Submit}
                        disabled={false}
                        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                      >
                        {isRound2Submitted ? "Back to Candidate Dashboard" : "Submit"}
                      </button>
                    </>
                  )}
                </div>

                {(selectedRound === 2 || runStatus !== "Idle" || runResult) && (
                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-800">Output</h3>
                      <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">
                        {runStatus}
                      </span>
                    </div>
                    <pre className="min-h-[100px] whitespace-pre-wrap rounded-md bg-slate-900 p-3 text-sm text-slate-100">
                      {runResult || "Run your Java code to see the output here."}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
