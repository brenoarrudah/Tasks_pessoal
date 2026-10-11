# Gestor Pessoal de Tarefas

## Visão geral do projeto

Gestor Pessoal de Tarefas, organização pessoal e produtividade. Aplicação web inspirada no Google Tasks para organizar demandas divididas em áreas e consolidar automaticamente em uma única coluna todas as tarefas com vencimento para a data atual.

## Stack técnica

- Frontend: React + Vite + TypeScript
- Estilização: Tailwind CSS + Shadcn/UI
- Backend/Banco: Supabase (Postgres + Auth)
- Roteamento: React Router
- Projeto Supabase: Tasks_pessoal

## Banco de dados

- `usuarios`: Perfis de utilizador vinculados ao sistema de autenticação do Supabase.
- `configuracoes`: Configurações visuais, preferências de interface e fuso horário.
- `areas_foco`: Listas e categorias temáticas de organização (ex: Distrital, Clube Águia, M. Jovem).
- `crm_tarefas`: Demandas centrais com prazo, status de conclusão e nível de prioridade.
- `subtarefas`: Itens de detalhamento atrelados a cada tarefa principal.
- `logs_sistema`: Auditoria e rastreio de alterações de dados.

## Estrutura de páginas e rotas

- `/login` (`Login`): Autenticação minimalista de usuário via Supabase Auth (sem cadastro aberto).
- `/` (`Dashboard`): [Protegida] Painel de "Tarefas do Dia" com consolidado unificado do fuso `America/Sao_Paulo`, widget contador em tempo real, barra de progresso, gestão de atrasadas e expansão de subtarefas.
- `/tarefas` (`VisaoGeral`): [Protegida] Visão ampla e agrupada de tarefas por áreas de foco, com busca, filtros, sanfona de tarefas concluídas, ordenação por prioridade, inserção rápida de subtarefas e modal de criação/edição.
- `/areas` (`GestaoAreas`): [Protegida] CRUD completo de listas/áreas de foco com escolha de ícones Lucide, paleta de cores, modal de exclusão (AlertDialog), reordenação interativa e auditoria de logs.
- `/configuracoes` (`Configuracoes`): [Protegida] Perfil, fuso horário e preferências.
- `/logs` (`LogsSistema`): [Protegida] Consulta à trilha de auditoria e logs do sistema.
- `AppLayout`: Layout base responsivo protegido contendo Header fixo e Sidebar com menu hambúrguer para dispositivos móveis.

## Convenções do projeto

- Todo o conteúdo do sistema em português do Brasil
- Nomenclatura de tabelas e colunas em português, com underline
- Toda exclusão exibe modal de confirmação
- Todas as ações relevantes registradas em `logs_sistema`
- Timezone padrão: America/Sao_Paulo

## Histórico de etapas construídas

