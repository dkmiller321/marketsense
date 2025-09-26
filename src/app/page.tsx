"use client";
import { useState } from "react";

export default function Home() {
  const [email,setEmail] = useState(""); 
  const [url,setUrl] = useState(""); 
  const [ok,setOk] = useState<string|null>(null);

  const submit = async (e:any) => {
    e.preventDefault();
    const r = await fetch("/api/subscribe",{ method:"POST", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({ email, url })});
    setOk(r.ok ? "Subscribed! We’ll email you on changes." : "Error — check input.");
  };

  const runNow = async ()=> {
    await fetch("/api/subscribe/run",{ method:"POST" });
    alert("Run triggered (check logs/email)");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full space-y-4">
        <h1 className="text-3xl font-bold">Competitor pricing alerts for SaaS founders</h1>
        <p className="text-gray-600">Enter a pricing page. We’ll email you when it changes. Free while in beta.</p>
        <form onSubmit={submit} className="space-y-3">
          <input className="w-full border rounded p-2" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full border rounded p-2" placeholder="https://competitor.com/pricing" value={url} onChange={e=>setUrl(e.target.value)} />
          <button className="w-full rounded p-2 bg-black text-white">Start monitoring</button>
        </form>
        {ok && <p className="text-sm">{ok}</p>}
        <button onClick={runNow} className="text-sm underline text-gray-500">Run check now (dev)</button>
        <p className="text-xs text-gray-400">By subscribing you agree to receive emails from MarketSense.</p>
      </div>
    </main>
  );
}
