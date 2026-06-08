"use client";

import { useId, useRef, useState } from "react";

interface FileUploadProps {
  /** Recebe o conteúdo de texto e o nome do arquivo .md (ou null ao limpar). */
  onMdContent: (content: string | null, name: string | null) => void;
  /** Recebe o conteúdo de texto e o nome do arquivo .csv (ou null ao limpar). */
  onCsvContent: (content: string | null, name: string | null) => void;
  /** Dispara a análise. Só é chamado quando ambos os arquivos estão prontos. */
  onAnalyze: () => void;
  /** true quando ambos os arquivos estão carregados. */
  canAnalyze: boolean;
  /** true durante a análise (desabilita interações). */
  loading: boolean;
}

interface DropZoneProps {
  label: string;
  hint: string;
  accept: string;
  extension: string;
  fileName: string | null;
  disabled: boolean;
  onFile: (file: File) => void;
  onClear: () => void;
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5 text-amber-400"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-7 w-7 text-zinc-500"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 13.5h6m-6 3h6m-9 3.75h12a1.5 1.5 0 0 0 1.5-1.5V8.121a1.5 1.5 0 0 0-.44-1.06l-3.621-3.622a1.5 1.5 0 0 0-1.06-.439H6a1.5 1.5 0 0 0-1.5 1.5v15a1.5 1.5 0 0 0 1.5 1.5Z"
      />
    </svg>
  );
}

function DropZone({
  label,
  hint,
  accept,
  extension,
  fileName,
  disabled,
  onFile,
  onClear,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputId = useId();
  const loaded = fileName !== null;

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={[
        "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition",
        loaded
          ? "border-solid border-amber-500 bg-amber-500/5"
          : dragOver
            ? "border-amber-400 bg-amber-500/10"
            : "border-zinc-700 bg-zinc-900/40 hover:border-zinc-600",
        disabled ? "pointer-events-none opacity-60" : "",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          // Permite re-selecionar o mesmo arquivo novamente.
          e.target.value = "";
        }}
      />

      <div className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-widest text-amber-400/90">
        <span className="rounded bg-amber-500/10 px-2 py-0.5">{extension}</span>
        {label}
      </div>

      {loaded ? (
        <div className="flex w-full flex-col items-center gap-2">
          <div className="flex max-w-full items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2">
            <CheckIcon />
            <span className="truncate font-mono text-sm text-zinc-200" title={fileName}>
              {fileName}
            </span>
          </div>
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="font-sans text-xs text-zinc-400 underline-offset-2 transition hover:text-zinc-200 hover:underline"
          >
            Trocar arquivo
          </button>
        </div>
      ) : (
        <>
          <DocumentIcon />
          <p className="font-sans text-sm text-zinc-400">{hint}</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-2 font-sans text-sm font-medium text-zinc-200 transition hover:border-amber-500/50 hover:text-amber-300"
          >
            Selecionar arquivo
          </button>
        </>
      )}
    </div>
  );
}

export default function FileUpload({
  onMdContent,
  onCsvContent,
  onAnalyze,
  canAnalyze,
  loading,
}: FileUploadProps) {
  const [mdName, setMdName] = useState<string | null>(null);
  const [csvName, setCsvName] = useState<string | null>(null);
  const [readError, setReadError] = useState<string | null>(null);

  function readFile(
    file: File,
    setName: (n: string | null) => void,
    emit: (content: string | null, name: string | null) => void,
  ) {
    setReadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setName(file.name);
      emit(text, file.name);
    };
    reader.onerror = () => {
      setReadError(`Não foi possível ler o arquivo "${file.name}".`);
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 md:grid-cols-2">
        <DropZone
          label="Histórico de Otimizações"
          hint="Arraste o arquivo aqui ou selecione (.md)"
          accept=".md,text/markdown,text/plain"
          extension=".md"
          fileName={mdName}
          disabled={loading}
          onFile={(file) => readFile(file, setMdName, onMdContent)}
          onClear={() => {
            setMdName(null);
            onMdContent(null, null);
          }}
        />
        <DropZone
          label="Relatório de Desempenho"
          hint="Arraste o arquivo aqui ou selecione (.csv)"
          accept=".csv,text/csv,text/plain"
          extension=".csv"
          fileName={csvName}
          disabled={loading}
          onFile={(file) => readFile(file, setCsvName, onCsvContent)}
          onClear={() => {
            setCsvName(null);
            onCsvContent(null, null);
          }}
        />
      </div>

      {readError && (
        <p className="text-center font-sans text-sm text-red-400">{readError}</p>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!canAnalyze || loading}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-10 py-3.5 font-sans text-base font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 transition enabled:hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900/40 border-t-zinc-900" />
              Analisando...
            </>
          ) : (
            "Analisar"
          )}
        </button>
      </div>
    </div>
  );
}
