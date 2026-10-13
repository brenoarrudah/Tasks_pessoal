-- Migration: Motor de Ofensiva (Streaks)
-- Execute este script no SQL Editor do Supabase.

-- Âncora temporal: última data em que o utilizador ganhou +1 dia de ofensiva
ALTER TABLE public.gamificacao_perfil
ADD COLUMN IF NOT EXISTS ultima_ofensiva_data DATE;
