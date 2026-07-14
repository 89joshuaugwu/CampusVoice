export type AttachmentKind = "image" | "pdf" | "other";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "avif", "heic"];

export function getAttachmentKind(url: string): AttachmentKind {
  const clean = url.split("?")[0]?.toLowerCase() ?? "";
  const ext = clean.split(".").pop() ?? "";
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  return "other";
}

export function getAttachmentLabel(url: string, index: number): string {
  const kind = getAttachmentKind(url);
  if (kind === "image") return `Photo ${index + 1}`;
  if (kind === "pdf") return `Document ${index + 1}`;
  return `Attachment ${index + 1}`;
}
