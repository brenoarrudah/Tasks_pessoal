-- Migration: Adicionar coluna repeticao_dias_semana na tabela crm_tarefas
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard/project/swqhvomhgnzjwznablnm/sql)

ALTER TABLE public.crm_tarefas
ADD COLUMN IF NOT EXISTS repeticao_dias_semana INTEGER[];
