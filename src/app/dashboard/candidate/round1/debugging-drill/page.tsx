"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import drillData from "./data/practice-questions.json";

interface DrillQuestion {
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

interface DrillTopic {
  id: string;
  title: string;
  summary: string;
  learningGoals: string[];
  questions: DrillQuestion[];
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

const rawDrillData = drillData as Record<string, DrillTopic[]>;

const categories = Object.entries(rawDrillData).map(([key, topics]) => ({
  key,
  title: key === "oops" ? "O O P S" : key.charAt(0).toUpperCase() + key.slice(1),
  topics: topics.map((topic) => ({
    ...topic,
    questions: shuffle(topic.questions).slice(0, 2),
  })),
}));

const drillTopics = categories.flatMap((category) => category.topics);

export default function DebuggingDrillPage() {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [editorCode, setEditorCode] = useState("");
  const [userAnalysis, setUserAnalysis] = useState("");
  const [timeLeft, setTimeLeft] = useState(4 * 60);
  const [isLocked, setIsLocked] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const questionIdMapRef = useRef<Map<string, string>>(new Map());
  const createdAssessmentRef = useRef(false);
  const createdQuestionKeysRef = useRef<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    if (createdAssessmentRef.current) {
      return;
    }

    const candidateData = localStorage.getItem("candidate");
    if (!candidateData) {
      router.push("/login");
      setLoading(false);
      return;
    }

    const nextCandidate = JSON.parse(candidateData) as Candidate;
    setCandidate(nextCandidate);
    createdAssessmentRef.current = true;

    const createAssessment = async () => {
      try {
        const response = await fetch("/api/assessments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidate_id: nextCandidate.id,
            round: 1,
          }),
        });

        if (!response.ok) {
          throw new Error("Unable to create assessment record");
        }

