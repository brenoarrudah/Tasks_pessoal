-- ============================================================================
-- Auditoria e Blindagem RLS (Row Level Security)
-- Tabelas: crm_tarefas, gamificacao_perfil, metas_macro
-- Execute no SQL Editor do Supabase. O script é idempotente (pode rodar várias vezes).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. VERIFICAÇÃO (somente leitura) — rode este bloco primeiro, se quiser auditar
-- ---------------------------------------------------------------------------
-- 1a. RLS ativado? (rowsecurity deve ser TRUE nas 3 tabelas)
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('crm_tarefas', 'gamificacao_perfil', 'metas_macro');

-- 1b. Políticas existentes (cmd = SELECT/INSERT/UPDATE/DELETE)
SELECT tablename, policyname, cmd, roles, qual AS using_expr, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('crm_tarefas', 'gamificacao_perfil', 'metas_macro')
ORDER BY tablename, cmd;

-- ---------------------------------------------------------------------------
-- 2. ATIVAR RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.crm_tarefas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamificacao_perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas_macro        ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 3. POLÍTICAS: acesso estrito onde id_usuario (ou id, no perfil) = auth.uid()
-- ---------------------------------------------------------------------------

-- ===== crm_tarefas (coluna id_usuario) =====
DROP POLICY IF EXISTS "crm_tarefas_select_policy" ON public.crm_tarefas;
DROP POLICY IF EXISTS "crm_tarefas_insert_policy" ON public.crm_tarefas;
DROP POLICY IF EXISTS "crm_tarefas_update_policy" ON public.crm_tarefas;
DROP POLICY IF EXISTS "crm_tarefas_delete_policy" ON public.crm_tarefas;

CREATE POLICY "crm_tarefas_select_policy" ON public.crm_tarefas
    FOR SELECT TO authenticated USING (auth.uid() = id_usuario);
CREATE POLICY "crm_tarefas_insert_policy" ON public.crm_tarefas
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id_usuario);
CREATE POLICY "crm_tarefas_update_policy" ON public.crm_tarefas
    FOR UPDATE TO authenticated USING (auth.uid() = id_usuario) WITH CHECK (auth.uid() = id_usuario);
CREATE POLICY "crm_tarefas_delete_policy" ON public.crm_tarefas
    FOR DELETE TO authenticated USING (auth.uid() = id_usuario);

-- ===== metas_macro (coluna id_usuario) =====
DROP POLICY IF EXISTS "metas_macro_select_policy" ON public.metas_macro;
DROP POLICY IF EXISTS "metas_macro_insert_policy" ON public.metas_macro;
DROP POLICY IF EXISTS "metas_macro_update_policy" ON public.metas_macro;
DROP POLICY IF EXISTS "metas_macro_delete_policy" ON public.metas_macro;

CREATE POLICY "metas_macro_select_policy" ON public.metas_macro
    FOR SELECT TO authenticated USING (auth.uid() = id_usuario);
CREATE POLICY "metas_macro_insert_policy" ON public.metas_macro
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id_usuario);
CREATE POLICY "metas_macro_update_policy" ON public.metas_macro
    FOR UPDATE TO authenticated USING (auth.uid() = id_usuario) WITH CHECK (auth.uid() = id_usuario);
CREATE POLICY "metas_macro_delete_policy" ON public.metas_macro
    FOR DELETE TO authenticated USING (auth.uid() = id_usuario);

-- ===== gamificacao_perfil (a chave `id` referencia auth.users — é o "dono") =====
DROP POLICY IF EXISTS "gamificacao_perfil_select_policy" ON public.gamificacao_perfil;
DROP POLICY IF EXISTS "gamificacao_perfil_insert_policy" ON public.gamificacao_perfil;
DROP POLICY IF EXISTS "gamificacao_perfil_update_policy" ON public.gamificacao_perfil;
DROP POLICY IF EXISTS "gamificacao_perfil_delete_policy" ON public.gamificacao_perfil;

CREATE POLICY "gamificacao_perfil_select_policy" ON public.gamificacao_perfil
    FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "gamificacao_perfil_insert_policy" ON public.gamificacao_perfil
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "gamificacao_perfil_update_policy" ON public.gamificacao_perfil
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "gamificacao_perfil_delete_policy" ON public.gamificacao_perfil
    FOR DELETE TO authenticated USING (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- 4. REVOGAR acesso anônimo às tabelas (defesa em profundidade)
-- ---------------------------------------------------------------------------
REVOKE ALL ON public.crm_tarefas        FROM anon;
REVOKE ALL ON public.gamificacao_perfil FROM anon;
REVOKE ALL ON public.metas_macro        FROM anon;

-- ---------------------------------------------------------------------------
-- 5. RE-VERIFICAÇÃO: deve listar 4 políticas (SELECT/INSERT/UPDATE/DELETE) por tabela
-- ---------------------------------------------------------------------------
SELECT tablename, count(*) AS politicas
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('crm_tarefas', 'gamificacao_perfil', 'metas_macro')
GROUP BY tablename;
