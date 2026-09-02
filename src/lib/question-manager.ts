export const questionManagerScreens = [
  {
    id: "round1-concepts",
    label: "Round 1 - Concepts",
    dataPath: "src/app/dashboard/candidate/round1/concepts/data",
  },
  {
    id: "round1-practice-questions",
    label: "Round 1 - Practice Questions",
    dataPath: "src/app/dashboard/candidate/round1/practice-questions/data",
  },
  {
    id: "round1-debugging-drill",
    label: "Round 1 - Debugging Drill",
    dataPath: "src/app/dashboard/candidate/round1/debugging-drill/data",
  },
  {
    id: "round2-format-practice-questions",
    label: "Round 2 - Format Practice Questions",
    dataPath: "src/app/dashboard/candidate/round2/format-practice-questions/data",
  },
  {
    id: "round2-exercise-questions",
    label: "Round 2 - Exercise Questions",
    dataPath: "src/app/dashboard/candidate/round2/exercise-questions/data",
  },
  {
    id: "practice-mock-assessment",
    label: "Practice Mock Assessment",
    dataPath: "src/app/dashboard/candidate/practice-mock/data",
  },
  {
    id: "mock-assessment",
    label: "Mock Assessment",
    dataPath: "src/app/dashboard/candidate/mock-assessment/data",
  },
] as const;

export type QuestionManagerScreenId = (typeof questionManagerScreens)[number]["id"];

export function getQuestionManagerScreen(screenId: string) {
  return questionManagerScreens.find((screen) => screen.id === screenId);
}
