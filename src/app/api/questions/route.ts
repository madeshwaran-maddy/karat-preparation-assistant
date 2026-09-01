import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb } from "../../../../lib/dynamodb";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const excelFilePath = path.join(
      process.cwd(),
      "src/app/dashboard/candidate/round2/format-practice-questions/data/questions.xlsx"
    );

    if (fs.existsSync(excelFilePath)) {
      const fileBuffer = fs.readFileSync(excelFilePath);
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Transform the data to match the expected format
      const questions = jsonData.map((row: any, index: number) => ({
        id: row["ID"] || `question-${index + 1}`,
        number: row["Question Number"] || index + 1,
        title: row["Title"] || row["Question"] || `Question ${index + 1}`,
        description: row["Description"] || "",
        difficulty: row["Difficulty"] || "Medium",
        status: row["Status"] || "Not Started",
        question: row["Question"] || "",
        answer: row["Answer"] || "",
        codeSnippet: row["Code"] || row["CodeSnippet"] || "",
        buggyCode: row["Buggy Code"] || row["BuggyCode"] || "",
        explanation: row["Explanation"] || "",
      }));

      return NextResponse.json(questions);
    }

    return NextResponse.json(
      { error: "No questions file found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error reading questions file:", error);
    return NextResponse.json(
      { error: "Failed to read questions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      assessment_id,
      candidate_id,
      topic,
      difficulty,
      description,
      code,
      subtopic,
      question_no,
    } = body;

    if (!assessment_id || !candidate_id) {
      return NextResponse.json(
        { error: "assessment_id and candidate_id are required" },
        { status: 400 }
      );
    }

    const result = await dynamodb.send(
      new QueryCommand({
        TableName: "questions",
        IndexName: "assessment_id-index",
        KeyConditionExpression: "assessment_id = :assessment_id",
        ExpressionAttributeValues: {
          ":assessment_id": assessment_id,
        },
      })
    );

    const maxQuestionNo = result.Items?.reduce((max, item) => {
      const itemQuestionNo = Number(item?.question_no ?? 0);
      return Number.isFinite(itemQuestionNo) && itemQuestionNo > max ? itemQuestionNo : max;
    }, 0) ?? 0;

    const nextQuestionNo = Math.max(Number(question_no ?? 0), maxQuestionNo + 1);
    const now = new Date().toISOString();
    const question = {
      id: crypto.randomUUID(),
      assessment_id,
      candidate_id,
      question_no: Number(nextQuestionNo),
      topic: topic ?? "",
      difficulty: difficulty ?? "",
      description: description ?? "",
      code: code ?? "",
      created_at: now,
      subtopic: subtopic ?? "",
      updated_at: now,
    };

    await dynamodb.send(
      new PutCommand({
        TableName: "questions",
        Item: question,
      })
    );

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error("Question creation error:", error);
    return NextResponse.json(
      { error: "Failed to create question record" },
      { status: 500 }
    );
  }
}
