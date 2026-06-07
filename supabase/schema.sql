-- FinWel Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- RESPONSÁVEIS
-- =============================================
CREATE TABLE IF NOT EXISTS responsaveis (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CONTAS RECORRENTES (template mensal)
-- =============================================
CREATE TABLE IF NOT EXISTS contas_recorrentes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  descricao VARCHAR(200) NOT NULL,
  responsavel_id UUID REFERENCES responsaveis(id) ON DELETE SET NULL,
  valor DECIMAL(10,2) NOT NULL,
  dia_vencimento INTEGER NOT NULL CHECK (dia_vencimento BETWEEN 1 AND 31),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CONTAS PARCELADAS (grupo de parcelas)
-- =============================================
CREATE TABLE IF NOT EXISTS contas_parceladas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  descricao VARCHAR(200) NOT NULL,
  responsavel_id UUID REFERENCES responsaveis(id) ON DELETE SET NULL,
  valor_parcela DECIMAL(10,2) NOT NULL,
  total_parcelas INTEGER NOT NULL,
  primeira_vencimento DATE NOT NULL,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CONTAS MENSAIS (instâncias reais por mês)
-- =============================================
CREATE TABLE IF NOT EXISTS contas_mensais (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  descricao VARCHAR(200) NOT NULL,
  responsavel_id UUID REFERENCES responsaveis(id) ON DELETE SET NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'aberto' CHECK (status IN ('aberto', 'pago', 'atrasado')),
  data_pagamento DATE,
  -- Referência de origem (recorrente ou parcelada)
  conta_recorrente_id UUID REFERENCES contas_recorrentes(id) ON DELETE SET NULL,
  conta_parcelada_id UUID REFERENCES contas_parceladas(id) ON DELETE SET NULL,
  numero_parcela INTEGER,
  total_parcelas INTEGER,
  -- Mês de competência
  mes_competencia INTEGER NOT NULL CHECK (mes_competencia BETWEEN 1 AND 12),
  ano_competencia INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE responsaveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_recorrentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_parceladas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_mensais ENABLE ROW LEVEL SECURITY;

-- Responsáveis
CREATE POLICY "Users can manage their own responsaveis" ON responsaveis
  FOR ALL USING (auth.uid() = user_id);

-- Contas Recorrentes
CREATE POLICY "Users can manage their own contas_recorrentes" ON contas_recorrentes
  FOR ALL USING (auth.uid() = user_id);

-- Contas Parceladas
CREATE POLICY "Users can manage their own contas_parceladas" ON contas_parceladas
  FOR ALL USING (auth.uid() = user_id);

-- Contas Mensais
CREATE POLICY "Users can manage their own contas_mensais" ON contas_mensais
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_contas_mensais_mes ON contas_mensais(user_id, ano_competencia, mes_competencia);
CREATE INDEX idx_contas_mensais_status ON contas_mensais(status);
CREATE INDEX idx_contas_mensais_vencimento ON contas_mensais(data_vencimento);
CREATE INDEX idx_contas_recorrentes_ativo ON contas_recorrentes(user_id, ativo);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_responsaveis_updated_at BEFORE UPDATE ON responsaveis FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_contas_recorrentes_updated_at BEFORE UPDATE ON contas_recorrentes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_contas_parceladas_updated_at BEFORE UPDATE ON contas_parceladas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_contas_mensais_updated_at BEFORE UPDATE ON contas_mensais FOR EACH ROW EXECUTE FUNCTION update_updated_at();
