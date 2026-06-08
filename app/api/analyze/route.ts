import { groq, MODEL, SYSTEM_PROMPT } from "@/lib/groq";

// Roda no runtime Node e permite respostas em streaming mais longas
// no deploy da Vercel.
export const runtime = "nodejs";
export const maxDuration = 60;

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request): Promise<Response> {
  if (!process.env.GROQ_API_KEY) {
    return jsonError(
      "GROQ_API_KEY não configurada no servidor. Defina a variável de ambiente e tente novamente.",
      500,
    );
  }

  let mdContent: string;
  let csvContent: string;

  try {
    const formData = await req.formData();
    const md = formData.get("mdFile");
    const csv = formData.get("csvFile");

    if (typeof md !== "string" || typeof csv !== "string") {
      return jsonError("Envie os dois arquivos (histórico .md e relatório .csv).", 400);
    }

    mdContent = md.trim();
    csvContent = csv.trim();

    if (!mdContent || !csvContent) {
      return jsonError("Os arquivos enviados estão vazios.", 400);
    }
  } catch {
    return jsonError("Não foi possível ler os arquivos enviados.", 400);
  }

  const userMessage = `Aqui estão os dois arquivos para análise:

---
## HISTÓRICO DE OTIMIZAÇÕES (.md)

${mdContent}

---
## RELATÓRIO DE DESEMPENHO (.csv)

${csvContent}

---

Produza a Nota de Otimização e a Recomendação conforme as instruções.`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 4096,
      temperature: 0.6,
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro desconhecido ao chamar a API do Groq.";
    return jsonError(message, 502);
  }
}
