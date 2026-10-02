import React, { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { AreaFoco } from '@/contexts/AreasContext';

interface DeleteAreaModalProps {
  isOpen: boolean;
  area: AreaFoco | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export const DeleteAreaModal: React.FC<DeleteAreaModalProps> = ({
  isOpen,
  area,
  onClose,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !area) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await onConfirm(area.id);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setError('Ocorreu um erro ao tentar excluir a área. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* AlertDialog Container */}
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-150 space-y-5">
        
        {/* Header Icon + Title */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-red-950/80 border border-red-900/50 flex items-center justify-center text-red-400 shrink-0 shadow-inner">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-zinc-100">
              Excluir Área de Foco?
            </h3>
            <p className="text-sm text-zinc-400 mt-1">
              Você está prestes a excluir a lista <span className="font-semibold text-zinc-200">"{area.nome}"</span>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Box */}
        <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-3.5 text-xs text-red-300 leading-relaxed">
          <span className="font-semibold block mb-0.5 text-red-200">Atenção:</span>
          Excluir esta lista removerá a categoria de organização. Todas as tarefas e subtarefas vinculadas a ela serão afetadas. Esta ação não pode ser desfeita.
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950 border border-red-900 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Excluindo...</span>
              </>
            ) : (
              <span>Confirmar Exclusão</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