        const data = await response.json();
        setAssessmentId(data.assessment.id);
      } catch (error) {
        console.error("Failed to create assessment record:", error);
      } finally {
        setLoading(false);
      }
    };

    void createAssessment();
  }, [router]);

  const selectedTopic =
    drillTopics.find((topic) => topic.id === selectedTopicId) ?? null;

  const selectedQuestion =
    selectedTopic && selectedQuestionIndex >= 0
      ? selectedTopic.questions[selectedQuestionIndex] ?? selectedTopic.questions[0]
      : undefined;

  useEffect(() => {
    if (!selectedQuestion) {
      setEditorCode("");
      setUserAnalysis("");
      setTimeLeft(4 * 60);
      setIsLocked(false);
      setTimerPaused(false);
      return;
    }

    setEditorCode(selectedQuestion.buggyCode);
    setUserAnalysis("");
    setTimeLeft(4 * 60);
    setIsLocked(true);
    setTimerPaused(false);
  }, [selectedQuestion]);

  useEffect(() => {
    if (!selectedQuestion || !selectedTopic || !candidate || !assessmentId) {
      return;
    }

    const questionKey = `${assessmentId}-${selectedTopic.id}-${selectedQuestion.questionNo}`;
    if (createdQuestionKeysRef.current.has(questionKey) || questionIdMapRef.current.has(questionKey)) {
      return;
    }

    createdQuestionKeysRef.current.add(questionKey);

    const createQuestionRecord = async () => {
      try {
        const response = await fetch("/api/questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assessment_id: assessmentId,
            candidate_id: candidate.id,
            topic: selectedTopic.title,
            difficulty: selectedQuestion.difficulty,
            description: selectedQuestion.task,
            code: selectedQuestion.buggyCode,
            subtopic: selectedQuestion.title,
            question_no: selectedQuestion.questionNo,
          }),
        });

        if (!response.ok) {
          throw new Error("Unable to create question record");
        }

        const data = await response.json();
        questionIdMapRef.current.set(questionKey, data.question.id);
      } catch (error) {
        console.error("Failed to create question record:", error);
      }
    };

    void createQuestionRecord();
  }, [selectedQuestion, selectedTopic, candidate, assessmentId]);

  useEffect(() => {
    if (!selectedQuestion || timerPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [selectedQuestion, timerPaused]);

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

    router.push("/dashboard/candidate/round1");
  };

  const handleSubmit = async () => {
    if (!selectedTopic || !selectedQuestion || !candidate || !assessmentId) {
      return;
    }

    const questionKey = `${assessmentId}-${selectedTopic.id}-${selectedQuestion.questionNo}`;
    const questionId = questionIdMapRef.current.get(questionKey);

    if (!questionId) {
      console.error("Question record not created yet");
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
          user_code: editorCode,
          user_analysis: userAnalysis,
        }),
      });
    } catch (error) {
      console.error("Failed to submit evaluation:", error);
      return;
    }

    setTimerPaused(true);
    setIsLocked(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (!candidate) {
    return null;
  }

  return (
    <>
      <Header screenName="Round 1 Debugging Drill" />
      <main className="min-h-screen bg-gray-50 p-6 md:p-8">
        <div className="mx-auto max-w-[1500px] min-h-[calc(100vh-120px)]">
          <button
            type="button"
            onClick={handleBackToLearning}
            className="inline-flex w-fit items-center rounded-full border border-gray-300 bg-white px-5 py-2.5 font-semibold text-gray-800 shadow-sm transition hover:bg-gray-100"
          >
            Back to Round 1 Learning
          </button>

          <div className="mt-8 flex items-start justify-between gap-6">
            <div>
              <h1 className="text-5xl font-black tracking-tight text-gray-900">
                Debugging Drill
              </h1>
              <p className="mt-3 text-2xl text-gray-600">
                Fix one bug in the generated Java code.
              </p>
            </div>

            {selectedTopic && selectedQuestion && (
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-blue-200 bg-blue-100 px-4 py-3 text-xl font-bold text-blue-800 shadow-sm">
                  {selectedTopic.title}
                </div>
                <div className="rounded-xl border border-orange-200 bg-orange-100 px-4 py-2 text-base font-bold text-orange-700">
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 grid min-h-0 gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:h-[calc(100vh-260px)]">
            <aside className="min-h-0 overflow-y-auto rounded-2xl border border-gray-300 bg-white p-5 shadow-sm">
              <h2 className="text-4xl font-bold text-gray-900">Topics</h2>

              <div className="mt-6 space-y-5 border-l border-gray-200 pl-4">
                {categories.map((category) => (
                  <div key={category.key}>
                    <h3 className="text-lg font-bold uppercase tracking-[0.12em] text-gray-500">
                      {category.title}
                    </h3>

                    <div className="mt-3 space-y-3">
                      {category.topics.map((topic) => (
                        <div
                          key={topic.id}
                          className={`rounded-xl border p-3 transition ${
                            selectedTopic?.id === topic.id
                              ? "border-green-300 bg-green-50 shadow-sm"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (isLocked) {
                                return;
                              }
                              setSelectedTopicId(topic.id);
                              setSelectedQuestionIndex(0);
                            }}
                            disabled={isLocked}
                            className={`w-full text-left ${isLocked ? "cursor-not-allowed opacity-60" : ""}`}
                          >
                            <div className="text-xl font-medium text-gray-800">{topic.title}</div>
                          </button>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {topic.questions.map((question, index) => (
                              <button
                                key={`${topic.id}-question-${index}`}
                                type="button"
                                onClick={() => {
                                  if (isLocked) {
                                    return;
                                  }
                                  setSelectedTopicId(topic.id);
                                  setSelectedQuestionIndex(index);
                                }}
                                disabled={isLocked}
                                className={`rounded-md border px-2.5 py-1 text-sm font-semibold ${
                                  selectedTopic?.id === topic.id && selectedQuestionIndex === index
                                    ? "border-blue-500 bg-blue-100 text-blue-800"
                                    : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                                } ${isLocked ? "cursor-not-allowed opacity-60" : ""}`}
                              >
                                Q{index + 1}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <section className="min-h-0 overflow-y-auto rounded-2xl border border-gray-300 bg-white p-4 shadow-sm">
              {!selectedTopic || !selectedQuestion ? (
                <div className="flex h-full min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-xl text-gray-500">
                  Select a topic and question to begin
                </div>
              ) : (
                <>
                  <div className="mb-4 flex flex-wrap gap-3">
                    {selectedTopic.questions.map((question, index) => (
                      <button
                        key={`${selectedTopic.id}-header-${index}`}
                        type="button"
                        onClick={() => {
                          if (isLocked) {
                            return;
                          }
                          setSelectedQuestionIndex(index);
                        }}
                        disabled={isLocked}
                        className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                          selectedQuestionIndex === index
                            ? "border-blue-400 bg-blue-100 text-blue-800"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                        } ${isLocked ? "cursor-not-allowed opacity-60" : ""}`}
                      >
                        Q{index + 1}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-gray-700 bg-[#1d1f22] shadow-inner overflow-hidden">
                    <div className="flex items-center justify-between border-b border-gray-700 bg-[#26292d] px-5 py-3 text-white">
                      <div className="text-2xl font-bold">Java Editor</div>
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                      </div>
                    </div>

                    <div className="flex min-h-[330px]">
                      <div className="w-12 border-r border-gray-700 bg-[#1d1f22] px-2 py-4 text-right text-sm leading-7 text-gray-400">
                        {editorCode.split("\n").map((_, index) => (
                          <div key={`${selectedQuestion.questionNo}-line-${index + 1}`}>{index + 1}</div>
                        ))}
                      </div>

                      <textarea
                        value={editorCode}
                        onChange={(event) => setEditorCode(event.target.value)}
                        className="h-[330px] w-full resize-none border-0 bg-[#1d1f22] px-4 py-4 font-mono text-[15px] leading-7 text-[#f8f8f2] outline-none"
                        spellCheck={false}
                      />
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-2 text-lg font-semibold text-gray-800">Your analysis</div>
                    <textarea
                      value={userAnalysis}
                      onChange={(event) => setUserAnalysis(event.target.value)}
                      placeholder="Type your analysis here..."
                      className="h-28 w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-800 outline-none focus:border-blue-500"
                    />

                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-base font-semibold text-white transition hover:bg-blue-700"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
