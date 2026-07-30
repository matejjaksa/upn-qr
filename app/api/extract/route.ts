import { NextResponse } from "next/server";
import { extractFieldsFromImage, extractFieldsFromPdf } from "../../../lib/extraction/openai";
import type { ExtractionResponse } from "../../../lib/extraction/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload a PDF, JPG or PNG invoice." }, { status: 400 });
    }

    const mimeType = file.type || "application/octet-stream";
    const buffer = Buffer.from(await file.arrayBuffer());
    const notes: string[] = [];

    if (mimeType === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      notes.push("Used OpenAI PDF file input; the API extracts PDF text and page images internally.");
      const fields = await extractFieldsFromPdf(buffer, file.name || "invoice.pdf");
      const response: ExtractionResponse = { fields, source: "pdf-text", notes };
      return NextResponse.json(response);
    }

    if (mimeType === "image/jpeg" || mimeType === "image/png") {
      const fields = await extractFieldsFromImage(buffer, mimeType);
      const response: ExtractionResponse = { fields, source: "image", notes };
      return NextResponse.json(response);
    }

    return NextResponse.json({ error: "Unsupported file type. Upload PDF, JPG or PNG." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invoice extraction failed." },
      { status: 500 }
    );
  }
}
