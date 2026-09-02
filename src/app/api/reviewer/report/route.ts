import { NextRequest, NextResponse } from "next/server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb } from "../../../../../lib/dynamodb";

const normalize = (value: unknown) => (value === undefined || value === null ? "" : String(value));

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim();

    const candidatesResponse = await dynamodb.send(
      new ScanCommand({
        TableName: "candidates",
      }),
    );

    const assessmentsResponse = await dynamodb.send(
      new ScanCommand({
        TableName: "assessments",
      }),
    );

    const candidateRows = (candidatesResponse.Items || [])
      .filter((item) => {
        if (!search) return true;

        const values = [
          normalize(item.id),
          normalize(item.name),
          normalize(item.email),
          normalize(item.phone),
          normalize(item.role),
          normalize(item.lead_name),
          normalize(item.status),
          normalize(item.language_selected),
          normalize(item.mock_enabled),
          normalize(item.start_date),
          normalize(item.karat_assessment_date),
          normalize(item.karat_prep_timeline),
        ];

        const query = search.toLowerCase();
        return values.some((value) => value.toLowerCase().includes(query));
      })
      .map((candidate) => {
        const assessments = (assessmentsResponse.Items || []).filter(
          (assessment) => normalize(assessment.candidate_id) === normalize(candidate.id),
        );

        const round1Count = assessments.filter((item) => toNumber(item.round) === 1).length;
        const round2Count = assessments.filter((item) => toNumber(item.round) === 2).length;
        const round3Count = assessments.filter((item) => toNumber(item.round) === 3).length;
        const round4Count = assessments.filter((item) => toNumber(item.round) === 4).length;

        return {
          id: normalize(candidate.id),
          candidateName: normalize(candidate.name),
          language: normalize(candidate.language_selected),
          startDate: normalize(candidate.start_date),
          karatPrepTimeline: normalize(candidate.karat_prep_timeline),
          leadName: normalize(candidate.lead_name),
          totalR1Attempt: round1Count,
          totalR2Attempt: round2Count,
          totalPracticeMock: round3Count,
          totalMock: round4Count,
          learningProgress: "-",
          assessmentReport: "-",
        };
      });

    return NextResponse.json({ candidates: candidateRows });
  } catch (error) {
    console.error("Failed to fetch candidate report", error);
    return NextResponse.json(
      { error: "Unable to fetch candidate report" },
      { status: 500 },
    );
  }
}
