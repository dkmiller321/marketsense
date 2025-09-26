import { NextResponse } from "next/server";
import { z } from "zod";
import { addSub } from "@/lib/subscriptions";

const schema = z.object({ email: z.string().email(), url: z.string().url() });

export async function POST(req: Request) {
  const data: unknown = await req.json();
  const parsed = schema.safeParse(data);
  if (!parsed.success) return NextResponse.json({ ok:false, error:"Invalid input" }, { status:400 });
  addSub(parsed.data.email, parsed.data.url);
  return NextResponse.json({ ok:true });
}
