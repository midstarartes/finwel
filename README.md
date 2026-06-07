# FinWel — Controle Financeiro Pessoal

App web para controle de pagamentos mensais. Dashboard moderno com banco de dados online e acesso de qualquer dispositivo.

## Funcionalidades

- Dashboard mensal com cards de resumo (total, pago, aberto, atrasado)
- Navegação entre meses
- Contas recorrentes geradas automaticamente todo mês
- Contas parceladas com parcelas distribuídas nos meses corretos
- Status automático: Aberto → Atrasado (quando vence) → Pago (ao marcar)
- Modal de pagamento com confirmação e data editável
- Desfazer pagamento
- Responsáveis cadastráveis
- Exportação em CSV e JSON
- Login protegido via Supabase Auth

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Supabase (banco + autenticação)
- Vercel (deploy)

---

## Configuração local

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute `supabase/schema.sql` no SQL Editor do Supabase
3. Em **Authentication → Users**, crie seu usuário (Add user → Create new user)

### 3. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha com os dados de **Settings → API** do seu projeto Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Rodar

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## Deploy na Vercel

1. Faça push para o GitHub
2. Importe o repositório em [vercel.com/new](https://vercel.com/new)
3. Adicione as variáveis de ambiente
4. Deploy

### Variáveis na Vercel

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role |
| `NEXT_PUBLIC_APP_URL` | URL do app na Vercel |

---

## WhatsApp (módulo futuro)

Para avisos 1 dia antes do vencimento no número `34998311569`, será necessário:
- Twilio ou Z-API/WPPConnect
- Vercel Cron Jobs (plano Pro) ou serviço externo

## Exportação

- CSV: ícone de download no dashboard
- JSON: `/api/export?format=json`
