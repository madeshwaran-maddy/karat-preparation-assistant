import { NextResponse, NextRequest } from "next/server";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { dynamodb } from "../../../../../lib/dynamodb";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateId(): string {
  return crypto.randomUUID();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, password } = body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const queryCommand = new QueryCommand({
      TableName: "candidates",
      IndexName: "email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": { S: email },
      },
    });

    const existingUser = await dynamodb.send(queryCommand);

    if (existingUser.Items && existingUser.Items.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Create new candidate
    const candidateId = generateId();
    const now = new Date().toISOString();
    const passwordHash = hashPassword(password);

    const putCommand = new PutCommand({
      TableName: "candidates",
      Item: {
        id: candidateId,
        name: fullName,
        email: email,
        phone: "",
        status: "active",
        role: "candidate",
        lead_name: "",
        created_at: now,
        updated_at: now,
        password_hash: passwordHash,
        start_date: "",
        karat_prep_timeline: "",
        karat_assessment_date: "",
        language_selected: "",
        mock_enabled: false,
      },
    });

    await dynamodb.send(putCommand);

    return NextResponse.json(
      {
        message: "Account created successfully",
        id: candidateId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
