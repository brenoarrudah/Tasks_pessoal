-- Migration: Etapa 12 - Preparação para O Arquiteto (IA Autônoma) e Missões de Emergência
-- Adiciona as colunas gerada_por_ia e penalidade_falha na tabela crm_tarefas

ALTER TABLE public.crm_tarefas
  ADD COLUMN IF NOT EXISTS gerada_por_ia BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS penalidade_falha VARCHAR(255);
