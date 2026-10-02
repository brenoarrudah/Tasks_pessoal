import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ListTodo, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  Layers,
  Search
} from 'lucide-react';
import { useTasks, Task } from '@/contexts/TasksContext';
import { useAreas } from '@/contexts/AreasContext';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskModal } from '@/components/tasks/TaskModal';
import { DeleteTaskModal } from '@/components/tasks/DeleteTaskModal';
import { AreaIcon } from '@/components/areas/AreaIcon';

export const VisaoGeral: React.FC = () => {
  const [searchParams] = useSearchParams();
  const areaFilterId = searchParams.get('areaId');

  const { 
    tasks, 
    loading: loadingTasks, 
    deleteTask,
    isCreateModalOpen,
    editingTask,
    selectedDefaultAreaId,
    openCreateTaskModal,
    openEditTaskModal,
    closeTaskModal
  } = useTasks();

  const { areas, loading: loadingAreas } = useAreas();

  // Estados de controle para modal de exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Estados de acordeão para seções de "Concluídas" por área
  const [completedExpanded, setCompletedExpanded] = useState<Record<string, boolean>>({});

  const [searchQuery, setSearchQuery] = useState('');

  const toggleCompletedSection = (areaId: string) => {
    setCompletedExpanded((prev) => ({ ...prev, [areaId]: !prev[areaId] }));
  };

  const handleOpenDeleteModal = (task: Task) => {
    setTaskToDelete(task);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (id: string) => {
    await deleteTask(id);
  };

  // Filtrar tarefas por query de busca ou filtro de área
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = searchQuery.trim() === '' || 
      t.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.descricao && t.descricao.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesArea = !areaFilterId || t.id_area === areaFilterId;

    return matchesSearch && matchesArea;
  });

  // Filtrar áreas visíveis conforme o parâmetro ?areaId
  const visibleAreas = areaFilterId 
    ? areas.filter((a) => a.id === areaFilterId) 
    : areas;

  // Tarefas sem área atrelada (Geral)
  const unassignedTasks = filteredTasks.filter((t) => !t.id_area);

  const isLoading = loadingTasks || loadingAreas;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm">
              <ListTodo className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
              Visão Geral de Tarefas
            </h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            {areaFilterId && visibleAreas.length > 0
              ? `Filtrando tarefas da lista: ${visibleAreas[0].nome}`
              : 'Gerencie todas as demandas divididas por áreas de foco e prioridades'}
          </p>
        </div>

        <button
          onClick={() => openCreateTaskModal(areaFilterId || undefined)}
          className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Criar Tarefa</span>
        </button>
      </div>

      {/* Barra de Busca de Tarefas */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar tarefas pelo título ou descrição..."
          className="w-full bg-zinc-900/90 border border-zinc-800 text-zinc-100 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
        />
      </div>

      {/* Estado de Carregamento (Skeletons) */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 space-y-3 animate-pulse">
              <div className="w-40 h-5 bg-zinc-800 rounded" />
              <div className="w-full h-14 bg-zinc-800/60 rounded-xl" />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        /* Empty State Geral */
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[360px]">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-100">
            Nenhuma Tarefa Encontrada
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mt-1.5 mb-6">
            Sua lista de tarefas está limpa! Clique no botão abaixo para adicionar sua primeira demanda.
          </p>
          <button
            onClick={() => openCreateTaskModal(areaFilterId || undefined)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-3 rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 text-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Criar Primeira Tarefa</span>
          </button>
        </div>
      ) : (
        /* Agrupamento por Áreas */
        <div className="space-y-8">
          
          {/* Renderizar Áreas de Foco */}
          {visibleAreas.map((area) => {
            const areaTasks = filteredTasks.filter((t) => t.id_area === area.id);
            const activeTasks = areaTasks.filter((t) => !t.concluida);
            const completedTasks = areaTasks.filter((t) => t.concluida);
            const isCompletedExpanded = !!completedExpanded[area.id];

            if (areaTasks.length === 0 && searchQuery) return null;

            return (
              <div key={area.id} className="space-y-3">
                {/* Header do Grupo da Área */}
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2 px-1">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" 
                      style={{ backgroundColor: area.cor }} 
                    />
                    <AreaIcon name={area.icone} className="w-4 h-4 text-zinc-300" />
                    <h2 className="text-base font-bold text-zinc-100 tracking-tight">
                      {area.nome}
                    </h2>
                    <span className="text-xs text-zinc-500 font-medium">
                      ({activeTasks.length})
                    </span>
                  </div>

                  <button
                    onClick={() => openCreateTaskModal(area.id)}
                    className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 p-1 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar nesta lista</span>
                  </button>
                </div>

                {/* Tarefas Ativas da Área */}
                {activeTasks.length === 0 && completedTasks.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 text-center text-xs text-zinc-500 italic">
                    Nenhuma tarefa nesta área. Clique em "+ Adicionar nesta lista".
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {activeTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={openEditTaskModal}
                        onDelete={handleOpenDeleteModal}
                      />
                    ))}
                  </div>
                )}

                {/* Acordeão de Tarefas Concluídas da Área */}
                {completedTasks.length > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={() => toggleCompletedSection(area.id)}
                      className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors py-1.5 px-2 rounded-lg hover:bg-zinc-900/60 cursor-pointer"
                    >
                      {isCompletedExpanded ? (
                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-500" />
                      )}
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Concluídas ({completedTasks.length})</span>
                    </button>

                    {isCompletedExpanded && (
                      <div className="space-y-2.5 mt-2.5 pl-2 border-l-2 border-zinc-800/80">
                        {completedTasks.map((task) => (
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
            );
          })}

          {/* Tarefas Sem Área Atribuída (Geral) */}
          {unassignedTasks.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-zinc-800/80">
              <div className="flex items-center gap-2 px-1">
                <Layers className="w-4 h-4 text-zinc-500" />
                <h2 className="text-base font-bold text-zinc-100">
                  Outras Tarefas (Geral)
                </h2>
                <span className="text-xs text-zinc-500 font-medium">
                  ({unassignedTasks.filter((t) => !t.concluida).length})
                </span>
              </div>

              <div className="space-y-2.5">
                {unassignedTasks
                  .filter((t) => !t.concluida)
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={openEditTaskModal}
                      onDelete={handleOpenDeleteModal}
                    />
                  ))}
              </div>

              {/* Concluídas Sem Área */}
              {unassignedTasks.filter((t) => t.concluida).length > 0 && (
                <div className="pt-2">
                  <button
                    onClick={() => toggleCompletedSection('unassigned')}
                    className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors py-1.5 px-2 rounded-lg hover:bg-zinc-900/60 cursor-pointer"
                  >
                    {completedExpanded['unassigned'] ? (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    )}
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Concluídas ({unassignedTasks.filter((t) => t.concluida).length})</span>
                  </button>

                  {completedExpanded['unassigned'] && (
                    <div className="space-y-2.5 mt-2.5 pl-2 border-l-2 border-zinc-800/80">
                      {unassignedTasks
                        .filter((t) => t.concluida)
                        .map((task) => (
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
