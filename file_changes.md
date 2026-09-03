For concepts tab crashing:
File Path : D:\Karat\Karat-preparation-assistant\karat-preparation-assistant\src\app\dashboard\candidate\round1\concepts\page.tsx:

    1. function ContentList({ title, items = [] }: { title?: string; items?: string[] })
    2. 
interface Concept {
  id: string;
  title: string;
  summary: string;
  learningObjectives: string[];
  explanation: string[];
  detailSections: DetailSection[];
  keyConcepts: string[];
  commonMistakes: string[];
  debuggingScenario?: string[];
  whenShouldYouUseIt?: string[];
}

2. Collapsible answer explanation and corerected Analysis

'''
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

    