import { NextRequest, NextResponse } from "next/server";

const JUDGE0_URL = "https://extra-ce.judge0.com/submissions?base64_encoded=true&wait=false";

function decodeBase64(value?: string) {
  if (!value) return "";
  return Buffer.from(value, "base64").toString("utf8");
}

async function getSubmissionResult(token: string) {
  const resultResponse = await fetch(
    `https://extra-ce.judge0.com/submissions/${token}?base64_encoded=true&fields=*`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return resultResponse.json();
}

export async function POST(request: NextRequest) {
  try {
    const { sourceCode, languageId = 5 } = await request.json();

    const payload = {
      source_code: Buffer.from(String(sourceCode ?? "")).toString("base64"),
      language_id: Number(languageId),
      stdin: "",
      cpu_time_limit: 2,
      memory_limit: 512000,
      wait: false,
    };

    const response = await fetch(JUDGE0_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      return NextResponse.json(
        {
          error: data?.error || data?.message || "Submission failed",
          details: data,
        },
        { status: response.status || 500 }
      );
    }

    let result = null;
    let attempts = 0;
    const maxAttempts = 12;

    while (attempts < maxAttempts) {
      result = await getSubmissionResult(data.token);
      const statusId = result?.status?.id;

      if (statusId === 3 || statusId === 4 || statusId === 5 || statusId === 6 || statusId === 7 || statusId === 8 || statusId === 9 || statusId === 10 || statusId === 11 || statusId === 12 || statusId === 13 || statusId === 14) {
        break;
      }

      attempts += 1;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const finalResult = result || {};

    return NextResponse.json({
      status: finalResult?.status?.description || "Unknown",
      stdout: decodeBase64(finalResult?.stdout),
      stderr: decodeBase64(finalResult?.stderr),
      compile_output: decodeBase64(finalResult?.compile_output),
      message: decodeBase64(finalResult?.message),
      time: finalResult?.time,
      memory: finalResult?.memory,
      raw: finalResult,
    });
  } catch (error) {
    console.error("Judge0 error:", error);
    return NextResponse.json(
      {
        error: "Failed to run Java code using Judge0.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
