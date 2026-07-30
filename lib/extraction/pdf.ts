import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function extractNativePdfText(buffer: Buffer): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "upn-pdf-text-"));
  const pdfPath = join(dir, "invoice.pdf");
  try {
    await writeFile(pdfPath, buffer);
    const { stdout } = await execFileAsync("pdftotext", ["-layout", pdfPath, "-"], {
      maxBuffer: 1024 * 1024 * 4
    });
    return stdout;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

export async function renderFirstPdfPage(buffer: Buffer): Promise<{ bytes: Buffer; mimeType: "image/png" }> {
  const dir = await mkdtemp(join(tmpdir(), "upn-pdf-image-"));
  const pdfPath = join(dir, "invoice.pdf");
  const prefix = join(dir, "page");
  const pngPath = `${prefix}.png`;
  try {
    await writeFile(pdfPath, buffer);
    await execFileAsync("pdftoppm", ["-png", "-singlefile", "-r", "220", pdfPath, prefix], {
      maxBuffer: 1024 * 1024 * 4
    });
    return { bytes: await readFile(pngPath), mimeType: "image/png" };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
