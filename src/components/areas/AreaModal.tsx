import React, { useState, useEffect } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import { AreaFoco } from '@/contexts/AreasContext';
import { AreaIcon, AVAILABLE_ICONS, PRESET_COLORS } from './AreaIcon';

interface AreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { nome: string; cor: string; icone: string }) => Promise<void>;
  areaToEdit?: AreaFoco | null;
}

export const AreaModal: React.FC<AreaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  areaToEdit,
}) => {
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState('#3B82F6');
  const [icone, setIcone] = useState('folder');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (areaToEdit) {
      setNome(areaToEdit.nome);
      setCor(areaToEdit.cor || '#3B82F6');
      setIcone(areaToEdit.icone || 'folder');
    } else {
      setNome('');
      setCor('#3B82F6');
      setIcone('folder');
    }
    setError(null);
  }, [areaToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError('Informe um nome para a área de foco.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave({ nome: nome.trim(), cor, icone });
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setError('Falha ao salvar a área de foco. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/50">
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cor }} />
            {areaToEdit ? 'Editar Área de Foco' : 'Criar Nova Área de Foco'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-900/50 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Nome da Área */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Nome da Lista / Área *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Distrital, Clube Águia, M. Jovem, Finanças"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-zinc-600"
            />
          </div>

          {/* Seletor de Cores */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Cor de Destaque
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setCor(c.hex)}
                  title={c.label}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110 relative"
                  style={{ backgroundColor: c.hex }}
                >
                  {cor === c.hex && (
                    <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Seletor de Ícones */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Ícone
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-44 overflow-y-auto pr-1 p-1 bg-zinc-950/60 border border-zinc-800/80 rounded-xl">
              {AVAILABLE_ICONS.map((item) => {
                const IconComponent = item.Icon;
                const isSelected = icone === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIcone(item.id)}
                    title={item.label}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-medium'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3.5 flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
              style={{ backgroundColor: cor }}
            >
              <AreaIcon name={icone} className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <span className="text-xs text-zinc-500 block uppercase font-medium">Pré-visualização</span>
              <span className="text-sm font-semibold text-zinc-100 truncate block">
                {nome.trim() || 'Nome da Área'}
              </span>
            </div>
          </div>

          {/* Buttons Footer */}
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
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>{areaToEdit ? 'Atualizar Área' : 'Criar Área'}</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
