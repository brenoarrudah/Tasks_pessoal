-- Migration: Etapa 11 - Sistema de Títulos, Habilidades e Conquistas Permanentes
-- Criação das tabelas conquistas_titulos e perfil_titulos_desbloqueados
-- Adição de titulo_equipado_id em gamificacao_perfil
-- Ativação de RLS e seed de títulos base

-- 1. Tabela de catálogo de títulos e conquistas
CREATE TABLE IF NOT EXISTS public.conquistas_titulos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT NOT NULL,
    icone VARCHAR(50) DEFAULT 'award',
    condicao_tipo VARCHAR(50) NOT NULL, -- 'nivel', 'streak', 'gold'
    condicao_valor INTEGER NOT NULL,
    condicao_desbloqueio VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabela de títulos desbloqueados pelo usuário
CREATE TABLE IF NOT EXISTS public.perfil_titulos_desbloqueados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    id_titulo UUID NOT NULL REFERENCES public.conquistas_titulos(id) ON DELETE CASCADE,
    data_desbloqueio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_usuario_titulo UNIQUE (id_usuario, id_titulo)
);

-- 3. Adicionar coluna de título equipado no perfil de gamificação
ALTER TABLE public.gamificacao_perfil
  ADD COLUMN IF NOT EXISTS titulo_equipado_id UUID REFERENCES public.conquistas_titulos(id) ON DELETE SET NULL;

-- 4. Habilitar RLS
ALTER TABLE public.conquistas_titulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfil_titulos_desbloqueados ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
DROP POLICY IF EXISTS "conquistas_titulos_read_policy" ON public.conquistas_titulos;
CREATE POLICY "conquistas_titulos_read_policy"
  ON public.conquistas_titulos
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "perfil_titulos_desbloqueados_all_policy" ON public.perfil_titulos_desbloqueados;
CREATE POLICY "perfil_titulos_desbloqueados_all_policy"
  ON public.perfil_titulos_desbloqueados
  FOR ALL
  USING (auth.uid() = id_usuario)
  WITH CHECK (auth.uid() = id_usuario);

-- 5. Seed de títulos base recomendados
INSERT INTO public.conquistas_titulos (titulo, descricao, icone, condicao_tipo, condicao_valor, condicao_desbloqueio)
VALUES
  ('Primeiro Passo', 'Deu início à grande jornada de evolução diária.', 'footprints', 'nivel', 2, 'Atingir Nível 2'),
  ('Iniciante Resiliente', 'Provou sua constância nos desafios fundamentais.', 'shield', 'nivel', 5, 'Atingir Nível 5'),
  ('Guerreiro Veterano', 'Demonstrou poder avançado e domínio de rotinas.', 'swords', 'nivel', 10, 'Atingir Nível 10'),
  ('Foco de Aço', 'Manteve a chama acesa por uma semana completa ininterrupta.', 'flame', 'streak', 7, 'Atingir 7 dias de Ofensiva'),
  ('Hábito Inabalável', 'Duas semanas de consistência implacável.', 'crown', 'streak', 14, 'Atingir 14 dias de Ofensiva'),
  ('Mestre da Riqueza', 'Acumulou uma respeitável fortuna em moedas de ouro.', 'coins', 'gold', 500, 'Acumular 500 Gold'),
  ('Magnata da Produtividade', 'Alcançou o topo da economia de recompensas.', 'sparkles', 'gold', 1000, 'Acumular 1000 Gold')
ON CONFLICT (titulo) DO NOTHING;
