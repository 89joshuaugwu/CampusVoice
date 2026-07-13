import { NextRequest, NextResponse } from "next/server";
import { listCategories, createCategory } from "@/lib/categories";
import { getAuthedUid } from "@/lib/api-auth";

export async function GET() {
  try {
    const categories = await listCategories();
    return NextResponse.json(categories);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not load categories." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const uid = await getAuthedUid(req);
    const { name } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }
    const category = await createCategory(uid, name.trim());
    return NextResponse.json(category);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not create category." },
      { status: 403 }
    );
  }
}
