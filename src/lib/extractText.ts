// Client-side text extraction for uploaded documents. Files never leave the browser.

export const ACCEPTED_DOCS = ".txt,.md,.docx,.pdf";
const MAX_DOC_BYTES = 10 * 1024 * 1024;

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.size > MAX_DOC_BYTES) throw new Error("File is too large (max 10 MB).");
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) {
    return file.text();
  }

  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return value;
  }

  if (name.endsWith(".pdf")) {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()));
    const { text } = await extractText(pdf, { mergePages: true });
    if (!text.trim()) throw new Error("No selectable text found in this PDF (it may be a scanned image).");
    // PDFs break lines at the page width; re-join lines that don't end a sentence.
    return text.replace(/\r\n?/g, "\n").replace(/([^.!?:;\n])[ \t]*\n(?!\n)[ \t]*/g, "$1 ");
  }

  throw new Error("Unsupported file. Use .txt, .md, .docx or .pdf.");
}

/** Tidies extracted text: normalizes line breaks and removes hyphenated line wraps from PDFs. */
export function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/(\p{L})-\n(\p{Ll})/gu, "$1$2")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
