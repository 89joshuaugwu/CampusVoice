"use client";

import { useEffect, useRef, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Paperclip, X } from "lucide-react";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { uploadAttachments } from "@/lib/cloudinary";
import { Input, Textarea, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { AnonymousToggle } from "./AnonymousToggle";
import { DEFAULT_CATEGORIES } from "@/types/category";

export interface ComplaintFormValues {
  title: string;
  category: string;
  description: string;
  attachments: string[];
  isAnonymous: boolean;
}

interface ComplaintFormProps {
  isLoggedIn: boolean;
  submitting: boolean;
  onSubmit: (values: ComplaintFormValues) => void;
}

export function ComplaintForm({ isLoggedIn, submitting, onSubmit }: ComplaintFormProps) {
  const [categories, setCategories] = useState<string[]>([...DEFAULT_CATEGORIES]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(!isLoggedIn);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getDocs(query(collection(db, "categories"), orderBy("name", "asc")))
      .then((snap) => {
        if (!snap.empty) setCategories(snap.docs.map((d) => d.data().name as string));
      })
      .catch(() => {
        /* fall back to DEFAULT_CATEGORIES already in state */
      });
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (files.length + selected.length > 3) {
      toast.error("Maximum 3 attachments per complaint.");
      return;
    }
    setFiles((prev) => [...prev, ...selected]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (title.trim().length < 5) next.title = "Give it a short, clear title (5+ characters).";
    if (!category) next.category = "Pick a category.";
    if (description.trim().length < 20) next.description = "Add a bit more detail (20+ characters).";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    let attachments: string[] = [];
    if (files.length > 0) {
      setUploading(true);
      try {
        attachments = await uploadAttachments(files);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Attachment upload failed.");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    onSubmit({ title: title.trim(), category, description: description.trim(), attachments, isAnonymous });
  }

  const busy = submitting || uploading;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Title"
        required
        placeholder="e.g. Leaking pipe in Block C hostel bathroom"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
      />

      <Select
        label="Category"
        required
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        error={errors.category}
      >
        <option value="">Select a category</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>

      <Textarea
        label="Description"
        required
        placeholder="Describe what happened, when, and where — the more detail, the faster admin can act."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
        rows={6}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">
          Attachments <span className="font-normal text-[var(--color-text-secondary)]">(optional, up to 3)</span>
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="attachment-input"
        />
        <label
          htmlFor="attachment-input"
          className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
        >
          <Paperclip className="h-4 w-4" />
          Tap to add photo evidence
        </label>
        {files.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-[var(--color-text-primary)]"
              >
                <span className="truncate">{f.name}</span>
                <button type="button" onClick={() => removeFile(i)} aria-label={`Remove ${f.name}`}>
                  <X className="h-4 w-4 text-slate-400 hover:text-[var(--color-error)]" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AnonymousToggle checked={isAnonymous} onChange={setIsAnonymous} />

      <Button type="submit" size="lg" className="w-full" loading={busy}>
        {uploading ? "Uploading attachments…" : busy ? "Submitting…" : "Submit complaint"}
      </Button>
    </form>
  );
}
