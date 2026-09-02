import { NextResponse, NextRequest } from "next/server";
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { dynamodb } from "../../../../../lib/dynamodb";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find candidate by email
    const queryCommand = new QueryCommand({
      TableName: "candidates",
      IndexName: "email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": { S: email },
      },
    });

    const result = await dynamodb.send(queryCommand);

    if (!result.Items || result.Items.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const candidate = result.Items[0];
    const storedPasswordHash = candidate.password_hash?.S || "";
    const providedPasswordHash = hashPassword(password);

    // Verify password
    if (storedPasswordHash !== providedPasswordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Return success with candidate info
    return NextResponse.json({
      message: "Login successful",
      candidate: {
        id: candidate.id?.S,
        name: candidate.name?.S,
        email: candidate.email?.S,
        role: candidate.role?.S,
        mock_enabled: candidate.mock_enabled?.BOOL ?? false,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to login" },
      { status: 500 }
    );
  }
}
