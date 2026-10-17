-- Migration: Tiers de Recompensas e Requisito de Nível Mínimo
-- Adiciona tier e nivel_minimo na tabela loja_recompensas

ALTER TABLE public.loja_recompensas
  ADD COLUMN IF NOT EXISTS tier VARCHAR(50) NOT NULL DEFAULT 'comum',
  ADD COLUMN IF NOT EXISTS nivel_minimo INTEGER NOT NULL DEFAULT 1;
