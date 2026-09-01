import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

const PRACTICE_MOCK_EXERCISE_PATH = path.join(
  process.cwd(),
  "src/app/dashboard/candidate/practice-mock/data/exercise-questions.xlsx"
);

const LEGACY_EXERCISE_PATH = path.join(
  process.cwd(),
  "src/app/dashboard/candidate/round2/exercise-questions/data/exercise-questions.xlsx"
);

const CANDIDATE_EXERCISE_PATHS = [PRACTICE_MOCK_EXERCISE_PATH, LEGACY_EXERCISE_PATH];

function normalizeQuestion(row: Record<string, unknown>, index: number) {
  const title =
    String(row["Title"] ?? row["Question Title"] ?? row["Question"] ?? "Question") ||
    `Question ${index + 1}`;

  const prompt = String(
    row["Problem"] ?? row["Question"] ?? row["Prompt"] ?? row["Description"] ?? ""
  );

  const starterCode = String(
    row["Starter Code"] ?? row["Code"] ?? row["StarterCode"] ?? row["Solution"] ?? ""
  );

  const expectedOutput = String(
    row["Expected Output"] ?? row["Expected"] ?? row["Output"] ?? ""
  );

  const difficulty = String(row["Difficulty"] ?? row["Level"] ?? "Medium");

  const customPrompt = String(
    row["Description"] ?? row["Task"] ?? row["Prompt"] ?? prompt
  );

  const id =
    String(row["ID"] ?? row["id"] ?? row["Question ID"] ?? `exercise-${index + 1}`) ||
    `exercise-${index + 1}`;

  return {
    id,
    number: Number(row["Question Number"] ?? row["Number"] ?? index + 1),
    title,
    description: customPrompt,
    difficulty,
    prompt,
    starterCode,
    expectedOutput,
  };
}

export async function GET() {
  try {
    const exerciseFilePath = CANDIDATE_EXERCISE_PATHS.find((filePath) =>
      fs.existsSync(filePath)
    );

    if (!exerciseFilePath) {
      return NextResponse.json(
        { error: "Exercise question file not found" },
        { status: 404 }
      );
    }

    const workbook = XLSX.read(fs.readFileSync(exerciseFilePath), {
      type: "buffer",
    });

    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];

    if (!sheet) {
      return NextResponse.json([], { status: 200 });
    }

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
      raw: false,
    });

    const questions = rows
      .map((row, index) => normalizeQuestion(row, index))
      .filter(
        (question) =>
          question.title || question.prompt || question.description || question.starterCode
      );

    const randomQuestion =
      questions[Math.floor(Math.random() * questions.length)] ?? null;

    return NextResponse.json({
      questions,
      question: randomQuestion,
    });
  } catch (error) {
    console.error("Error reading exercise questions:", error);
    return NextResponse.json(
      { error: "Failed to load exercise questions" },
      { status: 500 }
    );
  }
}
