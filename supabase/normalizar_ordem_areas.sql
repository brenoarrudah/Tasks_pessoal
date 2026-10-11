-- Normalização e Re-indexação Automática das Áreas de Foco
-- Remove lacunas numéricas e re-indexa em sequência contínua (1, 2, 3...) por usuário

WITH ranked AS (
  SELECT 
    id, 
    ROW_NUMBER() OVER (PARTITION BY id_usuario ORDER BY ordem ASC, created_at ASC) AS nova_ordem
  FROM public.areas_foco
)
UPDATE public.areas_foco a
SET 
  ordem = r.nova_ordem,
  updated_at = NOW()
FROM ranked r
WHERE a.id = r.id AND a.ordem != r.nova_ordem;
