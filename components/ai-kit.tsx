"use client";

import { useState } from "react";
import { Section, Eyebrow } from "./section";
import { cn } from "@/lib/cn";

const SAMPLE_INSTRUCTIONS = `You are editing my website for me. The site lives in a folder called "my-site". Each page is a file. Each section is a piece I can describe in plain English.

When I ask for a change, you should:
1. Find the right file (I'll tell you the page if I know it)
2. Make the smallest change that does what I asked
3. Show me what changed before saving

Don't change colors, fonts, or layout unless I specifically ask. Don't add things I didn't ask for. If you're unsure, ask me one question.

My website's tone is friendly and clear. We don't use emojis or exclamation points unless I do.`;

const SAMPLE_PROMPTS = [
 { label: "Change a headline", prompt: "Change my homepage hero headline to: \"We make small businesses look professional.\"" },
 { label: "Add a testimonial", prompt: "Add a new testimonial section after the features. The quote is: \"Eject saved me $400 a year.\". Sarah, Owner of Bloom Studio." },
 { label: "Update pricing", prompt: "Change my pricing on the homepage from $99 to $129. Make sure to update the pricing page too." },
 { label: "New blog post", prompt: "Write a 600-word blog post titled \"5 things every small business website needs\" in my usual tone. File it under /blog." },
 { label: "Swap a photo", prompt: "Replace the photo on my About page with the new one I just uploaded to /public/team-2026.jpg." },
 { label: "Fix a typo", prompt: "On my contact page, change \"recieve\" to \"receive\"." },
];

export function AiKit() {
 const [activeTab, setActiveTab] = useState<"chatgpt" | "claude" | "cursor">("chatgpt");
 const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
 const [copiedInstructions, setCopiedInstructions] = useState(false);

 function copy(text: string, idx?: number) {
 navigator.clipboard.writeText(text).then(() => {
 if (idx !== undefined) {
 setCopiedIndex(idx);
 setTimeout(() => setCopiedIndex(null), 1200);
 } else {
 setCopiedInstructions(true);
 setTimeout(() => setCopiedInstructions(false), 1200);
 }
 });
 }

 return (
 <Section className="bg-ink text-paper">
 <Eyebrow>The superpower</Eyebrow>
 <h2 className="h-section text-3xl md:text-5xl max-w-3xl mb-4 text-paper">
 Edit your website by chatting.{" "}
 <span className="text-paper/40">Like, just typing what you want.</span>
 </h2>
 <p className="text-paper/70 max-w-2xl mb-10 text-lg">
 Your website is now a folder of files. Any AI can read and edit it. ChatGPT. Claude. Cursor. Free tiers all work. You paste a small instruction file once. After that, you just type things like &ldquo;change my hero to say X&rdquo; and the AI does it. No new tool. No subscription. No designer.
 </p>

 <div className="flex flex-wrap items-center gap-2 mb-6">
 {(["chatgpt", "claude", "cursor"] as const).map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={cn(
 "rounded-full px-4 py-2 text-xs font-mono uppercase tracking-widest transition",
 activeTab === tab ? "bg-signal text-paper" : "bg-paper/[0.06] text-paper/60 hover:text-paper"
 )}
 >
 {tab === "chatgpt" ? "ChatGPT" : tab === "claude" ? "Claude" : "Cursor"}
 </button>
 ))}
 <span className="text-xs text-paper/40 font-mono ml-2">All three work. Pick one.</span>
 </div>

 <div className="grid lg:grid-cols-2 gap-5">
 {/* Instructions card */}
 <div className="rounded-2xl border border-paper/10 bg-paper/[0.04] overflow-hidden">
 <div className="flex items-center justify-between px-5 py-3 border-b border-paper/10">
 <p className="text-xs font-mono uppercase tracking-widest text-paper/60">
 Step 1. Paste this once
 </p>
 <button
 onClick={() => copy(SAMPLE_INSTRUCTIONS)}
 className="text-xs font-mono text-paper/60 hover:text-signal transition"
 >
 {copiedInstructions ? "Copied ✓" : "Copy"}
 </button>
 </div>
 <pre className="p-5 text-sm text-paper/90 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
 {SAMPLE_INSTRUCTIONS}
 </pre>
 </div>

 {/* Prompts card */}
 <div className="rounded-2xl border border-paper/10 bg-paper/[0.04] overflow-hidden">
 <div className="flex items-center justify-between px-5 py-3 border-b border-paper/10">
 <p className="text-xs font-mono uppercase tracking-widest text-paper/60">
 Step 2. Then say things like…
 </p>
 <p className="text-xs text-paper/40 font-mono">100+ in your kit</p>
 </div>
 <ul className="divide-y divide-paper/10">
 {SAMPLE_PROMPTS.map((p, i) => (
 <li key={p.label} className="px-5 py-4 flex items-start justify-between gap-4">
 <div className="min-w-0 flex-1">
 <p className="text-xs font-mono text-paper/40 mb-1">{p.label}</p>
 <p className="text-paper/90 leading-snug">&ldquo;{p.prompt}&rdquo;</p>
 </div>
 <button
 onClick={() => copy(p.prompt, i)}
 className="text-xs font-mono text-paper/40 hover:text-signal transition shrink-0 mt-1"
 >
 {copiedIndex === i ? "✓" : "Copy"}
 </button>
 </li>
 ))}
 </ul>
 </div>
 </div>

 <div className="mt-10 grid md:grid-cols-3 gap-4 text-sm">
 <Bubble title="No tool to learn" body="If you've ever typed in a chat box, you can edit your site." />
 <Bubble title="No subscription" body="Use the free tier of ChatGPT or Claude. We don't charge for the editor. There isn't one to charge for." />
 <Bubble title="It's just your files" body="Your AI is reading and writing the same folder we gave you. Nothing magic. Nothing locked." />
 </div>
 </Section>
 );
}

function Bubble({ title, body }: { title: string; body: string }) {
 return (
 <div className="rounded-xl border border-paper/10 bg-paper/[0.03] p-5">
 <p className="font-medium text-paper mb-1">{title}</p>
 <p className="text-paper/60 leading-relaxed">{body}</p>
 </div>
 );
}
