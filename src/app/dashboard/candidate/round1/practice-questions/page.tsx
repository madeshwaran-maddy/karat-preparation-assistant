"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import practiceData from "./data/practice-questions.json";

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

interface PracticeTopic {
  id: string;
  title: string;
  summary: string;
  learningGoals: string[];
  questions: PracticeQuestion[];
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
}

const practiceGroups = practiceData as Record<string, PracticeTopic[]>;
const categories = Object.entries(practiceGroups).map(([key, topics]) => ({
  key,
  title: key === "oops" ? "O O P S Concept" : key.charAt(0).toUpperCase() + key.slice(1),
  topics,
}));
const topics = categories.flatMap((category) => category.topics);
const questions = topics.flatMap((topic) => topic.questions.map((question) => ({ topic, question })));

const LEARNING_PROGRESS_STORAGE_KEY = "karat_learning_progress";

function readStoredLearningProgress(candidateId: string) {
  try {
    const storedProgress = JSON.parse(localStorage.getItem(LEARNING_PROGRESS_STORAGE_KEY) ?? "{}");
    return storedProgress[candidateId] ?? {};
  } catch {
    return {};
  }
}

function writeStoredLearningProgress(candidateId: string, progress: Record<string, string>) {
  try {
    const storedProgress = JSON.parse(localStorage.getItem(LEARNING_PROGRESS_STORAGE_KEY) ?? "{}");
    storedProgress[candidateId] = progress;
    localStorage.setItem(LEARNING_PROGRESS_STORAGE_KEY, JSON.stringify(storedProgress));
  } catch {
    // Ignore localStorage errors gracefully.
  }
}

