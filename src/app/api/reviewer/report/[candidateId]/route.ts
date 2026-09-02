import { NextRequest, NextResponse } from "next/server";
import { GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb } from "../../../../../../lib/dynamodb";

const normalize = (value: unknown) => (value === undefined || value === null ? "" : String(value));

const roundLabel = (round: unknown) => {
  const value = Number(round ?? 0);
  if (value === 1) return "Round 1";
  if (value === 2) return "Round 2";
  if (value === 3) return "Practice Mock";
  if (value === 4) return "Mock";
  return `Round ${value || "-"}`;
};

const formatAttemptDate = (value: unknown) => {
  const raw = normalize(value);
  if (!raw) return "-";

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> },
) {
  try {
    const { candidateId } = await params;

    const candidateResult = await dynamodb.send(
      new GetCommand({
        TableName: "candidates",
        Key: { id: candidateId },
      }),
    );

    const candidate = candidateResult.Item;

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    const assessmentsResult = await dynamodb.send(
      new ScanCommand({
        TableName: "assessments",
      }),
    );

    const attempts = (assessmentsResult.Items || [])
      .filter((item) => normalize(item.candidate_id) === candidateId)
      .map((item) => ({
        id: normalize(item.id),
        round: Number(item.round ?? item.round_no ?? 0),
        roundLabel: roundLabel(item.round ?? item.round_no ?? 0),
        attemptNo: Number(item.attempt_no ?? 0),
        attemptedDate: formatAttemptDate(item.created_at ?? item.completed_at ?? item.updated_at),
      }))
      .sort((a, b) => a.round - b.round || a.attemptNo - b.attemptNo);

    return NextResponse.json({
      candidate: {
        id: normalize(candidate.id),
        candidateName: normalize(candidate.name),
        startDate: normalize(candidate.start_date),
        karatPrepTimeline: normalize(candidate.karat_prep_timeline),
        leadName: normalize(candidate.lead_name),
      },
      attempts,
    });
  } catch (error) {
    console.error("Failed to load candidate assessment history", error);
    return NextResponse.json(
      { error: "Unable to load candidate assessment history" },
      { status: 500 },
    );
  }
}
