import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(
      process.cwd(),
      "src/app/dashboard/candidate/round2/format-practice-questions/data/format.json"
    );

    const fileData = fs.readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(fileData);

    return NextResponse.json(jsonData);
  } catch (error) {
    console.error("Error reading format file:", error);
    return NextResponse.json(
      { error: "Failed to read format data" },
      { status: 500 }
    );
  }
}
