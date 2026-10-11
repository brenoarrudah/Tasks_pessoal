-- Migration: Adicionar suporte a recorrência customizada avançada estilo Google Tasks
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard/project/swqhvomhgnzjwznablnm/sql)

ALTER TABLE public.crm_tarefas
ADD COLUMN IF NOT EXISTS recorrente BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS repeticao_intervalo INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS repeticao_tipo VARCHAR(20) DEFAULT 'dia',
ADD COLUMN IF NOT EXISTS repeticao_dias_semana INTEGER[],
ADD COLUMN IF NOT EXISTS termino_tipo VARCHAR(20) DEFAULT 'nunca',
ADD COLUMN IF NOT EXISTS termino_data DATE,
ADD COLUMN IF NOT EXISTS termino_ocorrencias INTEGER,
ADD COLUMN IF NOT EXISTS ocorrencias_realizadas INTEGER NOT NULL DEFAULT 0;

-- Índice para otimização de consultas de tarefas com recorrência ativa
CREATE INDEX IF NOT EXISTS idx_crm_tarefas_recorrente 
ON public.crm_tarefas(recorrente) 
WHERE recorrente = TRUE;
