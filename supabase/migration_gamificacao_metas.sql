-- Migration: Arquitetura de Dados para Gamificação e Metas Macro
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard/project/swqhvomhgnzjwznablnm/sql)

-- 1. Nova Tabela: gamificacao_perfil
CREATE TABLE IF NOT EXISTS public.gamificacao_perfil (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nivel_atual INTEGER NOT NULL DEFAULT 1,
    xp_acumulado INTEGER NOT NULL DEFAULT 0,
    moedas INTEGER NOT NULL DEFAULT 0,
    streak_atual INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS na tabela gamificacao_perfil
ALTER TABLE public.gamificacao_perfil ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para gamificacao_perfil
DROP POLICY IF EXISTS "gamificacao_perfil_select_policy" ON public.gamificacao_perfil;
CREATE POLICY "gamificacao_perfil_select_policy" ON public.gamificacao_perfil
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "gamificacao_perfil_insert_policy" ON public.gamificacao_perfil;
CREATE POLICY "gamificacao_perfil_insert_policy" ON public.gamificacao_perfil
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "gamificacao_perfil_update_policy" ON public.gamificacao_perfil;
CREATE POLICY "gamificacao_perfil_update_policy" ON public.gamificacao_perfil
    FOR UPDATE USING (auth.uid() = id);

-- Trigger de atualização de timestamp
DROP TRIGGER IF EXISTS trg_gamificacao_perfil_updated_at ON public.gamificacao_perfil;
CREATE TRIGGER trg_gamificacao_perfil_updated_at
    BEFORE UPDATE ON public.gamificacao_perfil
    FOR EACH ROW EXECUTE FUNCTION public.fn_atualizar_timestamp();

-- 2. Nova Tabela: metas_macro
CREATE TABLE IF NOT EXISTS public.metas_macro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    progresso_atual INTEGER NOT NULL DEFAULT 0,
    progresso_alvo INTEGER NOT NULL DEFAULT 100,
    status TEXT NOT NULL DEFAULT 'em_andamento',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS na tabela metas_macro
ALTER TABLE public.metas_macro ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para metas_macro
DROP POLICY IF EXISTS "metas_macro_select_policy" ON public.metas_macro;
CREATE POLICY "metas_macro_select_policy" ON public.metas_macro
    FOR SELECT USING (auth.uid() = id_usuario);

DROP POLICY IF EXISTS "metas_macro_insert_policy" ON public.metas_macro;
CREATE POLICY "metas_macro_insert_policy" ON public.metas_macro
    FOR INSERT WITH CHECK (auth.uid() = id_usuario);

DROP POLICY IF EXISTS "metas_macro_update_policy" ON public.metas_macro;
CREATE POLICY "metas_macro_update_policy" ON public.metas_macro
    FOR UPDATE USING (auth.uid() = id_usuario);

DROP POLICY IF EXISTS "metas_macro_delete_policy" ON public.metas_macro;
CREATE POLICY "metas_macro_delete_policy" ON public.metas_macro
    FOR DELETE USING (auth.uid() = id_usuario);

-- Índices para metas_macro
CREATE INDEX IF NOT EXISTS idx_metas_macro_usuario ON public.metas_macro(id_usuario);
CREATE INDEX IF NOT EXISTS idx_metas_macro_status ON public.metas_macro(status);

-- Trigger de atualização de timestamp
DROP TRIGGER IF EXISTS trg_metas_macro_updated_at ON public.metas_macro;
CREATE TRIGGER trg_metas_macro_updated_at
    BEFORE UPDATE ON public.metas_macro
    FOR EACH ROW EXECUTE FUNCTION public.fn_atualizar_timestamp();

-- 3. Alteração na tabela crm_tarefas
ALTER TABLE public.crm_tarefas
ADD COLUMN IF NOT EXISTS id_meta_vinculada UUID REFERENCES public.metas_macro(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS recompensa_xp INTEGER NOT NULL DEFAULT 10;

-- Índice para tarefas vinculadas a metas
CREATE INDEX IF NOT EXISTS idx_crm_tarefas_meta 
ON public.crm_tarefas(id_meta_vinculada) 
WHERE id_meta_vinculada IS NOT NULL;

-- 4. Inicializar perfil de gamificação para usuários existentes
INSERT INTO public.gamificacao_perfil (id, nivel_atual, xp_acumulado, moedas, streak_atual)
SELECT id, 1, 0, 0, 0 FROM auth.users
ON CONFLICT (id) DO NOTHING;
