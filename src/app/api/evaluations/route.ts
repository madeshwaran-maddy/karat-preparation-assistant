import { NextRequest, NextResponse } from "next/server";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb } from "../../../../lib/dynamodb";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assessment_id, candidate_id, question_id, user_code, user_analysis } = body;

    if (!assessment_id || !candidate_id || !question_id) {
      return NextResponse.json(
        { error: "assessment_id, candidate_id, and question_id are required" },
        { status: 400 }
      );
    }

    const evaluation = {
      id: crypto.randomUUID(),
      assessment_id,
      candidate_id,
      question_id,
      user_code: user_code ?? "",
      user_analysis: user_analysis ?? "",
      submitted_at: new Date().toISOString(),
    };

    await dynamodb.send(
      new PutCommand({
        TableName: "evaluations",
        Item: evaluation,
      })
    );

    return NextResponse.json({ evaluation }, { status: 201 });
  } catch (error) {
    console.error("Evaluation creation error:", error);
    return NextResponse.json(
      { error: "Failed to create evaluation" },
      { status: 500 }
    );
  }
}
