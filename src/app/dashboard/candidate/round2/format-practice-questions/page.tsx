"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";

interface Question {
  id: string;
  number: number;
  title: string;
  description: string;
  difficulty: string;
  status: string;
  question: string;
  answer: string;
  codeSnippet: string;
  buggyCode?: string;
  explanation: string;
}

interface FormatData {
  title: string;
  description: string;
  details: Array<{ label: string; value: string }>;
  sections: Array<{ title: string; items: Array<{ label: string; value: string }> }>;
}

export default function FormatPracticeQuestionsPage() {
  const [candidate, setCandidate] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formatData, setFormatData] = useState<FormatData | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedTab, setSelectedTab] = useState<"format" | "questions">("format");
  const [questionStatuses, setQuestionStatuses] = useState<Record<string, string>>({});
  const [formatStatus, setFormatStatus] = useState<string>("Not Started");
  const router = useRouter();

  useEffect(() => {
    const candidateData = localStorage.getItem("candidate");
    if (candidateData) {
      setCandidate(JSON.parse(candidateData));
    } else {
      router.push("/login");
    }

    // Load format data
    fetch("/api/format")
      .then((res) => res.json())
      .then((data) => setFormatData(data))
      .catch((err) => console.error("Error loading format:", err));

    // Load questions from Excel
    fetch("/api/questions")
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data);
        // Initialize statuses
        const statuses: Record<string, string> = {};
        data.forEach((q: Question) => {
          statuses[q.id] = q.status;
        });
        setQuestionStatuses(statuses);
        if (data.length > 0) {
          setSelectedQuestion(data[0]);
        }
      })
      .catch((err) => console.error("Error loading questions:", err));

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!candidate) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 border-green-300";
      case "In Progress":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "border-green-500 bg-green-50";
      case "In Progress":
        return "border-yellow-500 bg-yellow-50";
      default:
        return "border-gray-300 bg-white";
    }
  };

  const handleSelectFormat = () => {
    setSelectedTab("format");
    // Set status to "In Progress" if not already completed
    if (formatStatus !== "Completed") {
      setFormatStatus("In Progress");
    }
  };

  const handleMarkFormatComplete = () => {
    setFormatStatus("Completed");
    // Move to first question
    if (questions.length > 0) {
      const firstQuestion = questions[0];
      setSelectedQuestion(firstQuestion);
      setQuestionStatuses((prev) => ({
        ...prev,
        [firstQuestion.id]: "In Progress",
      }));
    }
  };

  const handleSelectQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setSelectedTab("questions");
    // Set status to "In Progress" if not already completed
    if (questionStatuses[question.id] !== "Completed") {
      setQuestionStatuses((prev) => ({
        ...prev,
        [question.id]: "In Progress",
      }));
    }
  };

  const handleMarkAsComplete = () => {
    if (!selectedQuestion) return;

    // Update status to Completed
    setQuestionStatuses((prev) => ({
      ...prev,
      [selectedQuestion.id]: "Completed",
    }));

    // Find and move to next question
    const currentIndex = questions.findIndex((q) => q.id === selectedQuestion.id);
    if (currentIndex < questions.length - 1) {
      const nextQuestion = questions[currentIndex + 1];
      setSelectedQuestion(nextQuestion);
      // Set next question to "In Progress"
      setQuestionStatuses((prev) => ({
        ...prev,
        [nextQuestion.id]: "In Progress",
      }));
    }
  };

  return (
    <>
      <Header screenName="Format and Practice Questions" />
      <div className="flex min-h-screen bg-gray-50">
        {/* Main Content */}
        <div className="flex-1 p-8">
          <Link
            href="/dashboard/candidate/round2"
            className="inline-flex w-fit items-center rounded-full border border-gray-300 bg-white px-5 py-2.5 font-semibold text-gray-800 shadow-sm hover:bg-gray-100 mb-8"
          >
            Back to Round 2 Learning
          </Link>
          <div className="flex flex-col lg:flex-row gap-8 max-w-7xl h-[calc(100vh-180px)]">
            {/* Left Panel - Format & Questions */}
            <div className="w-full lg:w-80 bg-white rounded-lg border border-gray-200 p-6 overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Format & Questions</h3>

              {/* Format Tab */}
              <button
                onClick={handleSelectFormat}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium mb-3 transition ${
                  selectedTab === "format"
                    ? "bg-green-100 text-green-700 border-2 border-green-500"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>Format</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded border ${getStatusColor(formatStatus)}`}>
                    {formatStatus}
                  </span>
                </div>
              </button>

              {/* Questions List */}
              <div className="space-y-2">
                {questions.map((question) => (
                  <button
                    key={question.id}
                    onClick={() => handleSelectQuestion(question)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                      selectedQuestion?.id === question.id
                        ? getStatusBgColor(questionStatuses[question.id] || question.status) +
                          " border-2 border-green-500 text-gray-900"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>Question {question.number}</span>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded border ${getStatusColor(
                          questionStatuses[question.id] || question.status
                        )}`}
                      >
                        {questionStatuses[question.id] || question.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Panel - Content */}
            <div className="flex-1 overflow-y-auto pr-4">
              {selectedTab === "format" ? (
                // Format Content
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {formatData?.title}
                      </h1>
                      <p className="text-gray-600 text-lg">
                        {formatData?.description}
                      </p>
                    </div>
                    {formatStatus !== "Completed" && (
                      <button 
                        onClick={handleMarkFormatComplete}
                        className="bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-2 px-4 rounded-lg transition border border-green-300 whitespace-nowrap"
                      >
                        ✓ Mark as Completed
                      </button>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    {formatData?.details.map((detail, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">{detail.label}</p>
                        <p className="text-lg font-bold text-gray-900">
                          {detail.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Sections */}
                  {formatData?.sections.map((section, idx) => (
                    <div key={idx} className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {section.title}
                      </h2>
                      <div className="space-y-4">
                        {section.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm font-semibold text-gray-700 mb-2">
                              {item.label}
                            </p>
                            <p className="text-gray-600">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Question Content
                selectedQuestion && (
                  <div className="bg-white rounded-lg border border-gray-200 p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                          Question {selectedQuestion.number}
                        </h1>
                        <p className="text-gray-600 text-lg">
                          {selectedQuestion.title}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition">
                          Open Compiler
                        </button>
                        {(questionStatuses[selectedQuestion.id] || selectedQuestion.status) !== "Completed" && (
                          <button 
                            onClick={handleMarkAsComplete}
                            className="bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-2 px-4 rounded-lg transition border border-green-300"
                          >
                            ✓ Mark as Completed
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Question Section */}
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Question
                      </h2>
                      {selectedQuestion.question && (
                        <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto font-mono text-sm mb-6">
                          <pre>{selectedQuestion.question}</pre>
                        </div>
                      )}
                      {(selectedQuestion.buggyCode || selectedQuestion.codeSnippet) && (
                        <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto font-mono text-sm">
                          <pre>{selectedQuestion.buggyCode || selectedQuestion.codeSnippet}</pre>
                        </div>
                      )}
                    </div>

                    {/* Answer Section */}
                    {selectedQuestion.answer && (
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                          Answer
                        </h2>
                        <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto font-mono text-sm">
                          <pre>{selectedQuestion.answer}</pre>
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    {selectedQuestion.explanation && (
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                          Explanation
                        </h2>
                        <p className="text-gray-600">{selectedQuestion.explanation}</p>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
