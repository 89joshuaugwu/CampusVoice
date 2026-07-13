"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, Spinner, Modal } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { authedJson } from "@/lib/api-client";
import type { Category } from "@/types/category";

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => toast.error("Could not load categories."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await authedJson("/api/categories", { method: "POST", body: JSON.stringify({ name: newName.trim() }) });
      setNewName("");
      toast.success("Category added.");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add category.");
    } finally {
      setAdding(false);
    }
  }

  async function handleSaveEdit() {
    if (!editTarget || !editName.trim()) return;
    setSavingEdit(true);
    try {
      await authedJson(`/api/categories/${editTarget.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: editName.trim() }),
      });
      toast.success("Category updated.");
      setEditTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update category.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await authedJson(`/api/categories/${deleteTarget.id}`, { method: "DELETE" });
      toast.success("Category deleted.");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete category.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="p-4 sm:p-5">
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category name"
            className="flex-1"
          />
          <Button type="submit" loading={adding}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </form>
      </Card>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((c) => (
            <Card key={c.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">{c.name}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {c.complaintCount} complaint{c.complaintCount === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditTarget(c);
                    setEditName(c.name);
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-[var(--color-primary)]"
                  aria-label={`Edit ${c.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(c)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-[var(--color-error)]"
                  aria-label={`Delete ${c.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit category">
        <div className="space-y-4">
          <Input value={editName} onChange={(e) => setEditName(e.target.value)} label="Name" />
          <Button className="w-full" loading={savingEdit} onClick={handleSaveEdit}>
            Save changes
          </Button>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete category">
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Delete <strong>{deleteTarget?.name}</strong>? This can&apos;t be undone.
            {deleteTarget && deleteTarget.complaintCount > 0 && (
              <span className="mt-2 block text-[var(--color-error)]">
                Blocked: {deleteTarget.complaintCount} complaint(s) still reference this category.
              </span>
            )}
          </p>
          <Button
            variant="danger"
            className="w-full"
            loading={deleting}
            disabled={!!deleteTarget && deleteTarget.complaintCount > 0}
            onClick={handleDelete}
          >
            Delete category
          </Button>
        </div>
      </Modal>
    </div>
  );
}
