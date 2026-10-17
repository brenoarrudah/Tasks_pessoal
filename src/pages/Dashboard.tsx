import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, 
  Plus, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  Flame,
  Award,
  X,
  Sparkles
} from 'lucide-react';
import { useTasks, Task } from '@/contexts/TasksContext';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskModal } from '@/components/tasks/TaskModal';
import { PlayerStatusCard } from '@/components/gamificacao/PlayerStatusCard';
import { DeleteTaskModal } from '@/components/tasks/DeleteTaskModal';
import { 
  isTodaySaoPaulo, 
  isOverdueSaoPaulo, 
  formatSaoPauloHeaderDate,
  sortTasksCronologicamente 
} from '@/lib/dateUtils';
import { dispararConfetes as dispararConfetesLib } from '@/lib/confetti';

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
  const [completedExpanded, setCompletedExpanded] = useState<boolean | null>(null);
  const [includeOverdue, setIncludeOverdue] = useState(true);
  const [showVitoriaToast, setShowVitoriaToast] = useState(false);
  const prevPendingRef = useRef<number | null>(null);

  // Função para disparar confetes utilizando canvas-confetti
  const dispararConfetes = () => {
    dispararConfetesLib();
  };

  const formattedToday = formatSaoPauloHeaderDate();

  // Filtrar tarefas com vencimento para HOJE no fuso America/Sao_Paulo
  const todayTasks = tasks.filter((t) => isTodaySaoPaulo(t.prazo));

  // Filtrar tarefas ATRASADAS (vencimento anterior a hoje e não concluídas)
  const overdueTasks = tasks.filter((t) => isOverdueSaoPaulo(t.prazo) && !t.concluida);

  // Ordenação cronológica estrita:
  // 1. Ordem crescente de horário ('07:00' < '14:00')
  // 2. Tarefas sem horário empurradas para o final
  // 3. Desempate: Prioridade (Alta > Média > Baixa)
  const sortedTodayPending = todayTasks
    .filter((t) => !t.concluida)
    .sort(sortTasksCronologicamente);

  const sortedOverdue = overdueTasks
    .slice()
    .sort(sortTasksCronologicamente);

  // Lista de exibição unificada
  const displayPendingTasks = includeOverdue
    ? [...sortedOverdue, ...sortedTodayPending]
    : sortedTodayPending;

  const todayCompletedTasks = todayTasks.filter((t) => t.concluida);

  // Contadores
  const pendingCount = displayPendingTasks.length;
  const totalTodayCount = todayTasks.length;
  const completedTodayCount = todayCompletedTasks.length;
  const completionPercentage = totalTodayCount > 0 
    ? Math.round((completedTodayCount / totalTodayCount) * 100) 
    : 100;

  const isCompletedVisible = completedExpanded !== null 
    ? completedExpanded 
    : (pendingCount === 0);

  // Gatilho 1 (Vitória Diária): aciona os confetes e Toast quando o Progresso do Dia atingir 100%
  useEffect(() => {
    if (
      prevPendingRef.current !== null &&
      prevPendingRef.current > 0 &&
      pendingCount === 0 &&
      totalTodayCount > 0
    ) {
      dispararConfetes();
      setShowVitoriaToast(true);
      const timer = setTimeout(() => setShowVitoriaToast(false), 6000);
      return () => clearTimeout(timer);
    }
    prevPendingRef.current = pendingCount;
  }, [pendingCount, totalTodayCount]);

  const handleOpenDeleteModal = (task: Task) => {
    setTaskToDelete(task);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (id: string) => {
    await deleteTask(id);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200 pb-16">
      
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-zinc-800/80 pb-3 sm:pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm">
              <Sun className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Tarefas do Dia
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 capitalize">
            {formattedToday}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => openCreateTaskModal()}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Status do Perfil Gamificado */}
      <PlayerStatusCard />

      {/* Widget do Dashboard / Banner Principal */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-2xl p-3.5 sm:p-5 shadow-lg relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-6 relative z-10">
          
          {/* Lado Esquerdo: Frase & Contador */}
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-center gap-2">
              {pendingCount === 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <Award className="w-3.5 h-3.5" />
                  Dia Concluído!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                  <Flame className="w-3.5 h-3.5" />
                  Foco Diário
                </span>
              )}
            </div>

            {pendingCount === 0 ? (
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-zinc-100 tracking-tight">
                  Todas as tarefas de hoje foram concluídas! 🎉
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5 sm:mt-1">
                  Excelente constância, Caçador. Todo o XP, Gold e Atributos foram creditados no seu perfil.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
                    {pendingCount}
                  </span>
                  <span className="text-xs sm:text-base font-medium text-zinc-400">
                    {pendingCount === 1 ? 'tarefa pendente hoje' : 'tarefas pendentes hoje'}
                  </span>
                </div>
                <p className="hidden sm:block text-xs text-zinc-400 mt-0.5">
                  Suas tarefas do dia estão centralizadas abaixo. Conclua-as para acumular recompensas.
                </p>
              </div>
            )}
          </div>

          {/* Lado Direito: Barra de Progresso do Dia */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-2.5 sm:p-3.5 md:w-60 space-y-1.5 sm:space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300">Progresso do Dia</span>
              <span className="font-bold text-blue-400">{completionPercentage}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-zinc-900 rounded-full h-1.5 sm:h-2 overflow-hidden border border-zinc-800">
              <div 
                className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-500">
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

          {/* Acordeão de Tarefas Concluídas Hoje */}
          {todayCompletedTasks.length > 0 && (
            <div className="pt-1">
              <button
                onClick={() => setCompletedExpanded(!isCompletedVisible)}
                className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors py-2 px-3 rounded-xl hover:bg-zinc-900/60 cursor-pointer border border-transparent hover:border-zinc-800"
              >
                {isCompletedVisible ? (
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                )}
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Concluídas Hoje ({todayCompletedTasks.length})</span>
              </button>

              {isCompletedVisible && (
                <div className="space-y-2 mt-2.5 pl-2 border-l-2 border-zinc-800/80">
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

      {/* Toast Especial de Vitória Diária 100% */}
      {showVitoriaToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] max-w-md w-[92%] bg-gradient-to-r from-emerald-950 via-zinc-900 to-emerald-950 border-2 border-emerald-500/50 text-zinc-100 p-4 rounded-2xl shadow-2xl shadow-emerald-950/80 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 shrink-0">
              <Award className="w-6 h-6 animate-bounce" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Vitória Diária Conquistada!
              </p>
              <p className="text-sm font-bold text-zinc-100 truncate">
                100% das tarefas de hoje foram concluídas! 🎉
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowVitoriaToast(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors shrink-0 cursor-pointer"
            title="Fechar notificação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
