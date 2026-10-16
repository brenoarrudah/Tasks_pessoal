-- Migration: Etapa 10 - Economia Virtual (Gold) e O Mercado de Recompensas
-- Adiciona a coluna gold_atual na tabela gamificacao_perfil
-- Cria a tabela loja_recompensas com RLS estrito

-- 1. Adicionar gold_atual na gamificacao_perfil
ALTER TABLE public.gamificacao_perfil
  ADD COLUMN IF NOT EXISTS gold_atual INTEGER NOT NULL DEFAULT 0;

-- 2. Criar tabela loja_recompensas
CREATE TABLE IF NOT EXISTS public.loja_recompensas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    custo_gold INTEGER NOT NULL DEFAULT 10,
    icone VARCHAR(50) DEFAULT 'gift',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Ativar RLS e criar política de isolamento por usuário
ALTER TABLE public.loja_recompensas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own rewards" ON public.loja_recompensas;
CREATE POLICY "Users can manage their own rewards"
    ON public.loja_recompensas
    FOR ALL
    USING (auth.uid() = id_usuario)
    WITH CHECK (auth.uid() = id_usuario);
