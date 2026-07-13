export async function uploadAttachment(file: File): Promise<string> {
  const signRes = await fetch("/api/cloudinary/sign", { method: "POST" });
  if (!signRes.ok) throw new Error("Could not prepare upload — try again.");
  const { timestamp, folder, signature, apiKey, cloudName } = await signRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => null);
    throw new Error(err?.error?.message ?? "Upload failed — try again.");
  }

  const data = await uploadRes.json();
  return data.secure_url as string;
}

export async function uploadAttachments(files: File[]): Promise<string[]> {
  return Promise.all(files.map(uploadAttachment));
}
