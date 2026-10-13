-- Gestor Pessoal de Tarefas - Schema PostgreSQL (Supabase)
-- Etapa 1: Banco de Dados e Documentação Base

-- 1. Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de usuarios
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabela de configuracoes
CREATE TABLE IF NOT EXISTS public.configuracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_negocio TEXT DEFAULT 'Gestor Pessoal de Tarefas',
    fuso_horario TEXT DEFAULT 'America/Sao_Paulo',
    tema TEXT DEFAULT 'light',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Garantir que id_usuario pode ser nulo para a configuração inicial padrão
ALTER TABLE public.configuracoes ALTER COLUMN id_usuario DROP NOT NULL;

-- 4. Tabela de areas_foco
CREATE TABLE IF NOT EXISTS public.areas_foco (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    cor TEXT DEFAULT '#3B82F6',
    icone TEXT DEFAULT 'list',
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tabela de metas_macro (Objetivos de Longo Prazo)
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

-- 6. Tabela de gamificacao_perfil (Níveis, XP, Moedas e Streaks)
CREATE TABLE IF NOT EXISTS public.gamificacao_perfil (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nivel_atual INTEGER NOT NULL DEFAULT 1,
    xp_acumulado INTEGER NOT NULL DEFAULT 0,
    moedas INTEGER NOT NULL DEFAULT 0,
    streak_atual INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Tabela de crm_tarefas
CREATE TABLE IF NOT EXISTS public.crm_tarefas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    id_area UUID REFERENCES public.areas_foco(id) ON DELETE SET NULL,
    id_meta_vinculada UUID REFERENCES public.metas_macro(id) ON DELETE SET NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    prazo TIMESTAMPTZ,
    horario VARCHAR(10),
    prioridade TEXT CHECK (prioridade IN ('alta', 'media', 'baixa')) DEFAULT 'media',
    concluida BOOLEAN NOT NULL DEFAULT FALSE,
    concluida_em TIMESTAMPTZ,
    recorrente BOOLEAN NOT NULL DEFAULT FALSE,
    repeticao_intervalo INTEGER DEFAULT 1,
    repeticao_tipo VARCHAR(20) DEFAULT 'dia',
    repeticao_dias_semana INTEGER[],
    termino_tipo VARCHAR(20) DEFAULT 'nunca',
    termino_data DATE,
    termino_ocorrencias INTEGER,
    ocorrencias_realizadas INTEGER NOT NULL DEFAULT 0,
    recompensa_xp INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Tabela de subtarefas
CREATE TABLE IF NOT EXISTS public.subtarefas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_tarefa UUID NOT NULL REFERENCES public.crm_tarefas(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    concluida BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Tabela de logs_sistema
CREATE TABLE IF NOT EXISTS public.logs_sistema (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    acao TEXT NOT NULL,
    tabela TEXT NOT NULL,
    id_registro UUID,
    dados_anteriores JSONB,
    dados_novos JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de desempenho
CREATE INDEX IF NOT EXISTS idx_configuracoes_id_usuario ON public.configuracoes(id_usuario);
CREATE INDEX IF NOT EXISTS idx_areas_foco_id_usuario ON public.areas_foco(id_usuario);
CREATE INDEX IF NOT EXISTS idx_crm_tarefas_id_usuario ON public.crm_tarefas(id_usuario);
CREATE INDEX IF NOT EXISTS idx_crm_tarefas_id_area ON public.crm_tarefas(id_area);
CREATE INDEX IF NOT EXISTS idx_crm_tarefas_prazo ON public.crm_tarefas(prazo);
CREATE INDEX IF NOT EXISTS idx_crm_tarefas_horario ON public.crm_tarefas(horario);
CREATE INDEX IF NOT EXISTS idx_crm_tarefas_concluida ON public.crm_tarefas(concluida);
CREATE INDEX IF NOT EXISTS idx_crm_tarefas_id_meta ON public.crm_tarefas(id_meta_vinculada);
CREATE INDEX IF NOT EXISTS idx_metas_macro_id_usuario ON public.metas_macro(id_usuario);
CREATE INDEX IF NOT EXISTS idx_subtarefas_id_tarefa ON public.subtarefas(id_tarefa);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_id_usuario ON public.logs_sistema(id_usuario);

-- 8. Função e Triggers fn_atualizar_timestamp
CREATE OR REPLACE FUNCTION public.fn_atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON public.usuarios;
CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION public.fn_atualizar_timestamp();

DROP TRIGGER IF EXISTS trg_configuracoes_updated_at ON public.configuracoes;
CREATE TRIGGER trg_configuracoes_updated_at
    BEFORE UPDATE ON public.configuracoes
    FOR EACH ROW EXECUTE FUNCTION public.fn_atualizar_timestamp();

DROP TRIGGER IF EXISTS trg_areas_foco_updated_at ON public.areas_foco;
CREATE TRIGGER trg_areas_foco_updated_at
    BEFORE UPDATE ON public.areas_foco
    FOR EACH ROW EXECUTE FUNCTION public.fn_atualizar_timestamp();

DROP TRIGGER IF EXISTS trg_crm_tarefas_updated_at ON public.crm_tarefas;
CREATE TRIGGER trg_crm_tarefas_updated_at
    BEFORE UPDATE ON public.crm_tarefas
    FOR EACH ROW EXECUTE FUNCTION public.fn_atualizar_timestamp();

-- 9. Função e Trigger fn_registrar_log
CREATE OR REPLACE FUNCTION public.fn_registrar_log()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id UUID;
    v_registro_id UUID;
    v_dados_ant JSONB := NULL;
    v_dados_nov JSONB := NULL;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_usuario_id := OLD.id_usuario;
        v_registro_id := OLD.id;
        v_dados_ant := to_jsonb(OLD);
    ELSIF (TG_OP = 'UPDATE') THEN
        v_usuario_id := NEW.id_usuario;
        v_registro_id := NEW.id;
        v_dados_ant := to_jsonb(OLD);
        v_dados_nov := to_jsonb(NEW);
    ELSIF (TG_OP = 'INSERT') THEN
        v_usuario_id := NEW.id_usuario;
        v_registro_id := NEW.id;
        v_dados_nov := to_jsonb(NEW);
    END IF;

    IF v_usuario_id IS NULL THEN
        v_usuario_id := auth.uid();
    END IF;

    INSERT INTO public.logs_sistema (
        id_usuario,
        acao,
        tabela,
        id_registro,
        dados_anteriores,
        dados_novos,
        created_at
    ) VALUES (
        v_usuario_id,
        TG_OP,
        TG_TABLE_NAME,
        v_registro_id,
        v_dados_ant,
        v_dados_nov,
        NOW()
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_log_crm_tarefas ON public.crm_tarefas;
CREATE TRIGGER trg_log_crm_tarefas
    AFTER INSERT OR UPDATE OR DELETE ON public.crm_tarefas
    FOR EACH ROW EXECUTE FUNCTION public.fn_registrar_log();

-- 10. Handler para novo usuario registrado no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id, nome, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();

    INSERT INTO public.configuracoes (id_usuario, nome_negocio, fuso_horario, tema)
    VALUES (
        NEW.id,
        'Gestor Pessoal de Tarefas',
        'America/Sao_Paulo',
        'light'
    )
    ON CONFLICT DO NOTHING;

    INSERT INTO public.gamificacao_perfil (id, nivel_atual, xp_acumulado, moedas, streak_atual)
    VALUES (NEW.id, 1, 0, 0, 0)
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Habilitar RLS em todas as tabelas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas_foco ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas_macro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamificacao_perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_sistema ENABLE ROW LEVEL SECURITY;

-- 12. Politicas de RLS (Row Level Security)

-- Politicas para usuarios
DROP POLICY IF EXISTS "usuarios_select_policy" ON public.usuarios;
CREATE POLICY "usuarios_select_policy" ON public.usuarios
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "usuarios_update_policy" ON public.usuarios;
CREATE POLICY "usuarios_update_policy" ON public.usuarios
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "usuarios_insert_policy" ON public.usuarios;
CREATE POLICY "usuarios_insert_policy" ON public.usuarios
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politicas para configuracoes
DROP POLICY IF EXISTS "configuracoes_select_policy" ON public.configuracoes;
CREATE POLICY "configuracoes_select_policy" ON public.configuracoes
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id_usuario OR id_usuario IS NULL);

DROP POLICY IF EXISTS "configuracoes_update_policy" ON public.configuracoes;
CREATE POLICY "configuracoes_update_policy" ON public.configuracoes
    FOR UPDATE USING (auth.uid() = id_usuario);

DROP POLICY IF EXISTS "configuracoes_insert_policy" ON public.configuracoes;
CREATE POLICY "configuracoes_insert_policy" ON public.configuracoes
    FOR INSERT WITH CHECK (auth.uid() = id_usuario OR id_usuario IS NULL);

DROP POLICY IF EXISTS "configuracoes_delete_policy" ON public.configuracoes;
CREATE POLICY "configuracoes_delete_policy" ON public.configuracoes
    FOR DELETE USING (auth.uid() = id_usuario);

-- Politicas para areas_foco
DROP POLICY IF EXISTS "areas_foco_select_policy" ON public.areas_foco;
CREATE POLICY "areas_foco_select_policy" ON public.areas_foco
    FOR SELECT USING (auth.uid() = id_usuario);

DROP POLICY IF EXISTS "areas_foco_insert_policy" ON public.areas_foco;
CREATE POLICY "areas_foco_insert_policy" ON public.areas_foco
    FOR INSERT WITH CHECK (auth.uid() = id_usuario);

DROP POLICY IF EXISTS "areas_foco_update_policy" ON public.areas_foco;
CREATE POLICY "areas_foco_update_policy" ON public.areas_foco
    FOR UPDATE USING (auth.uid() = id_usuario);

DROP POLICY IF EXISTS "areas_foco_delete_policy" ON public.areas_foco;
CREATE POLICY "areas_foco_delete_policy" ON public.areas_foco
    FOR DELETE USING (auth.uid() = id_usuario);

-- Politicas para crm_tarefas
DROP POLICY IF EXISTS "crm_tarefas_select_policy" ON public.crm_tarefas;
CREATE POLICY "crm_tarefas_select_policy" ON public.crm_tarefas
    FOR SELECT USING (auth.uid() = id_usuario);

DROP POLICY IF EXISTS "crm_tarefas_insert_policy" ON public.crm_tarefas;
CREATE POLICY "crm_tarefas_insert_policy" ON public.crm_tarefas
    FOR INSERT WITH CHECK (auth.uid() = id_usuario);

DROP POLICY IF EXISTS "crm_tarefas_update_policy" ON public.crm_tarefas;
CREATE POLICY "crm_tarefas_update_policy" ON public.crm_tarefas
    FOR UPDATE USING (auth.uid() = id_usuario);

DROP POLICY IF EXISTS "crm_tarefas_delete_policy" ON public.crm_tarefas;
CREATE POLICY "crm_tarefas_delete_policy" ON public.crm_tarefas
    FOR DELETE USING (auth.uid() = id_usuario);

-- Politicas para subtarefas
DROP POLICY IF EXISTS "subtarefas_select_policy" ON public.subtarefas;
CREATE POLICY "subtarefas_select_policy" ON public.subtarefas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.crm_tarefas t
            WHERE t.id = subtarefas.id_tarefa AND t.id_usuario = auth.uid()
        )
    );

DROP POLICY IF EXISTS "subtarefas_insert_policy" ON public.subtarefas;
CREATE POLICY "subtarefas_insert_policy" ON public.subtarefas
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.crm_tarefas t
            WHERE t.id = subtarefas.id_tarefa AND t.id_usuario = auth.uid()
        )
    );

