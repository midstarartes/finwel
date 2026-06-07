-- Migração: suporte a múltiplos responsáveis por conta
-- Execute no SQL Editor do Supabase

ALTER TABLE contas_mensais
  ADD COLUMN IF NOT EXISTS responsaveis_texto TEXT DEFAULT '';

ALTER TABLE contas_recorrentes
  ADD COLUMN IF NOT EXISTS responsaveis_texto TEXT DEFAULT '';

ALTER TABLE contas_parceladas
  ADD COLUMN IF NOT EXISTS responsaveis_texto TEXT DEFAULT '';
