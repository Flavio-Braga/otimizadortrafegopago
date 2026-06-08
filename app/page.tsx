"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import ResultDisplay from "@/components/ResultDisplay";
import DownloadButton from "@/components/DownloadButton";

export default function Home() {
  const [mdContent, setMdContent] = useState<string | null>(null);
  const [csvContent, setCsvContent] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = Boolean(mdContent && csvContent);

  async function handleAnalyze() {
    if (!mdContent || !csvContent) return;

    setLoading(true);
    setError(null);
    setResult("");

    try {
      const formData = new FormData();
      formData.append("mdFile", mdContent);
      formData.append("csvFile", csvContent);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let message = `Falha na análise (HTTP ${res.status}).`;
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          /* corpo não-JSON: mantém a mensagem padrão */
        }
        throw new Error(message);
      }

      if (!res.body) {
        throw new Error("A resposta do servidor não trouxe conteúdo.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setResult(accumulated);
      }
      accumulated += decoder.decode();
      setResult(accumulated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido ao analisar.");
    } finally {
      setLoading(false);
    }
  }

  const hasResult = result.length > 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-5 py-10 sm:px-8 sm:py-14">
      {/* HEADER */}
      <header className="flex flex-col gap-2 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 font-sans text-lg font-bold text-zinc-950">
            ↗
          </span>
          <h1 className="font-sans text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl">
            Otimizador de Tráfego Pago
          </h1>
        </div>
        <p className="font-sans text-sm text-zinc-500">
          Transforme o histórico da conta e o relatório dos últimos 7 dias em uma Nota de
          Otimização e uma Recomendação prontas para o gestor.
        </p>
      </header>

      {/* UPLOAD ZONE */}
      <section>
        <FileUpload
          onMdContent={(content) => setMdContent(content)}
          onCsvContent={(content) => setCsvContent(content)}
          onAnalyze={handleAnalyze}
          canAnalyze={canAnalyze}
          loading={loading}
        />
      </section>

      {/* ERRO */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 font-sans text-sm text-red-300"
        >
          <span className="font-semibold">Erro:</span> {error}
        </div>
      )}

      {/* RESULTADO */}
      {(loading || hasResult) && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-sm font-semibold uppercase tracking-widest text-zinc-400">
              Resultado
            </h2>
            {hasResult && !loading && <DownloadButton content={result} />}
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-7">
            {hasResult ? (
              <ResultDisplay content={result} streaming={loading} />
            ) : (
              <div className="flex items-center gap-3 font-mono text-sm text-zinc-400">
                <span className="h-3 w-3 animate-pulse rounded-full bg-amber-500" />
                Analisando a conta...
              </div>
            )}
          </div>

          {hasResult && !loading && (
            <div className="flex justify-end sm:hidden">
              <DownloadButton content={result} />
            </div>
          )}
        </section>
      )}

      <footer className="mt-auto border-t border-zinc-800 pt-6 text-center font-sans text-xs text-zinc-600">
        Ferramenta stateless — nenhum dado é armazenado. Processado via API da Anthropic.
      </footer>
    </main>
  );
}
