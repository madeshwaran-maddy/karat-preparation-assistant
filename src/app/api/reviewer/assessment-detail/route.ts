import { NextRequest, NextResponse } from "next/server";
import { QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb } from "../../../../../lib/dynamodb";

const normalize = (value: unknown) => (value === undefined || value === null ? "" : String(value));

const roundLabel = (round: unknown) => {
  const value = Number(round ?? 0);
  if (value === 1) return "Round 1";
  if (value === 2) return "Round 2";
  if (value === 3) return "Practice Mock";
  if (value === 4) return "Mock";
  return `Round ${value || "-"}`;
};

const formatDate = (value: unknown) => {
  const raw = normalize(value);
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get("candidateId");
    const assessmentId = searchParams.get("assessmentId");

    if (!candidateId || !assessmentId) {
      return NextResponse.json({ error: "candidateId and assessmentId are required" }, { status: 400 });
    }

    const candidateResult = await dynamodb.send(
      new GetCommand({
        TableName: "candidates",
        Key: { id: candidateId },
      }),
    );

    const assessmentResult = await dynamodb.send(
      new GetCommand({
        TableName: "assessments",
        Key: { id: assessmentId },
      }),
    );

    if (!candidateResult.Item || !assessmentResult.Item) {
      return NextResponse.json({ error: "Candidate or assessment not found" }, { status: 404 });
    }

    const assessment = assessmentResult.Item;
    const questionsResult = await dynamodb.send(
      new QueryCommand({
        TableName: "questions",
        IndexName: "assessment_id-index",
        KeyConditionExpression: "assessment_id = :assessment_id",
        ExpressionAttributeValues: {
          ":assessment_id": assessmentId,
        },
      }),
    );

    const evaluationsResult = await dynamodb.send(
      new QueryCommand({
        TableName: "evaluations",
        IndexName: "assessment_id-index",
        KeyConditionExpression: "assessment_id = :assessment_id",
        ExpressionAttributeValues: {
          ":assessment_id": assessmentId,
        },
      }),
    );

    const evaluationByQuestionId = new Map(
      (evaluationsResult.Items || []).map((item) => [normalize(item.question_id), { userCode: normalize(item.user_code), userAnalysis: normalize(item.user_analysis) }]),
    );

    const questions = (questionsResult.Items || [])
      .map((item) => {
        const questionId = normalize(item.id);
        const evaluation = evaluationByQuestionId.get(questionId) || { userCode: "", userAnalysis: "" };

        return {
          id: questionId,
          questionNo: Number(item.question_no ?? 0),
          topic: normalize(item.topic),
          subtopic: normalize(item.subtopic),
          description: normalize(item.description || item.title || item.question || "Untitled question"),
          code: normalize(item.code),
          userCode: evaluation.userCode,
          userAnalysis: evaluation.userAnalysis,
        };
      })
      .sort((a, b) => a.questionNo - b.questionNo);

    return NextResponse.json({
      candidate: {
        name: normalize(candidateResult.Item.name),
      },
      assessment: {
        round: Number(assessment.round ?? 0),
        roundLabel: roundLabel(assessment.round ?? 0),
        attemptNo: Number(assessment.attempt_no ?? 0),
        attemptedDate: formatDate(assessment.created_at ?? assessment.completed_at ?? assessment.updated_at),
      },
      questions,
    });
  } catch (error) {
    console.error("Failed to load assessment detail", error);
    return NextResponse.json({ error: "Failed to load assessment detail" }, { status: 500 });
  }
}
