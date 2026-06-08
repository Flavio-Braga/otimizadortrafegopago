# Otimizador de Tráfego Pago

Ferramenta web que transforma o **histórico de otimizações** de uma conta de tráfego pago e o **relatório de desempenho dos últimos 7 dias** em dois outputs estruturados, gerados pela API da Anthropic:

- **Nota de Otimização** — análise descritiva no estilo das notas históricas do gestor.
- **Recomendação** — dividida em "Ação imediata" e "Fique de olho".

O resultado aparece em **streaming** (texto chegando progressivamente) e pode ser **baixado como `.md`**.

A aplicação é **stateless**: nenhum dado é armazenado em servidor ou banco.

---

## Stack

- [Next.js](https://nextjs.org/) 15 (App Router) + TypeScript
- Tailwind CSS + `@tailwindcss/typography`
- [`@anthropic-ai/sdk`](https://www.npmjs.com/package/@anthropic-ai/sdk) (modelo `claude-sonnet-4-20250514`)
- `react-markdown` + `remark-gfm` para renderizar o resultado
- Deploy na [Vercel](https://vercel.com/)

---

## Como rodar localmente

### 1. Pré-requisitos

- Node.js 18.18+ (recomendado 20+)
- Uma chave da API da Anthropic — gere em <https://console.anthropic.com/>

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar a variável de ambiente

Copie o arquivo de exemplo e preencha com a sua chave:

```bash
cp .env.local.example .env.local
```

No Windows (PowerShell):

```powershell
Copy-Item .env.local.example .env.local
```

Edite o `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

> O arquivo `.env.local` está no `.gitignore` e **nunca** deve ser commitado.

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Abra <http://localhost:3000>.

---

## Como usar

1. Envie o **Histórico de Otimizações** (arquivo `.md`).
2. Envie o **Relatório de Desempenho** (arquivo `.csv` — últimos 7 dias vs. 7 dias anteriores).
3. Clique em **Analisar**. O resultado aparece em streaming.
4. Clique em **Baixar .md** para salvar a Nota + Recomendação.

---

## Deploy na Vercel

1. Faça o push do projeto para o repositório do GitHub.
2. Importe o repositório na Vercel (ou rode `npx vercel --prod`).
3. Em **Settings → Environment Variables**, adicione:

   | Nome | Valor |
   | --- | --- |
   | `ANTHROPIC_API_KEY` | sua chave da Anthropic |

4. Faça o deploy. A rota `/api/analyze` roda no runtime Node com `maxDuration` de 60s para suportar o streaming.

---

## Estrutura

```
.
├── app/
│   ├── layout.tsx              # Fontes (Sora + JetBrains Mono) e metadata
│   ├── page.tsx                # UI principal: upload, streaming, resultado
│   ├── globals.css             # Tailwind + tema escuro
│   └── api/analyze/route.ts    # API Route que chama a Anthropic (streaming)
├── components/
│   ├── FileUpload.tsx          # Upload dos dois arquivos (.md e .csv)
│   ├── ResultDisplay.tsx       # Renderiza o markdown do resultado
│   └── DownloadButton.tsx      # Baixa o resultado como nota-otimizacao.md
├── lib/
│   └── anthropic.ts            # Cliente Anthropic + SYSTEM_PROMPT
└── .env.local.example          # Exemplo da variável de ambiente
```
