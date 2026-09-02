import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getQuestionManagerScreen } from "@/lib/question-manager";

function getScreen(request: NextRequest) {
  return getQuestionManagerScreen(request.nextUrl.searchParams.get("screen") || "");
}

function isSafeFileName(fileName: string) {
  return fileName === path.basename(fileName) && !fileName.includes("\\");
}

export async function GET(request: NextRequest) {
  const screen = getScreen(request);
  const fileName = request.nextUrl.searchParams.get("file");

  if (!screen) {
    return NextResponse.json({ error: "Invalid screen" }, { status: 400 });
  }

  if (fileName) {
    if (!isSafeFileName(fileName)) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), screen.dataPath, fileName);

    try {
      const file = await fs.readFile(filePath);
      return new NextResponse(file, {
        headers: {
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Content-Type": "application/octet-stream",
        },
      });
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  }

  try {
    const fileNames = await fs.readdir(path.join(process.cwd(), screen.dataPath));
    const files = await Promise.all(
      fileNames.map(async (name) => {
        const stats = await fs.stat(path.join(process.cwd(), screen.dataPath, name));
        return {
          name,
          size: stats.size,
          updatedAt: stats.mtime.toISOString(),
        };
      }),
    );

    return NextResponse.json({ screen: screen.id, files });
  } catch (error) {
    console.error("Question manager file listing error:", error);
    return NextResponse.json({ error: "Unable to list screen files" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const screen = getScreen(request);

  if (!screen) {
    return NextResponse.json({ error: "Invalid screen" }, { status: 400 });
  }

  const formData = await request.formData();
  const fileName = formData.get("fileName");
  const file = formData.get("file");

  if (typeof fileName !== "string" || !isSafeFileName(fileName) || !(file instanceof File)) {
    return NextResponse.json({ error: "A valid target file and upload are required" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), screen.dataPath, fileName);

  try {
    await fs.access(filePath);
    await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ message: `${fileName} replaced successfully` });
  } catch (error) {
    console.error("Question manager upload error:", error);
    return NextResponse.json({ error: "Unable to replace the selected file" }, { status: 500 });
  }
}
