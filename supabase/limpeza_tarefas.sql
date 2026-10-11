-- Script SQL para Limpeza de Tarefas Duplicadas ou em Excesso da Importação do Google Tasks
-- Execute no SQL Editor do Supabase (https://supabase.com/dashboard/project/swqhvomhgnzjwznablnm/sql)

-- Opção 1: Remover tarefas duplicadas (mesmo título e mesma área), mantendo apenas a mais recente
WITH duplicadas AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY id_usuario, id_area, LOWER(TRIM(titulo))
               ORDER BY created_at DESC
           ) as rn
    FROM public.crm_tarefas
)
DELETE FROM public.crm_tarefas
WHERE id IN (
    SELECT id FROM duplicadas WHERE rn > 1
);

-- Opção 2 (Opcional): Se desejar remover tarefas já concluídas em lote
-- DELETE FROM public.crm_tarefas WHERE concluida = true;

-- Opção 3 (Opcional): Se desejar remover uma lista/área inteira importada pelo Google Takeout e suas tarefas
-- DELETE FROM public.areas_foco WHERE nome = 'Nome da Área Importada';
