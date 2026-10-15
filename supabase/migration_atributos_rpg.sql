-- Migration: 5 Pilares de Evolução (Atributos RPG) e Distribuição de Pontos
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard/project/swqhvomhgnzjwznablnm/sql)

-- 1. Novas colunas na tabela gamificacao_perfil
ALTER TABLE public.gamificacao_perfil
ADD COLUMN IF NOT EXISTS atributo_str INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS atributo_int INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS atributo_spr INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS atributo_cha INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS atributo_per INTEGER NOT NULL DEFAULT 0;

-- 2. Nova coluna na tabela crm_tarefas
ALTER TABLE public.crm_tarefas
ADD COLUMN IF NOT EXISTS atributo_alvo VARCHAR(10) NULL;

-- 3. Restrição de validação para os 5 atributos RPG válidos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_crm_tarefas_atributo_alvo'
    ) THEN
        ALTER TABLE public.crm_tarefas
        ADD CONSTRAINT chk_crm_tarefas_atributo_alvo
        CHECK (atributo_alvo IS NULL OR atributo_alvo IN ('STR', 'INT', 'SPR', 'CHA', 'PER'));
    END IF;
END $$;
