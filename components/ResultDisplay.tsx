"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ResultDisplayProps {
  content: string;
  /** true enquanto o texto ainda está chegando via streaming. */
  streaming?: boolean;
}

export default function ResultDisplay({ content, streaming = false }: ResultDisplayProps) {
  return (
    <div
      className={[
        "prose prose-invert max-w-none font-mono text-sm leading-relaxed",
        "prose-headings:font-sans prose-headings:text-amber-300",
        "prose-strong:text-amber-200 prose-a:text-amber-400",
        "prose-hr:border-zinc-800 prose-li:marker:text-amber-500/70",
        "prose-p:text-zinc-300 prose-li:text-zinc-300",
        streaming ? "streaming-caret" : "",
      ].join(" ")}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
