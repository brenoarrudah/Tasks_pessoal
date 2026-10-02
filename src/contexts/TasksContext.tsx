import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

export interface Subtask {
  id: string;
  id_tarefa: string;
  titulo: string;
  concluida: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  id_usuario: string;
  id_area: string | null;
  titulo: string;
  descricao: string | null;
  prazo: string | null;
  prioridade: 'alta' | 'media' | 'baixa';
  concluida: boolean;
  concluida_em: string | null;
  created_at: string;
  updated_at: string;
  subtarefas?: Subtask[];
}

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (data: {
    titulo: string;
    descricao?: string;
    prazo?: string | null;
    prioridade: 'alta' | 'media' | 'baixa';
    id_area?: string | null;
  }) => Promise<Task | null>;
  updateTask: (
    id: string,
    data: {
      titulo?: string;
      descricao?: string | null;
      prazo?: string | null;
      prioridade?: 'alta' | 'media' | 'baixa';
      id_area?: string | null;
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
  }) => {
    if (!user) return null;

    try {
      const payload = {
        id_usuario: user.id,
        titulo: data.titulo.trim(),
        descricao: data.descricao?.trim() || null,
        prazo: data.prazo || null,
        prioridade: data.prioridade || 'media',
        id_area: data.id_area || null,
        concluida: false,
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
      prioridade?: 'alta' | 'media' | 'baixa';
      id_area?: string | null;
    }
  ) => {
    if (!user) return false;

    try {
      const payload = {
        ...(data.titulo !== undefined && { titulo: data.titulo.trim() }),
        ...(data.descricao !== undefined && { descricao: data.descricao?.trim() || null }),
        ...(data.prazo !== undefined && { prazo: data.prazo || null }),
        ...(data.prioridade !== undefined && { prioridade: data.prioridade }),
        ...(data.id_area !== undefined && { id_area: data.id_area || null }),
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
