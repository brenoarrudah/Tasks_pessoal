import React, { useState } from 'react';
import { 
  Folders, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Pencil, 
  Trash2, 
  Loader2, 
  Calendar,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAreas, AreaFoco } from '@/contexts/AreasContext';
import { AreaIcon } from '@/components/areas/AreaIcon';
import { AreaModal } from '@/components/areas/AreaModal';
import { DeleteAreaModal } from '@/components/areas/DeleteAreaModal';

export const GestaoAreas: React.FC = () => {
  const { 
    areas, 
    loading, 
    error, 
    createArea, 
    updateArea, 
    deleteArea, 
    reorderArea 
  } = useAreas();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<AreaFoco | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<AreaFoco | null>(null);

  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenCreateModal = () => {
    setSelectedArea(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (area: AreaFoco) => {
    setSelectedArea(area);
    setModalOpen(true);
  };

  const handleOpenDeleteModal = (area: AreaFoco) => {
    setAreaToDelete(area);
    setDeleteModalOpen(true);
  };

  const handleSaveArea = async (data: { nome: string; cor: string; icone: string }) => {
    if (selectedArea) {
      await updateArea(selectedArea.id, data);
      showToast(`Área "${data.nome}" atualizada com sucesso!`);
    } else {
      await createArea(data);
      showToast(`Área "${data.nome}" criada com sucesso!`);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    const name = areaToDelete?.nome || '';
    await deleteArea(id);
    showToast(`Área "${name}" excluída.`);
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    setReorderingId(id);
    await reorderArea(id, direction);
    setReorderingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-blue-500/30 text-zinc-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm">
              <Folders className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
              Gestão de Áreas de Foco
            </h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Organize e categorize suas tarefas pessoais por listas temáticas
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nova Área</span>
        </button>
      </div>

      {/* Mensagem de erro de busca */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-900/50 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Estado de Carregamento (Skeleton / Spinner) */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 flex items-center justify-between animate-pulse"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-zinc-800" />
                <div className="space-y-2">
                  <div className="w-36 h-4 bg-zinc-800 rounded" />
                  <div className="w-24 h-3 bg-zinc-800/60 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-800" />
                <div className="w-8 h-8 rounded-lg bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      ) : areas.length === 0 ? (
        /* Estado Vazio (Empty State) */
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[360px]">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-100">
            Nenhuma Área de Foco Cadastrada
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mt-1.5 mb-6">
            Crie sua primeira lista (ex: Distrital, Clube Águia, M. Jovem, Finanças) para começar a organizar suas tarefas de forma centralizada.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-3 rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 text-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Criar Minha Primeira Lista</span>
          </button>
        </div>
      ) : (
        /* Listagem de Áreas */
        <div className="grid grid-cols-1 gap-3">
          {areas.map((area, index) => {
            const isFirst = index === 0;
            const isLast = index === areas.length - 1;
            const isReordering = reorderingId === area.id;

            const formattedDate = new Date(area.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={area.id}
                className="bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm hover:border-zinc-700/80 group"
              >
                {/* Lado Esquerdo: Ícone + Cor + Nome */}
                <div className="flex items-center gap-3.5">
                  {/* Badge do Ícone com Cor Customizada */}
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: area.cor || '#3B82F6' }}
                  >
                    <AreaIcon name={area.icone} className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-zinc-100 text-base">
                        {area.nome}
                      </h3>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                        Ordem #{area.ordem}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        Criada em {formattedDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Ações de Ordenação, Edição e Exclusão */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto border-t sm:border-t-0 border-zinc-800/60 pt-3 sm:pt-0 w-full sm:w-auto justify-end">
                  {/* Reordenar para Cima */}
                  <button
                    onClick={() => handleReorder(area.id, 'up')}
                    disabled={isFirst || isReordering}
                    title="Mover para cima"
                    className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    {isReordering ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )}
                  </button>

                  {/* Reordenar para Baixo */}
                  <button
                    onClick={() => handleReorder(area.id, 'down')}
                    disabled={isLast || isReordering}
                    title="Mover para baixo"
                    className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    {isReordering ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                  </button>

                  <div className="w-px h-5 bg-zinc-800 mx-1 hidden sm:block" />

                  {/* Editar */}
                  <button
                    onClick={() => handleOpenEditModal(area)}
                    title="Editar área"
                    className="p-2 rounded-xl text-zinc-400 hover:text-blue-400 hover:bg-blue-600/10 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  {/* Excluir */}
                  <button
                    onClick={() => handleOpenDeleteModal(area)}
                    title="Excluir área"
                    className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-600/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      <AreaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveArea}
        areaToEdit={selectedArea}
      />

      {/* Modal de Exclusão (AlertDialog Obrigatório) */}
      <DeleteAreaModal
        isOpen={deleteModalOpen}
        area={areaToDelete}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
};
