import React, { useState, useEffect } from 'react';
import { X, Loader2, Target, Award, AlignLeft } from 'lucide-react';
import { useMetas } from '@/contexts/MetasContext';
import { MetaMacro, MetaStatus } from '@/types';

interface MetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  metaToEdit?: MetaMacro | null;
}

export const MetaModal: React.FC<MetaModalProps> = ({
  isOpen,
  onClose,
  metaToEdit,
}) => {
  const { createMeta, updateMeta } = useMetas();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [progressoAlvo, setProgressoAlvo] = useState<number>(100);
  const [progressoAtual, setProgressoAtual] = useState<number>(0);
  const [status, setStatus] = useState<MetaStatus>('em_andamento');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (metaToEdit) {
      setTitulo(metaToEdit.titulo);
      setDescricao(metaToEdit.descricao || '');
      setProgressoAlvo(metaToEdit.progresso_alvo || 100);
      setProgressoAtual(metaToEdit.progresso_atual || 0);
      setStatus((metaToEdit.status as MetaStatus) || 'em_andamento');
    } else {
      setTitulo('');
      setDescricao('');
      setProgressoAlvo(100);
      setProgressoAtual(0);
      setStatus('em_andamento');
    }
    setError(null);
  }, [metaToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('Informe o título do objetivo macro.');
      return;
    }

    if (progressoAlvo <= 0) {
      setError('O progresso alvo deve ser maior que zero.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (metaToEdit) {
        await updateMeta(metaToEdit.id, {
          titulo: titulo.trim(),
          descricao: descricao.trim() || null,
          progresso_alvo: progressoAlvo,
          progresso_atual: progressoAtual,
          status,
        });
      } else {
        await createMeta({
          titulo: titulo.trim(),
          descricao: descricao.trim() || undefined,
          progresso_alvo: progressoAlvo,
          progresso_atual: progressoAtual,
          status,
        });
      }

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar meta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">
                {metaToEdit ? 'Editar Meta Macro' : 'Nova Meta / Projeto'}
              </h2>
              <p className="text-xs text-zinc-400">
                Objetivo estratégico de longo prazo do Jogo Infinito
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Título da Meta */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Título da Meta *
            </label>
            <input
              type="text"
              autoFocus
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Aprender Alemão, Concluir TCC, Correr 100km..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-zinc-400" />
              Descrição / Critérios de Sucesso (Opcional)
            </label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Explique o motivo deste objetivo e como você pretende alcançá-lo..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Configuração de Pontuação / Progresso Alvo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-zinc-400" />
                Progresso Alvo (Total de Pontos/Checks) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={progressoAlvo}
                onChange={(e) => setProgressoAlvo(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
              <p className="text-[11px] text-zinc-500 mt-1">Ex: 100 pontos, 50 tarefas, etc.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Progresso Atual
              </label>
              <input
                type="number"
                min={0}
                value={progressoAtual}
                onChange={(e) => setProgressoAtual(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
              <p className="text-[11px] text-zinc-500 mt-1">Pontos já conquistados até agora</p>
            </div>
          </div>

          {/* Status (quando estiver editando) */}
          {metaToEdit && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Status da Meta
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MetaStatus)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors cursor-pointer"
              >
                <option value="em_andamento">🟡 Em Andamento</option>
                <option value="concluida">🟢 Concluída</option>
                <option value="pausada">⚪ Pausada</option>
                <option value="cancelada">🔴 Cancelada</option>
              </select>
            </div>
          )}

          {/* Rodapé / Ações */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-zinc-100 text-sm font-medium hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !titulo.trim()}
              className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{metaToEdit ? 'Salvar Alterações' : 'Criar Meta'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
