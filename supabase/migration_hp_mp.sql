-- Migration: Módulo de Sobrevivência (Barras de HP e MP) e Mecânica de Descanso
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard/project/swqhvomhgnzjwznablnm/sql)

ALTER TABLE public.gamificacao_perfil
ADD COLUMN IF NOT EXISTS hp_atual INTEGER NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS hp_maximo INTEGER NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS mp_atual INTEGER NOT NULL DEFAULT 50,
ADD COLUMN IF NOT EXISTS mp_maximo INTEGER NOT NULL DEFAULT 50;
