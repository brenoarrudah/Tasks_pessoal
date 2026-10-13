import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  Pencil, 
  Trash2, 
  Award, 
  Clock, 
  Layers, 
  TrendingUp, 
  Check, 
  Pause, 
  Play, 
  AlertCircle 
} from 'lucide-react';
import { useMetas } from '@/contexts/MetasContext';
import { useTasks } from '@/contexts/TasksContext';
import { MetaMacro } from '@/types';
import { MetaModal } from '@/components/metas/MetaModal';
import { cn } from '@/lib/utils';

export const Metas: React.FC = () => {
  const { metas, loading, deleteMeta, updateMeta, incrementarProgresso } = useMetas();
  const { tasks } = useTasks();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [metaToEdit, setMetaToEdit] = useState<MetaMacro | null>(null);
  const [metaToDelete, setMetaToDelete] = useState<MetaMacro | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenCreateModal = () => {
    setMetaToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (meta: MetaMacro) => {
    setMetaToEdit(meta);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!metaToDelete) return;
    try {
      setDeletingId(metaToDelete.id);
      await deleteMeta(metaToDelete.id);
      setMetaToDelete(null);
    } catch (err) {
      console.error('Erro ao deletar meta:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleConcluida = async (meta: MetaMacro) => {
    const isConcluida = meta.status === 'concluida';
    await updateMeta(meta.id, {
      status: isConcluida ? 'em_andamento' : 'concluida',
      progresso_atual: isConcluida ? Math.max(0, meta.progresso_alvo - 1) : meta.progresso_alvo,
    });
  };

  // Contadores e métricas
  const totalMetas = metas.length;
  const metasEmAndamento = metas.filter((m) => m.status === 'em_andamento');
  const metasConcluidas = metas.filter((m) => m.status === 'concluida');

  const mediaProgresso = totalMetas > 0
    ? Math.round(
        metas.reduce((acc, m) => {
          const ratio = Math.min(1, (m.progresso_atual || 0) / (m.progresso_alvo || 1));
          return acc + ratio;
        }, 0) * 100 / totalMetas
      )
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm">
              <Target className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
              Metas e Projetos
            </h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Objetivos estratégicos de longo prazo do Jogo Infinito
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nova Meta</span>
        </button>
      </div>

      {/* Cards de Métricas / Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Total de Metas</span>
            <Target className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-100">{totalMetas}</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Em Andamento</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{metasEmAndamento.length}</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Concluídas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{metasConcluidas.length}</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Progresso Geral</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">{mediaProgresso}%</div>
        </div>
      </div>

      {/* Grid de Metas */}
      {loading ? (
        <div className="p-12 text-center text-zinc-500 text-sm">
          Carregando metas...
        </div>
      ) : metas.length === 0 ? (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
            <Target className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-zinc-100">Nenhuma meta cadastrada ainda</h3>
            <p className="text-sm text-zinc-400">
              Crie seu primeiro objetivo de longo prazo e vincule suas tarefas do dia a dia para acompanhar sua evolução no Jogo Infinito.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="bg-amber-600 hover:bg-amber-500 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-amber-600/20 inline-flex items-center gap-2 text-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Cadastrar Primeira Meta</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metas.map((meta) => {
            const progressoAtual = meta.progresso_atual || 0;
            const progressoAlvo = meta.progresso_alvo || 100;
            const percentage = Math.min(100, Math.round((progressoAtual / progressoAlvo) * 100));
            const isCompleted = meta.status === 'concluida' || percentage >= 100;
            const linkedTasksCount = tasks.filter((t) => t.id_meta_vinculada === meta.id).length;

            return (
              <div
                key={meta.id}
                className={cn(
                  "bg-zinc-900/80 border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between space-y-4",
                  isCompleted 
                    ? "border-emerald-500/30 bg-emerald-950/10" 
                    : "border-zinc-800/90 hover:border-zinc-700/80"
                )}
              >
                {/* Topo do Card */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={cn(
                        "p-2 rounded-xl shrink-0",
                        isCompleted ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                      )}>
                        <Target className="w-5 h-5" />
                      </div>
                      <h3 className={cn(
                        "text-base font-bold truncate",
                        isCompleted ? "text-emerald-300" : "text-zinc-100"
                      )}>
                        {meta.titulo}
                      </h3>
                    </div>

                    {/* Badge de Status */}
                    <span className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0",
                      isCompleted 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : meta.status === 'pausada'
                        ? "bg-zinc-800 border-zinc-700 text-zinc-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    )}>
                      {isCompleted ? 'Concluída' : meta.status === 'pausada' ? 'Pausada' : 'Em Andamento'}
                    </span>
                  </div>

                  {/* Descrição */}
                  {meta.descricao && (
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                      {meta.descricao}
                    </p>
                  )}
                </div>

                {/* Bloco de Progresso */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{progressoAtual} de {progressoAlvo} pontos</span>
                    </span>
                    <span className={cn("font-bold", isCompleted ? "text-emerald-400" : "text-amber-400")}>
                      {percentage}%
                    </span>
                  </div>

                  {/* Barra de Progresso Visual */}
                  <div className="w-full h-2.5 bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        isCompleted 
                          ? "bg-emerald-500 shadow-xs shadow-emerald-500/50" 
                          : "bg-gradient-to-r from-amber-500 to-amber-400 shadow-xs shadow-amber-500/50"
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      <span>{linkedTasksCount} tarefa(s) vinculada(s)</span>
                    </span>
                    {isCompleted && (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> Meta alcançada
                      </span>
                    )}
                  </div>
                </div>

                {/* Rodapé do Card com Ações */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 gap-2">
                  {/* Botão de Incremento Rápido (+1 Ponto) */}
                  <button
                    type="button"
                    onClick={() => incrementarProgresso(meta.id, 1)}
                    disabled={isCompleted}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-amber-500/20"
                    title="Adicionar 1 ponto de progresso"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                    <span>+1 Ponto</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Botão Alternar Conclusão */}
                    <button
                      type="button"
                      onClick={() => handleToggleConcluida(meta)}
                      title={isCompleted ? "Reabrir meta" : "Marcar como concluída"}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    {/* Botão Editar */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(meta)}
                      title="Editar meta"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* Botão Excluir */}
                    <button
                      type="button"
                      onClick={() => setMetaToDelete(meta)}
                      title="Excluir meta"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      <MetaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        metaToEdit={metaToEdit}
      />

      {/* Modal de Confirmação de Exclusão */}
      {metaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2 rounded-xl bg-red-500/10">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-zinc-100">Excluir Meta Macro?</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Tem certeza de que deseja excluir a meta <strong className="text-zinc-200">"{metaToDelete.titulo}"</strong>? As tarefas associadas serão mantidas, mas o vínculo será removido.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMetaToDelete(null)}
                className="px-3.5 py-2 rounded-xl text-zinc-400 hover:text-zinc-100 text-xs font-medium hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingId !== null}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {deletingId ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
