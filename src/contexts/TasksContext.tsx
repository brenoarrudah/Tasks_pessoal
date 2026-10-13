import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { calculateNextRecurrenceDate } from '@/lib/dateUtils';
import { format } from 'date-fns';

export type {
  RepeticaoTipo,
  TerminoTipo,
  PrioridadeTipo,
  MetaStatus,
  GamificacaoPerfil,
  MetaMacro,
  Subtask,
  Task,
  Tarefa,
  Subtarefa,
} from '@/types';
import type { Task, Subtask, RepeticaoTipo, TerminoTipo } from '@/types';

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (data: {
    titulo: string;
    descricao?: string;
    prazo?: string | null;
    horario?: string | null;
    prioridade: 'alta' | 'media' | 'baixa';
    id_area?: string | null;
    recorrente?: boolean;
    repeticao_intervalo?: number;
    repeticao_tipo?: RepeticaoTipo;
    repeticao_dias_semana?: number[] | null;
    termino_tipo?: TerminoTipo;
    termino_data?: string | null;
    termino_ocorrencias?: number | null;
    ocorrencias_realizadas?: number;
    id_meta_vinculada?: string | null;
    recompensa_xp?: number;
  }) => Promise<Task | null>;
  updateTask: (
    id: string,
    data: {
      titulo?: string;
      descricao?: string | null;
      prazo?: string | null;
      horario?: string | null;
      prioridade?: 'alta' | 'media' | 'baixa';
      id_area?: string | null;
      recorrente?: boolean;
      repeticao_intervalo?: number;
      repeticao_tipo?: RepeticaoTipo;
      repeticao_dias_semana?: number[] | null;
      termino_tipo?: TerminoTipo;
      termino_data?: string | null;
      termino_ocorrencias?: number | null;
      ocorrencias_realizadas?: number;
      id_meta_vinculada?: string | null;
      recompensa_xp?: number;
    }
  ) => Promise<boolean>;
  toggleTaskComplete: (id: string, currentCompleted: boolean) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  
  // Gestão de subtarefas
  createSubtask: (id_tarefa: string, titulo: string) => Promise<Subtask | null>;
  toggleSubtaskComplete: (subtaskId: string, currentCompleted: boolean) => Promise<boolean>;
  deleteSubtask: (subtaskId: string) => Promise<boolean>;

  // Controle global do Modal de Criação/Edição
  isCreateModalOpen: boolean;
  editingTask: Task | null;
  selectedDefaultAreaId: string | undefined;
  openCreateTaskModal: (defaultAreaId?: string) => void;
  openEditTaskModal: (task: Task) => void;
  closeTaskModal: () => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de controle do Modal Global
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedDefaultAreaId, setSelectedDefaultAreaId] = useState<string | undefined>(undefined);

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar tarefas com suas subtarefas atreladas
      const { data, error: fetchErr } = await supabase
        .from('crm_tarefas')
        .select(`
          *,
          subtarefas (
            id,
            id_tarefa,
            titulo,
            concluida,
            created_at
          )
        `)
        .eq('id_usuario', user.id)
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      // Ordenar subtarefas por data de criação
      const formattedTasks: Task[] = (data || []).map((t) => ({
        ...t,
        subtarefas: (t.subtarefas || []).sort((a: Subtask, b: Subtask) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
      }));

      setTasks(formattedTasks);
    } catch (err: unknown) {
      console.error('Erro ao carregar tarefas:', err);
      setError('Não foi possível carregar as tarefas.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (data: {
    titulo: string;
    descricao?: string;
    prazo?: string | null;
    prioridade: 'alta' | 'media' | 'baixa';
    id_area?: string | null;
    recorrente?: boolean;
    repeticao_intervalo?: number;
    repeticao_tipo?: RepeticaoTipo;
    termino_tipo?: TerminoTipo;
    termino_data?: string | null;
    termino_ocorrencias?: number | null;
    ocorrencias_realizadas?: number;
  }) => {
    if (!user) return null;

    try {
      const isRecorrente = data.recorrente ?? false;
      let dataPrazo: string | null = null;
      if (data.prazo) {
        dataPrazo = typeof data.prazo === 'string' && data.prazo.match(/^\d{4}-\d{2}-\d{2}/)
          ? data.prazo.substring(0, 10)
          : data.prazo;
      } else if (isRecorrente) {
        dataPrazo = format(new Date(), 'yyyy-MM-dd');
      }

      const payload = {
        id_usuario: user.id,
        titulo: data.titulo.trim(),
        descricao: data.descricao?.trim() || null,
        prazo: dataPrazo,
        horario: data.horario ? data.horario.trim() : null,
        prioridade: data.prioridade || 'media',
        id_area: data.id_area || null,
        concluida: false,
        recorrente: isRecorrente,
        repeticao_intervalo: data.repeticao_intervalo ?? 1,
        repeticao_tipo: data.repeticao_tipo ?? 'dia',
        repeticao_dias_semana: data.repeticao_dias_semana ?? null,
        termino_tipo: data.termino_tipo ?? 'nunca',
        termino_data: data.termino_data ?? null,
        termino_ocorrencias: data.termino_ocorrencias ?? null,
        ocorrencias_realizadas: data.ocorrencias_realizadas ?? 0,
        id_meta_vinculada: data.id_meta_vinculada || null,
        recompensa_xp: data.recompensa_xp ?? 10,
      };

      const { data: inserted, error: insertErr } = await supabase
        .from('crm_tarefas')
        .insert(payload)
        .select()
        .single();

      if (insertErr) throw insertErr;

      await fetchTasks();
      return inserted;
    } catch (err: unknown) {
      console.error('Erro ao criar tarefa:', err);
      throw err;
    }
  };

  const updateTask = async (
    id: string,
    data: {
      titulo?: string;
      descricao?: string | null;
      prazo?: string | null;
      horario?: string | null;
      prioridade?: 'alta' | 'media' | 'baixa';
      id_area?: string | null;
      recorrente?: boolean;
      repeticao_intervalo?: number;
      repeticao_tipo?: RepeticaoTipo;
      repeticao_dias_semana?: number[] | null;
      termino_tipo?: TerminoTipo;
      termino_data?: string | null;
      termino_ocorrencias?: number | null;
      ocorrencias_realizadas?: number;
      id_meta_vinculada?: string | null;
      recompensa_xp?: number;
    }
  ) => {
    if (!user) return false;

    try {
      let prazoToUpdate = data.prazo;
      if (prazoToUpdate && typeof prazoToUpdate === 'string' && prazoToUpdate.match(/^\d{4}-\d{2}-\d{2}/)) {
        prazoToUpdate = prazoToUpdate.substring(0, 10);
      }
      if (data.recorrente === true && !prazoToUpdate) {
        prazoToUpdate = format(new Date(), 'yyyy-MM-dd');
      }

      const payload = {
        ...(data.titulo !== undefined && { titulo: data.titulo.trim() }),
        ...(data.descricao !== undefined && { descricao: data.descricao?.trim() || null }),
        ...(data.prazo !== undefined && { prazo: prazoToUpdate || null }),
        ...(data.horario !== undefined && { horario: data.horario ? data.horario.trim() : null }),
        ...(data.prioridade !== undefined && { prioridade: data.prioridade }),
        ...(data.id_area !== undefined && { id_area: data.id_area || null }),
        ...(data.recorrente !== undefined && { recorrente: data.recorrente }),
        ...(data.repeticao_intervalo !== undefined && { repeticao_intervalo: data.repeticao_intervalo }),
        ...(data.repeticao_tipo !== undefined && { repeticao_tipo: data.repeticao_tipo }),
        ...(data.repeticao_dias_semana !== undefined && { repeticao_dias_semana: data.repeticao_dias_semana }),
        ...(data.termino_tipo !== undefined && { termino_tipo: data.termino_tipo }),
        ...(data.termino_data !== undefined && { termino_data: data.termino_data }),
        ...(data.termino_ocorrencias !== undefined && { termino_ocorrencias: data.termino_ocorrencias }),
        ...(data.ocorrencias_realizadas !== undefined && { ocorrencias_realizadas: data.ocorrencias_realizadas }),
        ...(data.id_meta_vinculada !== undefined && { id_meta_vinculada: data.id_meta_vinculada || null }),
        ...(data.recompensa_xp !== undefined && { recompensa_xp: data.recompensa_xp }),
        updated_at: new Date().toISOString(),
      };

      const { error: updateErr } = await supabase
        .from('crm_tarefas')
        .update(payload)
        .eq('id', id)
        .eq('id_usuario', user.id);

      if (updateErr) throw updateErr;

      await fetchTasks();
      return true;
    } catch (err: unknown) {
      console.error('Erro ao atualizar tarefa:', err);
      throw err;
    }
  };

  const toggleTaskComplete = async (id: string, currentCompleted: boolean) => {
    if (!user) return false;

    const newCompleted = !currentCompleted;
    const concluidaEm = newCompleted ? new Date().toISOString() : null;

    try {
      const task = tasks.find((t) => t.id === id);

      // Atualização otimista local
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, concluida: newCompleted, concluida_em: concluidaEm } : t))
      );

      const { error: updateErr } = await supabase
        .from('crm_tarefas')
        .update({
          concluida: newCompleted,
          concluida_em: concluidaEm,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('id_usuario', user.id);

      if (updateErr) {
        // Reverter em caso de falha
        await fetchTasks();
        throw updateErr;
      }

      // Se estamos concluindo uma tarefa recorrente (false -> true)
      if (newCompleted && task && task.recorrente) {
        // 1. Calcular a PRÓXIMA data com catch-up automático anti-bola de neve:
        // - Calcula a próxima data matematicamente (prazo atual + intervalo)
        // - Se a data calculada estiver no passado, ignora dias perdidos e projeta para hoje (ou próxima ocorrência válida)
        // - Para repeticao_tipo === 'dia', garante: novoPrazo = max(prazoCalculado, dataAtual)
        const nextDate = calculateNextRecurrenceDate(task);

        // 2. Validar condições de término:
        let shouldCreateNext = true;

        if (task.termino_tipo === 'data' && task.termino_data) {
          const limitDate = new Date(task.termino_data);
          limitDate.setHours(23, 59, 59, 999);
          if (nextDate.getTime() > limitDate.getTime()) {
            shouldCreateNext = false;
          }
        } else if (task.termino_tipo === 'ocorrencias' && task.termino_ocorrencias != null) {
          const ocorrenciasRealizadas = task.ocorrencias_realizadas || 0;
          if (ocorrenciasRealizadas + 1 >= task.termino_ocorrencias) {
            shouldCreateNext = false;
          }
        }

        // 3 e 4. Caso passe nas validações, criar uma CÓPIA com a nova data e regras preservadas
        if (shouldCreateNext) {
          const novaOcorrenciaPayload = {
            id_usuario: user.id,
            id_area: task.id_area || null,
            titulo: task.titulo,
            descricao: task.descricao || null,
            prazo: format(nextDate, 'yyyy-MM-dd'),
            horario: task.horario || null,
            prioridade: task.prioridade || 'media',
            concluida: false,
            concluida_em: null,
            recorrente: true,
            repeticao_intervalo: task.repeticao_intervalo || 1,
            repeticao_tipo: task.repeticao_tipo || 'dia',
            repeticao_dias_semana: task.repeticao_dias_semana || null,
            termino_tipo: task.termino_tipo || 'nunca',
            termino_data: task.termino_data || null,
            termino_ocorrencias: task.termino_ocorrencias || null,
            ocorrencias_realizadas: (task.ocorrencias_realizadas || 0) + 1,
            id_meta_vinculada: task.id_meta_vinculada || null,
            recompensa_xp: task.recompensa_xp ?? 10,
          };

          const { data: createdTask, error: insertCopyErr } = await supabase
            .from('crm_tarefas')
            .insert(novaOcorrenciaPayload)
            .select()
            .single();

          if (!insertCopyErr && createdTask && task.subtarefas && task.subtarefas.length > 0) {
            const subtasksPayload = task.subtarefas.map((st) => ({
              id_tarefa: createdTask.id,
              titulo: st.titulo,
              concluida: false,
            }));
            await supabase.from('subtarefas').insert(subtasksPayload);
          }
        }
      }

      await fetchTasks();
      return true;
    } catch (err: unknown) {
      console.error('Erro ao marcar conclusão da tarefa:', err);
      return false;
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return false;

    try {
      const { error: deleteErr } = await supabase
        .from('crm_tarefas')
        .delete()
        .eq('id', id)
        .eq('id_usuario', user.id);

      if (deleteErr) throw deleteErr;

      await fetchTasks();
      return true;
    } catch (err: unknown) {
      console.error('Erro ao excluir tarefa:', err);
      throw err;
    }
  };

  // Funções de Subtarefa
  const createSubtask = async (id_tarefa: string, titulo: string) => {
    if (!user || !titulo.trim()) return null;

    try {
      const { data: inserted, error: insertErr } = await supabase
        .from('subtarefas')
        .insert({
          id_tarefa,
          titulo: titulo.trim(),
          concluida: false,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;

      // Atualizar lista local
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id_tarefa
            ? { ...t, subtarefas: [...(t.subtarefas || []), inserted] }
            : t
        )
      );

      return inserted;
    } catch (err: unknown) {
      console.error('Erro ao criar subtarefa:', err);
      throw err;
    }
  };

  const toggleSubtaskComplete = async (subtaskId: string, currentCompleted: boolean) => {
    if (!user) return false;

    const newCompleted = !currentCompleted;

    try {
      // Atualização otimista
      setTasks((prev) =>
        prev.map((t) => ({
          ...t,
          subtarefas: (t.subtarefas || []).map((st) =>
            st.id === subtaskId ? { ...st, concluida: newCompleted } : st
          ),
        }))
      );

      const { error: updateErr } = await supabase
        .from('subtarefas')
        .update({ concluida: newCompleted })
        .eq('id', subtaskId);

      if (updateErr) {
        await fetchTasks();
        throw updateErr;
      }

      return true;
    } catch (err: unknown) {
      console.error('Erro ao marcar subtarefa:', err);
      return false;
    }
  };

  const deleteSubtask = async (subtaskId: string) => {
    if (!user) return false;

    try {
      // Atualização otimista
      setTasks((prev) =>
        prev.map((t) => ({
          ...t,
          subtarefas: (t.subtarefas || []).filter((st) => st.id !== subtaskId),
        }))
      );

      const { error: deleteErr } = await supabase
        .from('subtarefas')
        .delete()
        .eq('id', subtaskId);

      if (deleteErr) {
        await fetchTasks();
        throw deleteErr;
      }

      return true;
    } catch (err: unknown) {
      console.error('Erro ao excluir subtarefa:', err);
      return false;
    }
  };

  // Métodos do Modal Global
  const openCreateTaskModal = (defaultAreaId?: string) => {
    setEditingTask(null);
    setSelectedDefaultAreaId(defaultAreaId);
    setIsCreateModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setSelectedDefaultAreaId(task.id_area || undefined);
    setIsCreateModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsCreateModalOpen(false);
    setEditingTask(null);
    setSelectedDefaultAreaId(undefined);
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        loading,
        error,
        fetchTasks,
        createTask,
        updateTask,
        toggleTaskComplete,
        deleteTask,
        createSubtask,
        toggleSubtaskComplete,
        deleteSubtask,
        isCreateModalOpen,
        editingTask,
        selectedDefaultAreaId,
        openCreateTaskModal,
        openEditTaskModal,
        closeTaskModal,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks deve ser usado dentro de um TasksProvider');
  }
  return context;
};
