import type { Metadata } from "next";
import { CategoryManager } from "@/components/organisms/CategoryManager";

export const metadata: Metadata = {
  title: "Categories",
};

export default function AdminCategoriesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Categories</h1>
      <CategoryManager />
    </div>
  );
}