- **Etapa 1 — Banco de dados e Documentação Base:** criado o schema completo no Supabase com tabelas, triggers, índices, RLS e inicialização da documentação viva em ANTIGRAVITY.md.
- **Etapa 2 — Estrutura, navegação e login:** configurado o ambiente React + Vite + TypeScript + Tailwind CSS, criado o contexto de autenticação com Supabase Auth, tela de login minimalista, proteção de rotas e o layout base inspirado no Google Tasks (Header + Sidebar responsiva).
- **Etapa 3 — Gestão de áreas de foco:** implementado o CRUD de áreas de foco na página `/areas` (criação, edição, exclusão segura com AlertDialog, reordenação de listas e registro auditável no `logs_sistema`), sincronizado em tempo real com a Sidebar do sistema via `AreasContext`.
- **Etapa 4 — Gestão de tarefas e subtarefas:** implementada a página `/tarefas` com listagem agrupada por áreas de foco, busca por termos, badges coloridos por nível de prioridade (Alta, Média, Baixa), prazos, conclusão com riscado e seção sanfona de concluídas, gestão de subtarefas com inserção rápida via Enter e confirmação de exclusão segura.
- **Etapa 5 — Visão "Tarefas do Dia" e Dashboard:** implementado o Dashboard na rota `/` com filtragem exata de data no fuso horário `America/Sao_Paulo`, contador em tempo real de demandas pendentes, barra de progresso diária, suporte a tarefas atrasadas, listagem unificada com badges de área/prioridade e acordeão de concluídas.
- **Etapa 6 — Auditoria de segurança (02/10/2026):** realizada a auditoria de segurança no banco de dados e no frontend. RLS ativo em todas as 6 tabelas, zero exposição de `service_role` key no código, rotas 100% protegidas por `ProtectedRoute` e isolamento estrito de dados por `auth.uid()`. Correções de segurança aplicadas no banco de dados.
- **Etapa 7 — Deploy seguro para o GitHub (02/10/2026):** verificações de segurança finalizadas (verificação de segredos, `.gitignore` estrito, RLS ativo e variáveis públicas isoladas), repositório remoto configurado e código enviado com sucesso para https://github.com/brenoarrudah/Tasks_pessoal.
- **Etapa Extra — Botão de Importação do Google Tasks (11/10/2026):** adicionada seção em `/configuracoes` para ingestão direta de arquivos `.json` do Google Takeout, normalizando listas para `areas_foco` e demandas (com notas, prazos e conclusão) para `crm_tarefas`.
- **Etapa Recorrência — Sistema de Repetição Customizada Estilo Google Tasks (11/10/2026):** implementado modal fiel ao Google Tasks para repetição a cada [N] dias/semanas/meses/anos com condições de término (Nunca, Em data, Após X ocorrências). Lógica funcional em `toggleTaskComplete` para geração automática da próxima demanda com subtarefas reinicializadas, mais ferramenta de limpeza de duplicadas em `/configuracoes` e scripts SQL dedicados (`migration_recurrence.sql` e `limpeza_tarefas.sql`).
- **Etapa UI — DatePicker Interativo Shadcn/UI (11/10/2026):** substituição do input nativo de data no modal de tarefas pelo componente `Calendar` + `Popover` do Shadcn/UI, integrado à biblioteca `date-fns` com formatação e localização `ptBR` completa no Dark Mode.
- **Etapa Perfil — Edição Interativa do Nome de Usuário (11/10/2026):** implementada funcionalidade de edição do nome de exibição no bloco de Perfil do Usuário em `/configuracoes`, com sincronização simultânea na tabela `public.usuarios` e nos metadados de Auth do Supabase, refletindo instantaneamente no Header e no Dropdown de Avatar via `refreshProfile()`.
- **Etapa UI — Limpeza Visual do Dashboard (11/10/2026):** remoção da badge com a string de timezone (`America/Sao_Paulo`) no cabeçalho de "Tarefas do Dia", tornando a apresentação da data mais limpa e minimalista.
- **Etapa Recorrência Semanal — Seleção de Dias da Semana Estilo Google Tasks (11/10/2026):** adicionada seleção múltipla de dias da semana (D, S, T, Q, Q, S, S) para recorrência semanal (`repeticao_dias_semana INTEGER[]`). Ao concluir uma tarefa recorrente com dias especificados, o sistema calcula inteligentemente a data do próximo dia selecionado dentro da semana atual ou avança para o ciclo seguinte considerando o intervalo configurado. Acompanha script de migração `supabase/migration_dias_semana.sql`.
- **Etapa Normalização — Sequência Contínua e Re-indexação Automática das Áreas de Foco (11/10/2026):** implementada normalização automática no carregamento, movimentação (subir/descer) e exclusão de áreas de foco. O campo `ordem` agora é estritamente sequencial (1, 2, 3...) eliminando lacunas numéricas e re-indexando em tempo real no Supabase com atualização otimista na interface. Acompanha script SQL `supabase/normalizar_ordem_areas.sql`.
- **Etapa UI — DatePicker no Término da Recorrência (11/10/2026):** substituição do input nativo de data no término da repetição ("Em") pelo componente `DatePicker` interativo (`Popover` + `Calendar` do Shadcn/UI), com formatação em `pt-BR`, suporte a desabilitação dinâmica e botão para limpar data.
- **Etapa Lógica — Data Inicial Automática para Tarefas Recorrentes (11/10/2026):** implementada atribuição automática da data atual (hoje) ao campo `prazo` sempre que uma tarefa recorrente for criada ou atualizada sem prazo especificado, garantindo visibilidade imediata no Dashboard de tarefas diárias.

## Próximos passos

- Sistema em evolução contínua com deploy automático integrado ao GitHub e Vercel.

## Integrações

[Nenhuma integração externa de IA ou provedores de pagamento prevista para esta versão pessoal]
