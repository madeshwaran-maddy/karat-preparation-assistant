import { NextRequest, NextResponse } from "next/server";
import { PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb } from "../../../../lib/dynamodb";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidate_id, round, interviewer_name } = body;

    if (!candidate_id || round === undefined || round === null) {
      return NextResponse.json(
        { error: "candidate_id and round are required" },
        { status: 400 }
      );
    }

    const result = await dynamodb.send(
      new QueryCommand({
        TableName: "assessments",
        IndexName: "candidate_id-index",
        KeyConditionExpression: "candidate_id = :candidate_id",
        ExpressionAttributeValues: {
          ":candidate_id": candidate_id,
        },
      })
    );

    const roundAssessments = (result.Items ?? []).filter(
      (item) => Number(item?.round ?? 0) === Number(round)
    );

    const attemptNo =
      roundAssessments.reduce((max, item) => {
        const itemAttempt = Number(item?.attempt_no ?? 0);
        return Number.isFinite(itemAttempt) && itemAttempt > max ? itemAttempt : max;
      }, 0) ?? 0;

    const now = new Date().toISOString();
    const assessment = {
      id: crypto.randomUUID(),
      candidate_id,
      attempt_no: attemptNo + 1,
      round: Number(round),
      status: "in-progress",
      created_at: now,
      completed_at: null,
      updated_at: now,
      interviewer_name: typeof interviewer_name === "string" ? interviewer_name.trim() : "",
    };

    await dynamodb.send(
      new PutCommand({
        TableName: "assessments",
        Item: assessment,
      })
    );

    return NextResponse.json({ assessment }, { status: 201 });
  } catch (error) {
    console.error("Assessment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create assessment" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { assessment_id, status } = body;

    if (!assessment_id || !status) {
      return NextResponse.json(
        { error: "assessment_id and status are required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const updateExpression =
      status === "completed"
        ? "SET #status = :status, completed_at = :completed_at, updated_at = :updated_at"
        : "SET #status = :status, updated_at = :updated_at";

    const expressionAttributeValues = {
      ":status": status,
      ":updated_at": now,
      ...(status === "completed" ? { ":completed_at": now } : {}),
    };

    await dynamodb.send(
      new UpdateCommand({
        TableName: "assessments",
        Key: { id: assessment_id },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: expressionAttributeValues,
      })
    );

    return NextResponse.json({ success: true, updated_at: now }, { status: 200 });
  } catch (error) {
    console.error("Assessment update error:", error);
    return NextResponse.json(
      { error: "Failed to update assessment" },
      { status: 500 }
    );
  }
}
