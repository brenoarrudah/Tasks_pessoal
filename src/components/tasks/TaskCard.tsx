import React, { useState } from 'react';
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Pencil, 
  Trash2, 
  Plus, 
  Flag, 
  Clock,
  CheckSquare,
  CornerDownRight,
  RotateCcw,
  Target
} from 'lucide-react';
import { Task, useTasks } from '@/contexts/TasksContext';
import { useAreas } from '@/contexts/AreasContext';
import { useMetas } from '@/contexts/MetasContext';
import { AreaIcon } from '@/components/areas/AreaIcon';
import { cn } from '@/lib/utils';
import { formatPrazoComHorario } from '@/lib/dateUtils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const { toggleTaskComplete, createSubtask, toggleSubtaskComplete, deleteSubtask } = useTasks();
  const { areas } = useAreas();
  const { metas } = useMetas();

  const [expanded, setExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [addingSubtask, setAddingSubtask] = useState(false);

  // Buscar a área associada à tarefa
  const area = areas.find((a) => a.id === task.id_area);

  // Buscar a meta macro vinculada à tarefa
  const linkedMeta = task.id_meta_vinculada ? metas.find((m) => m.id === task.id_meta_vinculada) : null;

  // Subtarefas calculadas
  const subtasks = task.subtarefas || [];
  const completedSubtasks = subtasks.filter((st) => st.concluida).length;

  const handleToggleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleTaskComplete(task.id, task.concluida);
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || addingSubtask) return;

    try {
      setAddingSubtask(true);
      await createSubtask(task.id, newSubtaskTitle);
      setNewSubtaskTitle('');
    } catch (err) {
      console.error(err);
    } finally {
      setAddingSubtask(false);
    }
  };

  // Cores e labels de Prioridade
  const priorityConfig = {
    alta: {
      label: 'Alta',
      badgeClass: 'bg-red-500/10 text-red-400 border-red-500/20',
      dotClass: 'bg-red-500',
    },
    media: {
      label: 'Média',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      dotClass: 'bg-amber-500',
    },
    baixa: {
      label: 'Baixa',
      badgeClass: 'bg-zinc-800 text-zinc-400 border-zinc-700/60',
      dotClass: 'bg-zinc-500',
    },
  }[task.prioridade || 'media'];

  // Formatação do prazo/horário (ex: "12 de Out." ou "12 de Out., 07:00")
  const formattedPrazo = formatPrazoComHorario(task.prazo, task.horario);

  return (
    <div
      className={cn(
        "bg-zinc-900/90 border rounded-2xl transition-all shadow-sm overflow-hidden",
        task.concluida
          ? "border-zinc-800/60 bg-zinc-900/40 opacity-75"
          : "border-zinc-800/90 hover:border-zinc-700/80"
      )}
    >
      {/* Linha Principal da Tarefa */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-4 flex items-start gap-3.5 cursor-pointer select-none"
      >
        {/* Custom Checkbox Inspirado no Google Tasks */}
        <button
          type="button"
          onClick={handleToggleComplete}
          className={cn(
            "w-5 h-5 rounded-full border flex items-center justify-center transition-all mt-0.5 shrink-0 cursor-pointer",
            task.concluida
              ? "bg-blue-600 border-blue-600 text-white shadow-xs"
              : "border-zinc-600 hover:border-blue-500 hover:bg-blue-600/10 text-transparent"
          )}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        {/* Conteúdo Central */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Título da Tarefa */}
            <span
              className={cn(
                "text-sm font-medium transition-all",
                task.concluida ? "line-through text-zinc-500" : "text-zinc-100"
              )}
            >
              {task.titulo}
            </span>

            {/* Badge de Prioridade */}
            <span className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1",
              priorityConfig.badgeClass
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full", priorityConfig.dotClass)} />
              {priorityConfig.label}
            </span>

            {/* Badge de Área de Foco */}
            {area && (
              <span 
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300 flex items-center gap-1.5"
              >
                <div 
                  className="w-2 h-2 rounded-full shrink-0" 
                  style={{ backgroundColor: area.cor }} 
                />
                <AreaIcon name={area.icone} className="w-3 h-3 text-zinc-400" />
                <span>{area.nome}</span>
              </span>
            )}

            {/* Badge de Meta Macro Vinculada */}
            {linkedMeta && (
              <span 
                title={`Meta Macro: ${linkedMeta.titulo} (${linkedMeta.progresso_atual}/${linkedMeta.progresso_alvo} pts)`}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 flex items-center gap-1 shrink-0"
              >
                <Target className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[120px]">{linkedMeta.titulo}</span>
                <span className="text-[9px] text-emerald-400/90 font-mono font-semibold">
                  ({linkedMeta.progresso_atual}/{linkedMeta.progresso_alvo})
                </span>
              </span>
            )}
          </div>

          {/* Subtítulo / Metadata (Prazo e Contagem de Subtarefas) */}
          <div className="flex items-center gap-4 text-xs text-zinc-400 mt-2 flex-wrap">
            {formattedPrazo && (
              <span className="flex items-center gap-1.2 text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                <Clock className="w-3.5 h-3.5" />
                <span>{formattedPrazo}</span>
              </span>
            )}

            {task.recorrente && (
              <span 
                title={(() => {
                  const base = `Repete a cada ${task.repeticao_intervalo || 1} ${task.repeticao_tipo || 'dia'}(s)`;
                  if (task.repeticao_tipo === 'semana' && task.repeticao_dias_semana && task.repeticao_dias_semana.length > 0) {
                    const diasLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                    const diasTexto = task.repeticao_dias_semana
                      .slice()
                      .sort((a, b) => a - b)
                      .map((d) => diasLabels[d])
                      .join(', ');
                    return `${base} (${diasTexto})`;
                  }
                  return base;
                })()}
                className="flex items-center gap-1.2 text-purple-400 font-medium bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>
                  {task.repeticao_intervalo && task.repeticao_intervalo > 1
                    ? `A cada ${task.repeticao_intervalo} ${
                        task.repeticao_tipo === 'mes' ? 'meses' : (task.repeticao_tipo || 'dia') + 's'
                      }`
                    : task.repeticao_tipo === 'semana'
                    ? 'Semanal'
                    : task.repeticao_tipo === 'mes'
                    ? 'Mensal'
                    : task.repeticao_tipo === 'ano'
                    ? 'Anual'
                    : 'Diário'}
                </span>
              </span>
            )}

            {subtasks.length > 0 && (
              <span className="flex items-center gap-1 text-zinc-400">
                <CheckSquare className="w-3.5 h-3.5 text-zinc-500" />
                <span>
                  {completedSubtasks}/{subtasks.length} subtarefas
                </span>
              </span>
            )}

            {task.descricao && !expanded && (
              <span className="text-zinc-500 truncate max-w-[200px]">
                {task.descricao}
              </span>
            )}
          </div>
        </div>

        {/* Lado Direito: Ações (Editar, Excluir, Expandir) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            title="Editar tarefa"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task);
            }}
            title="Excluir tarefa"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            title={expanded ? 'Recolher detalhes' : 'Expandir detalhes'}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Seção Expandida (Detalhes + Subtarefas) */}
      {expanded && (
        <div className="border-t border-zinc-800/80 bg-zinc-950/60 p-4 space-y-4 text-xs animate-in slide-in-from-top-1 duration-150">
          
          {/* Descrição Detalhada */}
          {task.descricao && (
            <div>
              <span className="text-[11px] font-semibold uppercase text-zinc-500 block mb-1">
                Descrição
              </span>
              <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed text-sm bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60">
                {task.descricao}
              </p>
            </div>
          )}

          {/* Seção de Subtarefas */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-semibold uppercase text-zinc-400 flex items-center gap-1.5">
              <CornerDownRight className="w-3.5 h-3.5 text-blue-500" />
              Subtarefas ({completedSubtasks}/{subtasks.length})
            </span>

            {/* Lista de Subtarefas */}
            <div className="space-y-1.5 pl-2">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/60 hover:border-zinc-700/60 transition-colors group/st"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleSubtaskComplete(st.id, st.concluida)}
                      className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 cursor-pointer",
                        st.concluida
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-zinc-600 hover:border-blue-500 text-transparent"
                      )}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                    <span
                      className={cn(
                        "text-xs transition-all truncate",
                        st.concluida ? "line-through text-zinc-500" : "text-zinc-200"
                      )}
                    >
                      {st.titulo}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteSubtask(st.id)}
                    title="Excluir subtarefa"
                    className="opacity-60 group-hover/st:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Inserção Rápida de Subtarefa (Input + Enter) */}
            <form onSubmit={handleAddSubtask} className="pt-1 flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Adicionar um passo (pressione Enter para salvar)..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-blue-500 placeholder:text-zinc-600 transition-colors"
              />
              <button
                type="submit"
                disabled={!newSubtaskTitle.trim() || addingSubtask}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
};
