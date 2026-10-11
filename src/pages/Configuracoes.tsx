import React, { useState, useRef } from 'react';
import { 
  Settings, 
  User, 
  Clock, 
  Upload, 
  FileJson, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Info,
  Pencil,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAreas } from '@/contexts/AreasContext';
import { useTasks } from '@/contexts/TasksContext';
import { supabase } from '@/lib/supabase';

interface ParsedTask {
  title: string;
  notes?: string | null;
  due?: string | null;
  status?: string | null;
  completed?: boolean;
  completedAt?: string | null;
}

interface ParsedList {
  name: string;
  tasks: ParsedTask[];
}

export const Configuracoes: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { fetchAreas } = useAreas();
  const { fetchTasks } = useTasks();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [cleaning, setCleaning] = useState(false);
  const [cleanSuccess, setCleanSuccess] = useState<string | null>(null);

  // Estados para edição do nome de usuário
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [profileToast, setProfileToast] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const currentDisplayName = profile?.nome || user?.user_metadata?.full_name || 'Usuário Gestor';

  const handleStartEdit = () => {
    setEditedName(currentDisplayName);
    setIsEditingName(true);
    setProfileError(null);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName('');
    setProfileError(null);
  };

  const handleAtualizarNome = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    const novoNome = editedName.trim();
    if (!novoNome) {
      setProfileError('O nome não pode ficar em branco.');
      return;
    }

    setIsSavingName(true);
    setProfileError(null);

    try {
      // 1. Atualizar campo nome na tabela public.usuarios
      const { error: usuariosErr } = await supabase
        .from('usuarios')
        .upsert({
          id: user.id,
          nome: novoNome,
          email: user.email || '',
          updated_at: new Date().toISOString(),
        });

      if (usuariosErr) {
        console.warn('Erro ao atualizar tabela usuarios:', usuariosErr);
      }

      // 2. Atualizar metadados no Supabase Auth
      const { error: authErr } = await supabase.auth.updateUser({
        data: {
          nome: novoNome,
          full_name: novoNome,
        },
      });

      if (authErr) throw authErr;

      // 3. Atualizar contexto global para sincronizar Header, Avatar, etc.
      await refreshProfile();

      setIsEditingName(false);
      setProfileToast('Nome atualizado com sucesso!');
      setTimeout(() => setProfileToast(null), 3500);
    } catch (err: unknown) {
      console.error('Erro ao atualizar nome:', err);
      setProfileError(err instanceof Error ? err.message : 'Falha ao atualizar o nome.');
    } finally {
      setIsSavingName(false);
    }
  };

  // Normalização e extração de listas e tarefas de arquivos do Google Takeout
  const parseGoogleTasksJson = (jsonText: string, fallbackFileName: string): ParsedList[] => {
    let data: any;
    try {
      data = JSON.parse(jsonText);
    } catch {
      throw new Error('O arquivo selecionado não contém um JSON válido.');
    }

    const defaultListName = fallbackFileName.replace(/\.[^/.]+$/, '').trim() || 'Google Tasks';
    const lists: ParsedList[] = [];

    const extractTasks = (items: any[]): ParsedTask[] => {
      if (!Array.isArray(items)) return [];
      return items
        .filter((item) => item && typeof item === 'object' && item.deleted !== true)
        .map((item) => {
          const rawTitle = (item.title || item.name || '').trim();
          const notes = item.notes || item.descricao || item.description || null;
          const due = item.due || item.prazo || item.due_date || null;
          const status = item.status || (item.concluida ? 'completed' : 'needsAction');
          const completed = status === 'completed' || item.concluida === true || !!item.completed;
          const completedAt = item.completed || null;

          return {
            title: rawTitle || 'Tarefa sem título',
            notes: notes ? String(notes).trim() : null,
            due: due ? String(due) : null,
            status,
            completed,
            completedAt: completedAt ? String(completedAt) : null,
          };
        })
        .filter((t) => t.title.length > 0);
    };

    // Formato 1: Array na raiz
    if (Array.isArray(data)) {
      const looksLikeLists = data.some(
        (el) => el && typeof el === 'object' && (Array.isArray(el.items) || Array.isArray(el.tasks))
      );
      if (looksLikeLists) {
        for (const el of data) {
          if (!el || typeof el !== 'object') continue;
          const listName = (el.title || el.name || defaultListName).trim();
          const tasks = extractTasks(el.items || el.tasks || []);
          if (tasks.length > 0 || listName) {
            lists.push({ name: listName, tasks });
          }
        }
      } else {
        const tasks = extractTasks(data);
        if (tasks.length > 0) {
          lists.push({ name: defaultListName, tasks });
        }
      }
    } 
    // Formato 2: Objeto na raiz
    else if (data && typeof data === 'object') {
      if (Array.isArray(data.lists)) {
        for (const el of data.lists) {
          if (!el || typeof el !== 'object') continue;
          const listName = (el.title || el.name || defaultListName).trim();
          const tasks = extractTasks(el.items || el.tasks || []);
          lists.push({ name: listName, tasks });
        }
      } else if (
        Array.isArray(data.items) &&
        data.items.length > 0 &&
        (Array.isArray(data.items[0]?.items) || Array.isArray(data.items[0]?.tasks) || data.items[0]?.kind === 'tasks#taskList')
      ) {
        for (const el of data.items) {
          if (!el || typeof el !== 'object') continue;
          const listName = (el.title || el.name || defaultListName).trim();
          const tasks = extractTasks(el.items || el.tasks || []);
          lists.push({ name: listName, tasks });
        }
      } else if (Array.isArray(data.items)) {
        const listName = (data.title || data.name || defaultListName).trim();
        const tasks = extractTasks(data.items);
        lists.push({ name: listName, tasks });
      } else if (Array.isArray(data.tasks)) {
        const listName = (data.title || data.name || defaultListName).trim();
        const tasks = extractTasks(data.tasks);
        lists.push({ name: listName, tasks });
      }
    }

    if (lists.length === 0) {
      throw new Error('Nenhuma lista ou tarefa compatível foi identificada no arquivo JSON.');
    }

    return lists;
  };

  const processImport = async (jsonText: string, fileName: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado para realizar a importação.');
    }

    const lists = parseGoogleTasksJson(jsonText, fileName);

    let totalTasksImported = 0;
    let totalListsImported = 0;

    // Obter ordem máxima atual de áreas de foco para adicionar no final
    const { data: existingAreas } = await supabase
      .from('areas_foco')
      .select('ordem')
      .eq('id_usuario', user.id)
      .order('ordem', { ascending: false })
      .limit(1);

    let currentOrder = existingAreas && existingAreas.length > 0 ? (existingAreas[0].ordem || 0) + 1 : 0;

    for (const list of lists) {
      // 1. Criar nova Área de Foco com ícone e cor padrão
      const { data: newArea, error: areaErr } = await supabase
        .from('areas_foco')
        .insert({
          id_usuario: user.id,
          nome: list.name,
          cor: '#3B82F6',
          icone: 'list',
          ordem: currentOrder++,
        })
        .select()
        .single();

      if (areaErr || !newArea) {
        throw new Error(`Erro ao criar a área "${list.name}": ${areaErr?.message || 'Erro inesperado'}`);
      }

      totalListsImported++;

      // 2. Mapear e inserir itens na tabela crm_tarefas
      if (list.tasks.length > 0) {
        const tasksToInsert = list.tasks.map((task) => {
          let prazoIso: string | null = null;
          if (task.due) {
            const parsedDate = new Date(task.due);
            if (!isNaN(parsedDate.getTime())) {
              prazoIso = parsedDate.toISOString();
            }
          }

          const isCompleted = task.completed || task.status === 'completed';
          let concluidaEmIso: string | null = null;
          if (isCompleted) {
            if (task.completedAt) {
              const parsedCompleted = new Date(task.completedAt);
              if (!isNaN(parsedCompleted.getTime())) {
                concluidaEmIso = parsedCompleted.toISOString();
              }
            }
            if (!concluidaEmIso) {
              concluidaEmIso = new Date().toISOString();
            }
          }

          return {
            id_usuario: user.id,
            id_area: newArea.id,
            titulo: task.title,
            descricao: task.notes || null,
            prazo: prazoIso,
            prioridade: 'media' as const,
            concluida: isCompleted,
            concluida_em: concluidaEmIso,
          };
        });

        const { error: tasksErr } = await supabase
          .from('crm_tarefas')
          .insert(tasksToInsert);

        if (tasksErr) {
          throw new Error(`Erro ao inserir tarefas da lista "${list.name}": ${tasksErr.message}`);
        }

        totalTasksImported += list.tasks.length;
      }
    }

    // Atualizar contextos globais de áreas e tarefas
    await Promise.all([fetchAreas(), fetchTasks()]);

    setSuccessMessage(
      `Importação concluída com sucesso! Foram importadas ${totalListsImported} área(s) e ${totalTasksImported} tarefa(s) para o seu sistema.`
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      setError('Por favor, selecione um arquivo válido no formato .json.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImporting(true);
    setError(null);
    setSuccessMessage(null);

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        if (!content || !content.trim()) {
          throw new Error('O arquivo .json selecionado está vazio.');
        }

        await processImport(content, file.name);
      } catch (err: unknown) {
        console.error('Erro na importação:', err);
        const msg = err instanceof Error ? err.message : 'Falha ao processar o arquivo de importação.';
        setError(msg);
      } finally {
        setImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      setError('Falha ao ler o arquivo selecionado no seu dispositivo.');
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  const handleTriggerFileInput = () => {
    setError(null);
    setSuccessMessage(null);
    fileInputRef.current?.click();
  };

  const handleCleanDuplicates = async () => {
    if (!user) return;
    setCleaning(true);
    setCleanSuccess(null);
    setError(null);

    try {
      const { data: userTasks, error: fetchErr } = await supabase
        .from('crm_tarefas')
        .select('id, titulo, id_area, created_at')
        .eq('id_usuario', user.id)
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      if (!userTasks || userTasks.length === 0) {
        setCleanSuccess('Nenhuma tarefa encontrada para limpeza.');
        return;
      }

      const seen = new Set<string>();
      const duplicateIds: string[] = [];

      for (const t of userTasks) {
        const key = `${t.id_area || 'no-area'}:::${t.titulo.trim().toLowerCase()}`;
        if (seen.has(key)) {
          duplicateIds.push(t.id);
        } else {
          seen.add(key);
        }
      }

      if (duplicateIds.length === 0) {
        setCleanSuccess('Nenhuma tarefa duplicada foi encontrada!');
        return;
      }

      const { error: deleteErr } = await supabase
        .from('crm_tarefas')
        .delete()
        .in('id', duplicateIds);

      if (deleteErr) throw deleteErr;

      await fetchTasks();
      setCleanSuccess(`Limpeza concluída! Foram removidas ${duplicateIds.length} tarefa(s) duplicada(s) mantendo a versão mais recente.`);
    } catch (err: unknown) {
      console.error('Erro na limpeza de duplicadas:', err);
      setError(err instanceof Error ? err.message : 'Falha ao executar limpeza de tarefas duplicadas.');
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      <div className="border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700/50">
            <Settings className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Configurações
          </h1>
        </div>
        <p className="text-sm text-zinc-400 mt-1">
          Preferências de perfil, fuso horário e gestão de dados
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cartão de Perfil */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Perfil do Usuário</h3>
              <p className="text-xs text-zinc-400">Informações da conta autenticada</p>
            </div>
          </div>
          <div className="space-y-3 pt-2 text-sm">
            <div>
              <span className="text-xs font-medium text-zinc-400 block uppercase mb-1">Nome</span>
              {!isEditingName ? (
                <div className="flex items-center gap-2">
                  <span className="text-zinc-200 font-medium">
                    {currentDisplayName}
                  </span>
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    title="Editar nome"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-blue-600/10 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAtualizarNome} className="flex items-center gap-2 max-w-sm mt-1">
                  <input
                    type="text"
                    autoFocus
                    required
                    disabled={isSavingName}
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Digite seu nome..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-zinc-100 text-sm focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isSavingName || !editedName.trim()}
                    title="Salvar"
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-50 shrink-0 shadow-xs"
                  >
                    {isSavingName ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSavingName}
                    title="Cancelar"
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              )}
              {profileError && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{profileError}</span>
                </p>
              )}
            </div>
            <div>
              <span className="text-xs font-medium text-zinc-400 block uppercase">E-mail</span>
              <span className="text-zinc-200 font-medium">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Cartão de Preferências */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Preferências do Sistema</h3>
              <p className="text-xs text-zinc-400">Configurações regionais e tema</p>
            </div>
          </div>
          <div className="space-y-3 pt-2 text-sm">
            <div>
              <span className="text-xs font-medium text-zinc-400 block uppercase">Fuso Horário Padrão</span>
              <span className="text-zinc-200 font-medium">America/Sao_Paulo (UTC-3)</span>
            </div>
            <div>
              <span className="text-xs font-medium text-zinc-400 block uppercase">Tema da Interface</span>
              <span className="text-zinc-200 font-medium">Modo Escuro (Dark Mode)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seção: Importação de Dados */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Importação de Dados</h3>
              <p className="text-xs text-zinc-400">
                Importe seu histórico e listas de tarefas do Google Tasks
              </p>
            </div>
          </div>

          <div>
            {/* Input oculto acionado pelo botão */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".json" 
              onChange={handleFileChange}
              disabled={importing}
              className="hidden" 
            />

            <button
              onClick={handleTriggerFileInput}
              disabled={importing}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-blue-800/50 disabled:cursor-not-allowed text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Importando...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Importar do Google Tasks (.json)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback de Sucesso */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-sm flex items-start gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-200">Importação Concluída!</p>
              <p className="mt-0.5 text-xs text-emerald-300/90">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Feedback de Erro */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-200">Falha na Importação</p>
              <p className="mt-0.5 text-xs text-red-300/90">{error}</p>
            </div>
          </div>
        )}

        {/* Informações explicativas sobre o processo */}
        <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/60 p-4 space-y-2.5 text-xs text-zinc-400">
          <div className="flex items-center gap-2 text-zinc-300 font-medium">
            <Info className="w-4 h-4 text-blue-400" />
            <span>Como funciona a importação via Google Takeout:</span>
          </div>
          <ul className="list-disc list-inside space-y-1.5 pl-1 text-zinc-400 leading-relaxed">
            <li>
              Cada lista encontrada no arquivo será criada como uma nova <strong className="text-zinc-200">Área de Foco</strong> (com ícone e cor padrão).
            </li>
            <li>
              As demandas são salvas com título, descrição (notas), prazo de vencimento e status de conclusão (concluídas ou pendentes).
            </li>
            <li>
              A prioridade padrão atribuída a todas as tarefas importadas é <strong className="text-zinc-200">Média</strong>.
            </li>
            <li>
              Para exportar seus dados do Google Tasks: acesse o <strong className="text-zinc-200">Google Takeout</strong> (<a href="https://takeout.google.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">takeout.google.com</a>), selecione apenas o <em className="text-zinc-300">Google Tasks</em>, escolha o formato JSON e extraia o arquivo.
            </li>
          </ul>
        </div>
      </div>

      {/* Seção: Limpeza e Gestão de Tarefas */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Limpeza de Tarefas</h3>
              <p className="text-xs text-zinc-400">
                Remova tarefas duplicadas ou clonadas em excesso de importações antigas
              </p>
            </div>
          </div>

          <button
            onClick={handleCleanDuplicates}
            disabled={cleaning}
            className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 border border-zinc-700/80 text-zinc-200 hover:text-white font-medium px-4 py-2.5 rounded-xl transition-all cursor-pointer text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {cleaning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Verificando duplicadas...</span>
              </>
            ) : (
              <>
                <span>Remover Tarefas Duplicadas</span>
              </>
            )}
          </button>
        </div>

        {cleanSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-sm flex items-start gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-200">Resultado da Limpeza</p>
              <p className="mt-0.5 text-xs text-emerald-300/90">{cleanSuccess}</p>
            </div>
          </div>
        )}

        <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/60 p-4 space-y-2 text-xs text-zinc-400">
          <p className="text-zinc-300 font-medium">Sobre a remoção de duplicadas:</p>
          <p>
            Esta ferramenta identifica tarefas que possuem o mesmo título e mesma área de foco, mantendo a mais recente e excluindo cópias antigas excedentes.
          </p>
          <p className="text-zinc-500">
            Dica: Um script SQL avançado de limpeza também foi disponibilizado em <code className="text-zinc-300 bg-zinc-900 px-1 py-0.5 rounded">supabase/limpeza_tarefas.sql</code> para execução em massa via painel Supabase.
          </p>
        </div>
      </div>

      {/* Toast Flutuante de Confirmação */}
      {profileToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-emerald-500/30 text-zinc-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{profileToast}</span>
        </div>
      )}
    </div>
  );
};

