-- Migration: Adicionar coluna horario na tabela crm_tarefas para ordenação cronológica
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard/project/swqhvomhgnzjwznablnm/sql)

ALTER TABLE public.crm_tarefas
ADD COLUMN IF NOT EXISTS horario VARCHAR(10);

-- Índice para acelerar ordenação cronológica de tarefas com horário definido
CREATE INDEX IF NOT EXISTS idx_crm_tarefas_horario 
ON public.crm_tarefas(horario) 
WHERE horario IS NOT NULL;