export default function PracticeQuestionsPage() {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState(topics[0]?.id ?? "");
  const [selectedQuestionNo, setSelectedQuestionNo] = useState(1);
  const [visitedQuestionKeys, setVisitedQuestionKeys] = useState<Set<string>>(new Set());
  const [completedQuestionKeys, setCompletedQuestionKeys] = useState<Set<string>>(new Set());
  const [showBriefing, setShowBriefing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(1);
  const router = useRouter();

  const persistPracticeQuestionProgress = async (itemId: string, status: "in_progress" | "completed" | "not_started") => {
    if (!candidate?.id) {
      return;
    }

    const requestBody = {
      candidateId: candidate.id,
      round: 1,
      module: "practice_questions",
      itemId,
      status,
    };

    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
    } catch {
      // Fall back silently if the API is unavailable.
    }

    const storedProgress = readStoredLearningProgress(candidate.id);
    storedProgress[itemId] = status;
    writeStoredLearningProgress(candidate.id, storedProgress);
  };

  const loadPracticeQuestionProgress = async (candidateId: string) => {
    try {
      const response = await fetch(`/api/progress?candidateId=${encodeURIComponent(candidateId)}`);
      const data = await response.json();
      const backendProgress: Record<string, string> = {};

      for (const item of data.items ?? []) {
        if (item.round === 1 && item.module === "practice_questions" && item.item_id) {
          backendProgress[item.item_id] = item.status;
        }
      }

      if (Object.keys(backendProgress).length > 0) {
        const completedSet = new Set(
          Object.entries(backendProgress)
            .filter(([, status]) => status === "completed")
            .map(([itemId]) => itemId),
        );

        setCompletedQuestionKeys(completedSet);
        writeStoredLearningProgress(candidateId, backendProgress);

        const firstPendingQuestion = questions.find((entry) => {
          const key = `${entry.topic.id}-${entry.question.questionNo}`;
          const status = backendProgress[key];
          return status === "in_progress" || (!completedSet.has(key) && status !== "completed");
        });

        if (firstPendingQuestion) {
          setSelectedTopicId(firstPendingQuestion.topic.id);
          setSelectedQuestionNo(firstPendingQuestion.question.questionNo);
        }
        return;
      }
    } catch {
      // Ignore API errors and fall back to localStorage.
    }

    const storedProgress = readStoredLearningProgress(candidateId);
    const completedSet = new Set(
      Object.entries(storedProgress)
        .filter(([, status]) => status === "completed")
        .map(([itemId]) => itemId),
    );

    setCompletedQuestionKeys(completedSet);

    const firstPendingQuestion = questions.find((entry) => {
      const key = `${entry.topic.id}-${entry.question.questionNo}`;
      const status = storedProgress[key];
      return status === "in_progress" || (!completedSet.has(key) && status !== "completed");
    });

    if (firstPendingQuestion) {
      setSelectedTopicId(firstPendingQuestion.topic.id);
      setSelectedQuestionNo(firstPendingQuestion.question.questionNo);
    }
  };

  useEffect(() => {
    const candidateData = localStorage.getItem("candidate");
    if (candidateData) {
      const parsedCandidate = JSON.parse(candidateData) as Candidate;
      setCandidate(parsedCandidate);
      void loadPracticeQuestionProgress(parsedCandidate.id);
    } else {
      router.push("/login");
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId) ?? topics[0];
  const selectedQuestion = selectedTopic?.questions.find((question) => question.questionNo === selectedQuestionNo) ?? selectedTopic?.questions[0];
  const selectedQuestionKey = selectedTopic && selectedQuestion
    ? `${selectedTopic.id}-${selectedQuestion.questionNo}`
    : "";
  const completed = selectedQuestionKey ? completedQuestionKeys.has(selectedQuestionKey) : false;

  const getTopicStatus = (topic: PracticeTopic) => {
    const keys = topic.questions.map((question) => `${topic.id}-${question.questionNo}`);
    const completedCount = keys.filter((key) => completedQuestionKeys.has(key)).length;
    const inProgress = keys.some((key) => visitedQuestionKeys.has(key) && !completedQuestionKeys.has(key));

    if (completedCount === keys.length && keys.length > 0) {
      return "completed";
    }

    if (inProgress) {
      return "in_progress";
    }

    return "not_started";
  };

  const isQuestionCompleted = (questionKey: string) => completedQuestionKeys.has(questionKey);

  useEffect(() => {
    if (selectedQuestionKey) {
      setVisitedQuestionKeys((keys) => new Set(keys).add(selectedQuestionKey));
      if (!isQuestionCompleted(selectedQuestionKey)) {
        void persistPracticeQuestionProgress(selectedQuestionKey, "in_progress");
      }
    }
  }, [selectedQuestionKey, completedQuestionKeys]);

  function getNextIncompleteQuestion(topic: PracticeTopic, currentQuestionNo: number, questionKeys: Set<string>) {
    const currentIndex = topic.questions.findIndex((question) => question.questionNo === currentQuestionNo);
    for (let index = currentIndex + 1; index < topic.questions.length; index += 1) {
      const question = topic.questions[index];
      if (!questionKeys.has(`${topic.id}-${question.questionNo}`)) {
        return question;
      }
    }
    return null;
  }

  function getFirstIncompleteQuestion(topic: PracticeTopic, questionKeys: Set<string>) {
    const question = topic.questions.find((item) => !questionKeys.has(`${topic.id}-${item.questionNo}`));
    return question ?? topic.questions[0];
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">Loading...</div>;
  }

  if (!candidate || !selectedTopic || !selectedQuestion) {
    return null;
  }

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const topicQuestionCount = selectedTopic.questions.length;

  function selectTopic(topic: PracticeTopic) {
    setSelectedTopicId(topic.id);
    const nextQuestionNo =
      topic.questions.find((question) => !completedQuestionKeys.has(`${topic.id}-${question.questionNo}`))?.questionNo ??
      topic.questions[0]?.questionNo ??
      1;
    setSelectedQuestionNo(nextQuestionNo);
    setShowBriefing(false);
    if (candidate?.id) {
      const key = `${topic.id}-${nextQuestionNo}`;
      if (!isQuestionCompleted(key)) {
        void persistPracticeQuestionProgress(key, "in_progress");
      }
    }
  }

  function selectQuestion(questionNo: number) {
    setSelectedQuestionNo(questionNo);
    setShowBriefing(false);
    if (candidate?.id && selectedTopic) {
      const key = `${selectedTopic.id}-${questionNo}`;
      if (!isQuestionCompleted(key)) {
        void persistPracticeQuestionProgress(key, "in_progress");
      }
    }
  }

  function toggleComplete() {
    if (!selectedQuestionKey) {
      return;
    }

    const nextKeys = new Set(completedQuestionKeys);
    const wasCompleted = nextKeys.has(selectedQuestionKey);

    if (wasCompleted) {
      nextKeys.delete(selectedQuestionKey);
      void persistPracticeQuestionProgress(selectedQuestionKey, "not_started");
      setCompletedQuestionKeys(nextKeys);
      return;
    }

    nextKeys.add(selectedQuestionKey);
    void persistPracticeQuestionProgress(selectedQuestionKey, "completed");
    setCompletedQuestionKeys(nextKeys);

    const nextQuestion = getNextIncompleteQuestion(selectedTopic, selectedQuestionNo, nextKeys);
    if (nextQuestion) {
      setSelectedQuestionNo(nextQuestion.questionNo);
      setShowBriefing(false);
      return;
    }

    const currentTopicIndex = topics.findIndex((topic) => topic.id === selectedTopic.id);
    const nextTopic = topics[currentTopicIndex + 1];
    if (nextTopic) {
      setSelectedTopicId(nextTopic.id);
      setSelectedQuestionNo(getFirstIncompleteQuestion(nextTopic, nextKeys).questionNo);
      setShowBriefing(false);
      return;
    }
  }

  return (
    <>
      <Header screenName="Round 1 Practice Questions" />
      <main className="min-h-screen bg-gray-50 p-6 md:p-8 lg:h-[calc(100vh-5rem)] lg:overflow-hidden">
        <div className="mx-auto max-w-7xl lg:flex lg:h-full lg:min-h-0 lg:flex-col">
          <Link href="/dashboard/candidate/round1" className="inline-flex w-fit items-center rounded-full border border-gray-300 bg-white px-5 py-2.5 font-semibold text-gray-800 shadow-sm hover:bg-gray-100">
            Back to Round 1 Learning
          </Link>

          <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-blue-950">
            <div className="flex flex-wrap justify-between gap-3">
              <span><strong>{completedQuestionKeys.size}</strong> / {questions.length} questions completed ({Math.round((completedQuestionKeys.size / questions.length) * 100)}%)</span>
              <span>Total time: {minutes}m {seconds}s</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${(completedQuestionKeys.size / questions.length) * 100}%` }} />
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <aside className="rounded-xl border border-gray-900 bg-white p-6 lg:min-h-0 lg:overflow-y-auto">
              <h1 className="text-2xl font-bold text-gray-950">Practice Library</h1>
              <p className="mt-1 text-gray-600">{questions.length} debugging questions</p>
              <div className="mt-6 border-t border-gray-200 pt-5 space-y-6">
                {categories.map((category) => (
                  <section key={category.key}>
                    <button className="flex w-full items-center justify-between text-left text-lg font-bold text-gray-900" onClick={() => category.topics[0] && selectTopic(category.topics[0])}>
                      <span>{category.title} <small className="ml-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">{category.topics.reduce((count, topic) => count + topic.questions.length, 0)}</small></span>
                      <span aria-hidden="true">⌄</span>
                    </button>
                    <div className="mt-3 space-y-2">
                      {category.topics.map((topic) => {
                        const topicStatus = getTopicStatus(topic);
                        const isCompleted = topicStatus === "completed";
                        const isInProgress = topicStatus === "in_progress";

                        return (
                          <button
                            key={topic.id}
                            onClick={() => selectTopic(topic)}
                            className={`w-full rounded-lg px-4 py-3 text-left transition ${selectedTopic.id === topic.id ? "border border-green-400 bg-green-100 text-green-800" : "text-gray-800 hover:bg-gray-100"}`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-medium">{topic.title}</span>
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">{topic.questions.length}</span>
                                {isCompleted && (
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700" title="Completed">
                                    ✓
                                  </span>
                                )}
                                {!isCompleted && isInProgress && (
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700" title="In progress">
                                    ⟳
                                  </span>
                                )}
                              </div>
                            </div>
                            {selectedTopic.id === topic.id && (
                              <span className="mt-2 block text-xs uppercase text-green-700">
                                {completed ? "Completed" : "In progress"}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </aside>

            <article className="rounded-xl border border-gray-900 bg-white p-6 md:p-10 lg:min-h-0 lg:overflow-y-auto">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.18em]">
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-slate-700">Question {selectedQuestion.questionNo} of {topicQuestionCount}</span>
                  <span className="rounded-full bg-amber-100 px-4 py-2 text-amber-800">{selectedQuestion.difficulty}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-right text-sm text-gray-700">Time spent<br /><strong className="text-xl text-gray-950">{minutes}m {seconds}s</strong></span>
                  <button onClick={toggleComplete} className={`rounded-lg px-5 py-3 font-bold text-white ${completed ? "bg-green-600" : "bg-green-500 hover:bg-green-600"}`}>
                    {completed ? "Completed" : "Mark Complete"}
                  </button>
                </div>
              </div>

              <h2 className="mt-6 text-4xl font-bold text-gray-950">{selectedTopic.title}</h2>
              <h3 className="mt-3 border-b border-gray-300 pb-7 text-2xl font-bold text-gray-800">{selectedQuestion.title}</h3>

              <section className="mt-7 rounded-xl border border-gray-200 bg-gray-50 p-6">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-xl font-bold text-gray-900">Questions in this topic</h4>
                  <span className="font-semibold text-gray-600">{topicQuestionCount} total</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {selectedTopic.questions.map((question) => (
                    <button key={question.questionNo} onClick={() => selectQuestion(question.questionNo)} className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 font-semibold ${completedQuestionKeys.has(`${selectedTopic.id}-${question.questionNo}`) ? "border-green-600 bg-green-600 text-white" : visitedQuestionKeys.has(`${selectedTopic.id}-${question.questionNo}`) ? "border-orange-400 bg-orange-100 text-orange-800 hover:bg-orange-200" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>
                      {question.questionNo}
                    </button>
                  ))}
                </div>
              </section>

              <button onClick={() => setShowBriefing((value) => !value)} className="mt-6 flex w-full items-center gap-3 rounded-xl border border-gray-200 px-6 py-5 text-left text-xl font-bold text-gray-900 hover:bg-gray-50">
                <span>{showBriefing ? "▾" : "▸"}</span> Topic briefing & learning goals
              </button>
              {showBriefing && <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-6 text-gray-800"><p>{selectedTopic.summary}</p><ul className="mt-4 list-disc space-y-1 pl-5">{selectedTopic.learningGoals.map((goal) => <li key={goal}>{goal}</li>)}</ul></div>}

              <section className="mt-7 rounded-xl border border-blue-200 bg-blue-50 p-6">
                <h4 className="text-2xl font-bold text-blue-950">Your task</h4>
                <p className="mt-4 text-xl text-gray-800">{selectedQuestion.task}</p>
              </section>

              <section className="mt-8">
                <h4 className="text-2xl font-bold text-gray-900">Code to debug</h4>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-gray-950 p-6 text-sm leading-6 text-gray-100"><code>{selectedQuestion.buggyCode}</code></pre>
              </section>

              <details key={`answer-${selectedQuestionKey}`} className="mt-8 rounded-xl border border-green-200 bg-green-50 p-6">
                <summary className="cursor-pointer text-2xl font-bold text-green-950">View answer and explanation</summary>
                <div className="mt-4">
                  <h4 className="text-lg font-bold text-green-950">Answer</h4>
                  <pre className="mt-2 whitespace-pre-wrap font-sans text-lg leading-8 text-gray-800">{selectedQuestion.answer}</pre>
                  <h4 className="mt-5 text-lg font-bold text-green-950">Explanation</h4>
                  <p className="mt-2 leading-7 text-gray-700">{selectedQuestion.explanation}</p>
                </div>
              </details>

              <details key={`correction-${selectedQuestionKey}`} className="mt-8 rounded-xl border border-orange-200 bg-orange-50 p-6">
                <summary className="cursor-pointer text-2xl font-bold text-orange-950">View correct Analysis</summary>
                <p className="mt-4 whitespace-pre-wrap rounded-xl border border-orange-200 bg-white p-5 font-mono text-sm leading-6 text-gray-800">{selectedQuestion.correctedCode}</p>
              </details>

              <section className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6">
                <h4 className="text-2xl font-bold text-gray-900">Follow-up questions</h4>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">{selectedQuestion.followUpQuestions.map((question) => <li key={question}>{question}</li>)}</ul>
              </section>
            </article>
          </div>
        </div>
      </main>
    </>
  );
}
