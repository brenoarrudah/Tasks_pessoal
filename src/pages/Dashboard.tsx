import React, { useState } from 'react';
import { 
  Sun, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  Calendar,
  Flame,
  Award
} from 'lucide-react';
import { useTasks, Task } from '@/contexts/TasksContext';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskModal } from '@/components/tasks/TaskModal';
import { DeleteTaskModal } from '@/components/tasks/DeleteTaskModal';
import { isTodaySaoPaulo, isOverdueSaoPaulo, formatSaoPauloHeaderDate } from '@/lib/dateUtils';

export const Dashboard: React.FC = () => {
  const { 
    tasks, 
    loading, 
    deleteTask,
    isCreateModalOpen,
    editingTask,
    selectedDefaultAreaId,
    openCreateTaskModal,
    openEditTaskModal,
    closeTaskModal
  } = useTasks();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [includeOverdue, setIncludeOverdue] = useState(true);

  const formattedToday = formatSaoPauloHeaderDate();

  // Filtrar tarefas com vencimento para HOJE no fuso America/Sao_Paulo
  const todayTasks = tasks.filter((t) => isTodaySaoPaulo(t.prazo));

  // Filtrar tarefas ATRASADAS (vencimento anterior a hoje e não concluídas)
  const overdueTasks = tasks.filter((t) => isOverdueSaoPaulo(t.prazo) && !t.concluida);

  // Lista de exibição unificada
  const displayPendingTasks = includeOverdue
    ? [...overdueTasks, ...todayTasks.filter((t) => !t.concluida)]
    : todayTasks.filter((t) => !t.concluida);

  const todayCompletedTasks = todayTasks.filter((t) => t.concluida);

  // Contadores
  const pendingCount = displayPendingTasks.length;
  const totalTodayCount = todayTasks.length;
  const completedTodayCount = todayCompletedTasks.length;
  const completionPercentage = totalTodayCount > 0 
    ? Math.round((completedTodayCount / totalTodayCount) * 100) 
    : 100;

  const handleOpenDeleteModal = (task: Task) => {
    setTaskToDelete(task);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (id: string) => {
    await deleteTask(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm">
              <Sun className="w-6 h-6 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
              Tarefas do Dia
            </h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1 capitalize">
            {formattedToday}
          </p>
        </div>

        <button
          onClick={() => openCreateTaskModal()}
          className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Widget do Dashboard / Banner Principal */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          {/* Lado Esquerdo: Frase & Contador */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {pendingCount === 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <Award className="w-3.5 h-3.5" />
                  Dia Concluído!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                  <Flame className="w-3.5 h-3.5" />
                  Foco Diário
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold text-zinc-100 tracking-tight">
                {pendingCount}
              </span>
              <span className="text-base sm:text-lg font-medium text-zinc-400">
                {pendingCount === 1 ? 'tarefa pendente hoje' : 'tarefas pendentes hoje'}
              </span>
            </div>

            <p className="text-xs text-zinc-400 max-w-lg">
              {pendingCount === 0 
                ? 'Excelente! Você completou todas as suas demandas para a data de hoje.'
                : 'Suas tarefas do dia estão centralizadas abaixo. Marque-as conforme as for realizando.'}
            </p>
          </div>

          {/* Lado Direito: Barra de Progresso do Dia */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 md:w-64 space-y-3 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300">Progresso do Dia</span>
              <span className="font-bold text-blue-400">{completionPercentage}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden border border-zinc-800">
              <div 
                className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>{completedTodayCount} concluídas</span>
              <span>{totalTodayCount} no total</span>
            </div>
          </div>

        </div>
      </div>

      {/* Toggle para Tarefas Atrasadas se existirem */}
      {overdueTasks.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-900/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-amber-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Você possui <strong className="text-amber-200">{overdueTasks.length} tarefas atrasadas</strong> de dias anteriores.
            </span>
          </div>
          <button
            onClick={() => setIncludeOverdue(!includeOverdue)}
            className="text-xs font-semibold underline hover:text-amber-100 transition-colors cursor-pointer shrink-0"
          >
            {includeOverdue ? 'Ocultar atrasadas' : 'Incluir atrasadas'}
          </button>
        </div>
      )}

      {/* Estado de Carregamento (Skeletons) */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 space-y-3 animate-pulse">
              <div className="w-48 h-5 bg-zinc-800 rounded" />
              <div className="w-full h-14 bg-zinc-800/60 rounded-xl" />
            </div>
          ))}
        </div>
      ) : displayPendingTasks.length === 0 && todayCompletedTasks.length === 0 ? (
        /* Empty State (Sem Tarefas para Hoje) */
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[340px]">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
            <Sun className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-100">
            Tudo em dia! Você não tem tarefas pendentes para hoje.
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mt-1.5 mb-6">
            Aproveite seu dia ou planeje novas atividades para manter sua produtividade em alta.
          </p>
          <button
            onClick={() => openCreateTaskModal()}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-3 rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 text-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Agendar Nova Tarefa</span>
          </button>
        </div>
      ) : (
        /* Listagem Unificada de Tarefas */
        <div className="space-y-6">
          
          {/* Tarefas Pendentes do Dia */}
          {displayPendingTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Pendentes para Hoje ({displayPendingTasks.length})
                </h2>
              </div>

              <div className="space-y-2.5">
                {displayPendingTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={openEditTaskModal}
                    onDelete={handleOpenDeleteModal}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Se todas as pendentes forem concluídas mas existem concluídas hoje */}
          {displayPendingTasks.length === 0 && todayCompletedTasks.length > 0 && (
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-2xl p-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-emerald-300">
                Parabéns! Todas as tarefas de hoje foram concluídas.
              </h3>
              <p className="text-xs text-zinc-400">
                Confira a lista de tarefas concluídas logo abaixo.
              </p>
            </div>
          )}

          {/* Acordeão de Tarefas Concluídas Hoje */}
          {todayCompletedTasks.length > 0 && (
            <div className="pt-2">
              <button
                onClick={() => setCompletedExpanded(!completedExpanded)}
                className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors py-2 px-3 rounded-xl hover:bg-zinc-900/60 cursor-pointer border border-transparent hover:border-zinc-800"
              >
                {completedExpanded ? (
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                )}
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Concluídas Hoje ({todayCompletedTasks.length})</span>
              </button>

              {completedExpanded && (
                <div className="space-y-2.5 mt-3 pl-2 border-l-2 border-zinc-800">
                  {todayCompletedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={openEditTaskModal}
                      onDelete={handleOpenDeleteModal}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Modal Global de Criação / Edição de Tarefas */}
      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={closeTaskModal}
        taskToEdit={editingTask}
        defaultAreaId={selectedDefaultAreaId}
      />

      {/* Modal AlertDialog de Confirmação de Exclusão */}
      <DeleteTaskModal
        isOpen={deleteModalOpen}
        task={taskToDelete}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
};
