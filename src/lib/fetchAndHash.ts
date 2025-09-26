import { chromium } from "playwright";
import * as crypto from "crypto";
import * as cheerio from "cheerio";

export async function fetchText(url:string): Promise<string> {
  const browser = await chromium.launch();
  const page = await browser.newPage({ ignoreHTTPSErrors: true });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  // Give client-rendered pricing a second chance
  await page.waitForTimeout(1500);
  const html = await page.content();
  await browser.close();

  const $ = cheerio.load(html);
  // Strip script/style/nav/footer noise
  ["script","style","noscript","svg"].forEach(sel => $(sel).remove());
  const main = $("main").length ? $("main").text() : $("body").text();
  const text = main.replace(/\s+/g, " ").trim();
  return text;
}

export function hashText(text:string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

// naive line diff (good enough today)
export function diffText(oldT:string, newT:string): string[] {
  const oldL = oldT.split(/\s{2,}|\n/);
  const newL = newT.split(/\s{2,}|\n/);
  const changes: string[] = [];
  // Quick heuristic: show lines containing $ or % or "plan"
  const focus = (s:string)=>/\$|\%|plan|pricing|month|year|annual|pro|starter/i.test(s);
  const setOld = new Set(oldL.filter(focus));
  const setNew = new Set(newL.filter(focus));
  for (const l of setNew) if (!setOld.has(l)) changes.push(`+ ${l}`);
  for (const l of setOld) if (!setNew.has(l)) changes.push(`- ${l}`);
  return changes.slice(0, 12); // cap for email
}
