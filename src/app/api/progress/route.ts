import { NextRequest, NextResponse } from "next/server";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb } from "../../../../lib/dynamodb";

const normalizeStatus = (status: string) => {
  const value = (status ?? "").toString().trim();
  if (["not_started", "in_progress", "completed"].includes(value)) {
    return value;
  }

  return "not_started";
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get("candidateId");

    if (!candidateId) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    const result = await dynamodb.send(
      new QueryCommand({
        TableName: "learning_progress",
        KeyConditionExpression: "user_id = :user_id",
        ExpressionAttributeValues: {
          ":user_id": candidateId,
        },
      }),
    );

    const items = (result.Items ?? []).map((item) => ({
      user_id: item.user_id,
      item_key: item.item_key,
      round: Number(item.round ?? 0),
      module: item.module ?? "",
      item_id: item.item_id ?? "",
      status: normalizeStatus(item.status ?? "not_started"),
      updated_at: item.updated_at ?? "",
    }));

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch learning progress", error);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidateId, round, module, itemId, status } = body;

    if (!candidateId || round === undefined || !module || !itemId) {
      return NextResponse.json(
        { error: "candidateId, round, module, and itemId are required" },
        { status: 400 },
      );
    }

    const normalizedStatus = normalizeStatus(status);
    const now = new Date().toISOString();

    await dynamodb.send(
      new PutCommand({
        TableName: "learning_progress",
        Item: {
          user_id: candidateId,
          item_key: `round${Number(round)}#${String(module)}#${String(itemId)}`,
          round: Number(round),
          module: String(module),
          item_id: String(itemId),
          status: normalizedStatus,
          updated_at: now,
        },
      }),
    );

    return NextResponse.json({ success: true, status: normalizedStatus }, { status: 200 });
  } catch (error) {
    console.error("Failed to save learning progress", error);
    return NextResponse.json(
      { error: "Failed to save learning progress" },
      { status: 500 },
    );
  }
}
