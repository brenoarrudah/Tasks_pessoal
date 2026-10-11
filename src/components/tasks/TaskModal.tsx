import React, { useState, useEffect } from 'react';
import { X, Loader2, Calendar, Layers, Flag, RotateCcw } from 'lucide-react';
import { useTasks, Task } from '@/contexts/TasksContext';
import { useAreas } from '@/contexts/AreasContext';
import { RecurrenceModal, RecurrenceConfig } from './RecurrenceModal';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  defaultAreaId?: string;
}

const defaultRecurrence: RecurrenceConfig = {
  recorrente: false,
  repeticao_intervalo: 1,
  repeticao_tipo: 'dia',
  termino_tipo: 'nunca',
  termino_data: null,
  termino_ocorrencias: null,
};

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  defaultAreaId,
}) => {
  const { createTask, updateTask } = useTasks();
  const { areas } = useAreas();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prazo, setPrazo] = useState('');
  const [prioridade, setPrioridade] = useState<'alta' | 'media' | 'baixa'>('media');
  const [idArea, setIdArea] = useState<string>('');
  
  // Estado de Recorrência
  const [recurrence, setRecurrence] = useState<RecurrenceConfig>(defaultRecurrence);
  const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (taskToEdit) {
      setTitulo(taskToEdit.titulo);
      setDescricao(taskToEdit.descricao || '');
      setPrazo(taskToEdit.prazo ? new Date(taskToEdit.prazo).toISOString().slice(0, 16) : '');
      setPrioridade(taskToEdit.prioridade || 'media');
      setIdArea(taskToEdit.id_area || '');
      setRecurrence({
        recorrente: !!taskToEdit.recorrente,
        repeticao_intervalo: taskToEdit.repeticao_intervalo || 1,
        repeticao_tipo: taskToEdit.repeticao_tipo || 'dia',
        termino_tipo: taskToEdit.termino_tipo || 'nunca',
        termino_data: taskToEdit.termino_data || null,
        termino_ocorrencias: taskToEdit.termino_ocorrencias || null,
      });
    } else {
      setTitulo('');
      setDescricao('');
      setPrazo('');
      setPrioridade('media');
      setIdArea(defaultAreaId || (areas.length > 0 ? areas[0].id : ''));
      setRecurrence(defaultRecurrence);
    }
    setError(null);
  }, [taskToEdit, defaultAreaId, areas, isOpen]);

  if (!isOpen) return null;

  const formatRecurrenceSummary = (rec: RecurrenceConfig): string => {
    const intervalo = rec.repeticao_intervalo || 1;
    let tipoLabel = '';
    if (rec.repeticao_tipo === 'dia') tipoLabel = intervalo > 1 ? 'dias' : 'dia';
    else if (rec.repeticao_tipo === 'semana') tipoLabel = intervalo > 1 ? 'semanas' : 'semana';
    else if (rec.repeticao_tipo === 'mes') tipoLabel = intervalo > 1 ? 'meses' : 'mês';
    else if (rec.repeticao_tipo === 'ano') tipoLabel = intervalo > 1 ? 'anos' : 'ano';

    let summary = `Repete a cada ${intervalo} ${tipoLabel}`;

    if (rec.termino_tipo === 'data' && rec.termino_data) {
      const parts = rec.termino_data.split('-');
      if (parts.length === 3) {
        summary += ` (até ${parts[2]}/${parts[1]}/${parts[0]})`;
      }
    } else if (rec.termino_tipo === 'ocorrencias' && rec.termino_ocorrencias) {
      summary += ` (${rec.termino_ocorrencias} ocorrências)`;
    }

    return summary;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('Informe o título da tarefa.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formattedPrazo = prazo ? new Date(prazo).toISOString() : null;

      const recurrenceData = {
        recorrente: recurrence.recorrente,
        repeticao_intervalo: recurrence.repeticao_intervalo,
        repeticao_tipo: recurrence.repeticao_tipo,
        termino_tipo: recurrence.termino_tipo,
        termino_data: recurrence.termino_data,
        termino_ocorrencias: recurrence.termino_ocorrencias,
      };

      if (taskToEdit) {
        await updateTask(taskToEdit.id, {
          titulo: titulo.trim(),
          descricao: descricao.trim() || null,
          prazo: formattedPrazo,
          prioridade,
          id_area: idArea || null,
          ...recurrenceData,
        });
      } else {
        await createTask({
          titulo: titulo.trim(),
          descricao: descricao.trim() || undefined,
          prazo: formattedPrazo,
          prioridade,
          id_area: idArea || null,
          ...recurrenceData,
        });
      }

      onClose();
    } catch (err: unknown) {
      console.error(err);
      setError('Falha ao salvar a tarefa. Verifique as informações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              {taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-900/50 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Título */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Título da Tarefa *
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="O que precisa ser feito?"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-zinc-600"
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Descrição (Detalhes / Notas)
              </label>
              <textarea
                rows={3}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Adicione detalhes, observações ou links úteis..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-zinc-600 resize-none"
              />
            </div>

            {/* Grid: Área + Prioridade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Área de Foco */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  Área de Foco
                </label>
                <select
                  value={idArea}
                  onChange={(e) => setIdArea(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="">Sem Área (Geral)</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prioridade */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-zinc-400" />
                  Prioridade
                </label>
                <select
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value as 'alta' | 'media' | 'baixa')}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="alta" className="text-red-400">🔴 Alta</option>
                  <option value="media" className="text-amber-400">🟡 Média</option>
                  <option value="baixa" className="text-zinc-400">🔵 Baixa</option>
                </select>
              </div>

            </div>

            {/* Prazo e Recorrência (Estilo Google Tasks) */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  Prazo / Vencimento (Opcional)
                </label>
                <input
                  type="datetime-local"
                  value={prazo}
                  onChange={(e) => setPrazo(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Botão de Repetir / Chip de Recorrência Configurada */}
              <div>
                {!recurrence.recorrente ? (
                  <button
                    type="button"
                    onClick={() => setIsRecurrenceModalOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 text-xs font-medium transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                    <span>Repetir (Personalizado)</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-600/10 border border-blue-500/20 text-xs">
                    <button
                      type="button"
                      onClick={() => setIsRecurrenceModalOpen(true)}
                      className="flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors cursor-pointer text-left"
                    >
                      <RotateCcw className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="font-medium">
                        {formatRecurrenceSummary(recurrence)}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecurrence(defaultRecurrence)}
                      title="Remover repetição"
                      className="p-1 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800/80 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/60">
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
                  <span>{taskToEdit ? 'Atualizar Tarefa' : 'Criar Tarefa'}</span>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>

      {/* Sub-modal de Recorrência Estilo Google Tasks */}
      <RecurrenceModal
        isOpen={isRecurrenceModalOpen}
        onClose={() => setIsRecurrenceModalOpen(false)}
        onSave={(config) => setRecurrence(config)}
        initialConfig={recurrence}
        initialStartDate={prazo}
      />
    </>
  );
};