DROP POLICY IF EXISTS "subtarefas_update_policy" ON public.subtarefas;
CREATE POLICY "subtarefas_update_policy" ON public.subtarefas
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.crm_tarefas t
            WHERE t.id = subtarefas.id_tarefa AND t.id_usuario = auth.uid()
        )
    );

DROP POLICY IF EXISTS "subtarefas_delete_policy" ON public.subtarefas;
CREATE POLICY "subtarefas_delete_policy" ON public.subtarefas
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.crm_tarefas t
            WHERE t.id = subtarefas.id_tarefa AND t.id_usuario = auth.uid()
        )
    );

-- Politicas para logs_sistema (Apenas leitura para usuário autenticado; gravações exclusivamente via triggers SECURITY DEFINER)
DROP POLICY IF EXISTS "logs_sistema_select_policy" ON public.logs_sistema;
CREATE POLICY "logs_sistema_select_policy" ON public.logs_sistema
    FOR SELECT USING (auth.uid() = id_usuario);
    
-- Politicas para gamificacao_perfil
DROP POLICY IF EXISTS "gamificacao_perfil_select_policy" ON public.gamificacao_perfil;
CREATE POLICY "gamificacao_perfil_select_policy" ON public.gamificacao_perfil
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "gamificacao_perfil_insert_policy" ON public.gamificacao_perfil;
CREATE POLICY "gamificacao_perfil_insert_policy" ON public.gamificacao_perfil
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "gamificacao_perfil_update_policy" ON public.gamificacao_perfil;
CREATE POLICY "gamificacao_perfil_update_policy" ON public.gamificacao_perfil
    FOR UPDATE USING (auth.uid() = id);

-- Politicas para metas_macro
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

-- 13. Seed inicial de configuracao padrao
INSERT INTO public.configuracoes (id_usuario, nome_negocio, fuso_horario, tema)
SELECT NULL, 'Gestor Pessoal de Tarefas', 'America/Sao_Paulo', 'light'
WHERE NOT EXISTS (
    SELECT 1 FROM public.configuracoes WHERE id_usuario IS NULL AND nome_negocio = 'Gestor Pessoal de Tarefas'
);
