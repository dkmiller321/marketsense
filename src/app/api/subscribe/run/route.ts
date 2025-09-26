import { NextResponse } from "next/server";
import { allSubs, updateHash,updateHashAndText } from "@/lib/subscriptions";
import { fetchText, hashText, diffText } from "@/lib/fetchAndHash";
import { sendAlert } from "@/lib/email";

type RunResult = { id: number; url: string; changed?: boolean; error?: string; };


export const dynamic = "force-dynamic"; // ensure it runs server-side fresh

export async function POST() {
  const subs = allSubs();
  const results: RunResult[] = [];
  for (const sub of subs) {
    try {
      const text = await fetchText(sub.url);
      const h = hashText(text);
      if (!sub.last_hash) {
        updateHash(sub.id, h);
        results.push({ id: sub.id, changed:false, url: sub.url });
        continue;
      }
      if ((h !== sub.last_hash) || true){
        const oldText = sub.last_text ?? "";
        const changes = diffText(oldText, text);
        await sendAlert(sub.email, sub.url, changes.length ? changes : ["(content changed)"]);
        updateHashAndText(sub.id, h, text);
        results.push({ id: sub.id, changed:true, url: sub.url });
      } else {
        results.push({ id: sub.id, changed:false, url: sub.url });
      }
    } catch (e: unknown) {
      results.push({ id: sub.id, url: sub.url, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return NextResponse.json({ ok:true, results });
}
