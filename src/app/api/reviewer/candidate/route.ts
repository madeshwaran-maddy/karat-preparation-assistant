import { NextRequest, NextResponse } from "next/server";
import {
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamodb } from "../../../../../lib/dynamodb";

const TABLE_NAME = "candidates";

function normalizeStatus(status?: string) {
  const value = status?.trim();
  if (!value) return "Preparation";
  const validStatuses = [
    "Preparation",
    "Completed Assessment",
    "Cleared Assessment",
    "Rejected",
  ];

  return validStatuses.includes(value) ? value : "Preparation";
}

function normalizeBoolean(value: unknown) {
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return value === true;
}

function normalizeCandidate(candidate: Record<string, any>) {
  return {
    id: candidate.id ?? "",
    name: candidate.name ?? "",
    email: candidate.email ?? "",
    phone: candidate.phone ?? "",
    role: candidate.role ?? "candidate",
    lead_name: candidate.lead_name ?? "",
    status: normalizeStatus(candidate.status),
    language_selected: candidate.language_selected ?? "",
    mock_enabled: normalizeBoolean(candidate.mock_enabled),
    start_date: candidate.start_date ?? "",
    karat_assessment_date: candidate.karat_assessment_date ?? "",
    karat_prep_timeline: candidate.karat_prep_timeline ?? "",
    created_at: candidate.created_at ?? "",
    updated_at: candidate.updated_at ?? "",
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim();

    if (!search || search.length < 3) {
      return NextResponse.json({ candidate: null, candidates: [] }, { status: 200 });
    }

    const result = await dynamodb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      }),
    );

    const query = search.toLowerCase();
    const candidates = (result.Items || [])
      .map(normalizeCandidate)
      .filter((candidate) => {
        const name = (candidate.name || "").toLowerCase();
        const email = (candidate.email || "").toLowerCase();
        return name.includes(query) || email.includes(query);
      })
      .slice(0, 10);

    return NextResponse.json({
      candidate: candidates[0] || null,
      candidates,
    });
  } catch (error) {
    console.error("Failed to load candidate", error);
    return NextResponse.json(
      { error: "Failed to fetch candidate details" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const candidateId = body.id;

    if (!candidateId) {
      return NextResponse.json(
        { error: "Candidate id is required to update the record" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const payload = {
      name: body.name ?? "",
      email: body.email ?? "",
      phone: body.phone ?? "",
      lead_name: body.lead_name ?? "",
      status: body.status ?? "active",
      role: body.role ?? "candidate",
      language_selected: body.language_selected ?? "",
      mock_enabled: Boolean(body.mock_enabled),
      start_date: body.start_date ?? "",
      karat_assessment_date: body.karat_assessment_date ?? "",
      karat_prep_timeline: body.karat_prep_timeline ?? "",
      updated_at: now,
    };

    const updateResult = await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: candidateId },
        UpdateExpression:
          "SET #name = :name, #email = :email, #phone = :phone, #lead_name = :lead_name, #status = :status, #role = :role, #language_selected = :language_selected, #mock_enabled = :mock_enabled, #start_date = :start_date, #karat_assessment_date = :karat_assessment_date, #karat_prep_timeline = :karat_prep_timeline, #updated_at = :updated_at",
        ExpressionAttributeNames: {
          "#name": "name",
          "#email": "email",
          "#phone": "phone",
          "#lead_name": "lead_name",
          "#status": "status",
          "#role": "role",
          "#language_selected": "language_selected",
          "#mock_enabled": "mock_enabled",
          "#start_date": "start_date",
          "#karat_assessment_date": "karat_assessment_date",
          "#karat_prep_timeline": "karat_prep_timeline",
          "#updated_at": "updated_at",
        },
        ExpressionAttributeValues: {
          ":name": payload.name,
          ":email": payload.email,
          ":phone": payload.phone,
          ":lead_name": payload.lead_name,
          ":status": payload.status,
          ":role": payload.role,
          ":language_selected": payload.language_selected,
          ":mock_enabled": payload.mock_enabled,
          ":start_date": payload.start_date,
          ":karat_assessment_date": payload.karat_assessment_date,
          ":karat_prep_timeline": payload.karat_prep_timeline,
          ":updated_at": payload.updated_at,
        },
        ReturnValues: "ALL_NEW",
      }),
    );

    return NextResponse.json({
      message: "Candidate information updated successfully",
      candidate: normalizeCandidate(updateResult.Attributes || {}),
    });
  } catch (error) {
    console.error("Failed to update candidate", error);
    return NextResponse.json(
      { error: "Failed to update candidate details" },
      { status: 500 },
    );
  }
}
