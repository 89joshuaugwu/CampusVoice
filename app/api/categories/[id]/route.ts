import { NextRequest, NextResponse } from "next/server";
import { updateCategory, deleteCategory } from "@/lib/categories";
import { getAuthedUid } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const uid = await getAuthedUid(req);
    const { name } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }
    await updateCategory(uid, id, name.trim());
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not update category." },
      { status: 403 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const uid = await getAuthedUid(req);
    await deleteCategory(uid, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not delete category." },
      { status: 403 }
    );
  }
}
