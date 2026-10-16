import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  X, 
  Loader2, 
  Calendar as CalendarIcon, 
  Layers, 
  Flag, 
  RotateCcw,
  Clock,
  Target,
  Sparkles,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { useTasks, Task } from '@/contexts/TasksContext';
import { useAreas } from '@/contexts/AreasContext';
import { useMetas } from '@/contexts/MetasContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { RecurrenceModal, RecurrenceConfig } from './RecurrenceModal';
import { parseLocalDateSaoPaulo } from '@/lib/dateUtils';
import type { AtributoRpg } from '@/types';

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
  repeticao_dias_semana: null,
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
  const { metas } = useMetas();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [horario, setHorario] = useState<string>('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [prioridade, setPrioridade] = useState<'alta' | 'media' | 'baixa'>('media');
  const [idArea, setIdArea] = useState<string>('');
  const [idMetaVinculada, setIdMetaVinculada] = useState<string>('');
  const [atributoAlvo, setAtributoAlvo] = useState<AtributoRpg | ''>('');
  
  // Estado de Recorrência
  const [recurrence, setRecurrence] = useState<RecurrenceConfig>(defaultRecurrence);
  const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Metas ativas disponíveis para vinculação
  const activeMetas = metas.filter((m) => m.status === 'em_andamento' || m.id === idMetaVinculada);

  useEffect(() => {
    if (taskToEdit) {
      setTitulo(taskToEdit.titulo);
      setDescricao(taskToEdit.descricao || '');
      if (taskToEdit.prazo) {
        const d = parseLocalDateSaoPaulo(taskToEdit.prazo);
        setSelectedDate(!isNaN(d.getTime()) ? d : undefined);
      } else {
        setSelectedDate(undefined);
      }
      setHorario(taskToEdit.horario || '');
      setPrioridade(taskToEdit.prioridade || 'media');
      setIdArea(taskToEdit.id_area || '');
      setIdMetaVinculada(taskToEdit.id_meta_vinculada || '');
      setAtributoAlvo(taskToEdit.atributo_alvo || '');
      setRecurrence({
        recorrente: !!taskToEdit.recorrente,
        repeticao_intervalo: taskToEdit.repeticao_intervalo || 1,
        repeticao_tipo: taskToEdit.repeticao_tipo || 'dia',
        repeticao_dias_semana: taskToEdit.repeticao_dias_semana || null,
        termino_tipo: taskToEdit.termino_tipo || 'nunca',
        termino_data: taskToEdit.termino_data || null,
        termino_ocorrencias: taskToEdit.termino_ocorrencias || null,
      });
    } else {
      setTitulo('');
      setDescricao('');
      setSelectedDate(undefined);
      setHorario('');
      setPrioridade('media');
      setIdArea(defaultAreaId || (areas.length > 0 ? areas[0].id : ''));
      setIdMetaVinculada('');
      setAtributoAlvo('');
      setRecurrence(defaultRecurrence);
    }
    setError(null);
  }, [taskToEdit, defaultAreaId, areas, isOpen]);

  const isGeradaPorIa = Boolean(taskToEdit?.gerada_por_ia);

  if (!isOpen) return null;

  const formatRecurrenceSummary = (rec: RecurrenceConfig): string => {
    const intervalo = rec.repeticao_intervalo || 1;
    let tipoLabel = '';
    if (rec.repeticao_tipo === 'dia') tipoLabel = intervalo > 1 ? 'dias' : 'dia';
    else if (rec.repeticao_tipo === 'semana') tipoLabel = intervalo > 1 ? 'semanas' : 'semana';
    else if (rec.repeticao_tipo === 'mes') tipoLabel = intervalo > 1 ? 'meses' : 'mês';
    else if (rec.repeticao_tipo === 'ano') tipoLabel = intervalo > 1 ? 'anos' : 'ano';

    let summary = `Repete a cada ${intervalo} ${tipoLabel}`;

    if (rec.repeticao_tipo === 'semana' && rec.repeticao_dias_semana && rec.repeticao_dias_semana.length > 0) {
      const diasLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const diasTexto = rec.repeticao_dias_semana
        .slice()
        .sort((a, b) => a - b)
        .map((d) => diasLabels[d])
        .join(', ');
      summary += ` (${diasTexto})`;
    }

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
    if (isGeradaPorIa) {
      setError('Missões injetadas pelo Arquiteto estão blindadas contra alterações.');
      return;
    }
    if (!titulo.trim()) {
      setError('Informe o título da tarefa.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // A Regra: Se o campo prazo tiver uma data válida (seja a do DatePicker ou a data de fallback de hoje),
      // extrair a data local e formatá-la estritamente como 'YYYY-MM-DD' sem toISOString() para impedir recuo UTC
      const prazoFormatado = selectedDate
        ? format(selectedDate, 'yyyy-MM-dd')
        : (recurrence.recorrente ? format(new Date(), 'yyyy-MM-dd') : null);

      const recurrenceData = {
        recorrente: recurrence.recorrente,
        repeticao_intervalo: recurrence.repeticao_intervalo,
        repeticao_tipo: recurrence.repeticao_tipo,
        repeticao_dias_semana: recurrence.repeticao_dias_semana || null,
        termino_tipo: recurrence.termino_tipo,
        termino_data: recurrence.termino_data,
        termino_ocorrencias: recurrence.termino_ocorrencias,
      };

      const atributoValido: AtributoRpg | null =
        atributoAlvo && ['STR', 'INT', 'SPR', 'CHA', 'PER'].includes(atributoAlvo)
          ? (atributoAlvo as AtributoRpg)
          : null;

      if (taskToEdit) {
        await updateTask(taskToEdit.id, {
          titulo: titulo.trim(),
          descricao: descricao.trim() || null,
          prazo: prazoFormatado,
          horario: horario.trim() || null,
          prioridade,
          id_area: idArea || null,
          id_meta_vinculada: idMetaVinculada || null,
          atributo_alvo: atributoValido,
          ...recurrenceData,
        });
      } else {
        await createTask({
          titulo: titulo.trim(),
          descricao: descricao.trim() || undefined,
          prazo: prazoFormatado,
          horario: horario.trim() || null,
          prioridade,
          id_area: idArea || null,
          id_meta_vinculada: idMetaVinculada || null,
          atributo_alvo: atributoValido,
          ...recurrenceData,
        });
      }

      onClose();
    } catch {
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
        <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              {taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {isGeradaPorIa && (
              <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-start gap-2.5 shadow-lg shadow-red-950/50">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <div className="font-bold text-red-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <span>🔴 Missão de Emergência (O Arquiteto)</span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    Esta diretriz foi injetada diretamente pela IA Autônoma. Título, prazo e área estão blindados contra qualquer alteração.
                  </p>
                  {taskToEdit?.penalidade_falha && (
                    <p className="font-mono font-bold text-red-400">
                      PENALIDADE POR FALHA: {taskToEdit.penalidade_falha}
                    </p>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-900/50 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Título */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center justify-between">
                <span>Título da Tarefa *</span>
                {isGeradaPorIa && (
                  <span className="text-[10px] text-red-400 font-mono flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Bloqueado
                  </span>
                )}
              </label>
              <input
                type="text"
                required
                disabled={isGeradaPorIa}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="O que precisa ser feito?"
                className={cn(
                  "w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-zinc-600",
                  isGeradaPorIa && "opacity-60 cursor-not-allowed bg-zinc-900 border-red-900/40 focus:border-red-900/40 focus:ring-0"
                )}
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Descrição (Detalhes / Notas)
              </label>
              <textarea
                rows={2}
                disabled={isGeradaPorIa}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Adicione detalhes, observações ou links úteis..."
                className={cn(
                  "w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-zinc-600 resize-none",
                  isGeradaPorIa && "opacity-60 cursor-not-allowed bg-zinc-900 border-red-900/40 focus:border-red-900/40 focus:ring-0"
                )}
              />
            </div>

            {/* Grid: Área + Prioridade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Área de Foco */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-zinc-400" />
                    Área de Foco
                  </span>
                  {isGeradaPorIa && (
                    <span className="text-[10px] text-red-400 font-mono flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Bloqueado
                    </span>
                  )}
                </label>
                <select
                  disabled={isGeradaPorIa}
                  value={idArea}
                  onChange={(e) => setIdArea(e.target.value)}
                  className={cn(
                    "w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer",
                    isGeradaPorIa && "opacity-60 cursor-not-allowed bg-zinc-900 border-red-900/40"
                  )}
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

            {/* Grid: Atributo de Evolução RPG + Vínculo com Meta Macro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Atributo de Evolução */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Atributo de Evolução
                </label>
                <select
                  value={atributoAlvo}
                  onChange={(e) => setAtributoAlvo(e.target.value as AtributoRpg | '')}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="">Apenas XP Geral (Nenhum)</option>
                  <option value="STR">⚔️ Força / Vitalidade (STR)</option>
                  <option value="INT">🧠 Inteligência / Foco (INT)</option>
                  <option value="SPR">✨ Espírito / Sabedoria (SPR)</option>
                  <option value="CHA">👑 Carisma / Liderança (CHA)</option>
                  <option value="PER">👁️ Percepção / Organização (PER)</option>
                </select>
              </div>

              {/* Vínculo com Meta Macro */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-400" />
                  Vincular a Meta Macro
                </label>
                <select
                  value={idMetaVinculada}
                  onChange={(e) => setIdMetaVinculada(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="">Nenhuma meta (Avulsa)</option>
                  {activeMetas.map((m) => (
                    <option key={m.id} value={m.id}>
                      🎯 {m.titulo} ({m.progresso_atual}/{m.progresso_alvo} pts)
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Prazo e Recorrência (Estilo Google Tasks) */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-zinc-400" />
                  Prazo e Horário (Opcionais)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild disabled={isGeradaPorIa}>
                        <button
                          type="button"
                          disabled={isGeradaPorIa}
                          className={cn(
                            "w-full flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm transition-all text-left cursor-pointer",
                            "hover:border-zinc-700 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
                            !selectedDate && "text-zinc-500",
                            isGeradaPorIa && "opacity-60 cursor-not-allowed bg-zinc-900 border-red-900/40 hover:border-red-900/40"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <CalendarIcon className="w-4 h-4 text-zinc-400 shrink-0" />
                            <span className={cn("truncate", selectedDate ? "text-zinc-100 font-medium" : "text-zinc-500")}>
                              {selectedDate
                                ? format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                                : "Selecione uma data"}
                            </span>
                          </div>

                          {selectedDate && !isGeradaPorIa && (
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDate(undefined);
                              }}
                              title="Remover data"
                              className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2 bg-zinc-950 border-zinc-800 shadow-2xl" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            setIsCalendarOpen(false);
                          }}
                          locale={ptBR}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Input de Horário Opcional */}
                  <div className="relative">
                    <div className={cn(
                      "flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm hover:border-zinc-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors h-full",
                      isGeradaPorIa && "opacity-60 cursor-not-allowed bg-zinc-900 border-red-900/40"
                    )}>
                      <Clock className="w-4 h-4 text-zinc-400 shrink-0 mr-2" />
                      <input
                        type="time"
                        disabled={isGeradaPorIa}
                        value={horario}
                        onChange={(e) => setHorario(e.target.value)}
                        title="Definir horário (opcional)"
                        className="w-full bg-transparent text-zinc-100 text-sm focus:outline-hidden [color-scheme:dark] cursor-pointer disabled:cursor-not-allowed"
                      />
                      {horario && !isGeradaPorIa && (
                        <button
                          type="button"
                          onClick={() => setHorario('')}
                          title="Limpar horário"
                          className="p-0.5 rounded text-zinc-500 hover:text-zinc-200 transition-colors ml-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão de Repetir / Chip de Recorrência Configurada */}
              <div>
                {!recurrence.recorrente ? (
                  <button
                    type="button"
                    disabled={isGeradaPorIa}
                    onClick={() => setIsRecurrenceModalOpen(true)}
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 text-xs font-medium transition-all cursor-pointer",
                      isGeradaPorIa && "opacity-50 cursor-not-allowed pointer-events-none"
                    )}
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                    <span>Repetir (Personalizado)</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-600/10 border border-blue-500/20 text-xs">
                    <button
                      type="button"
                      disabled={isGeradaPorIa}
                      onClick={() => setIsRecurrenceModalOpen(true)}
                      className={cn(
                        "flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors cursor-pointer text-left",
                        isGeradaPorIa && "cursor-not-allowed"
                      )}
                    >
                      <RotateCcw className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="font-medium">
                        {formatRecurrenceSummary(recurrence)}
                      </span>
                    </button>
                    {!isGeradaPorIa && (
                      <button
                        type="button"
                        onClick={() => setRecurrence(defaultRecurrence)}
                        title="Remover repetição"
                        className="p-1 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800/80 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
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
                {isGeradaPorIa ? 'Fechar' : 'Cancelar'}
              </button>

              {isGeradaPorIa ? (
                <button
                  type="button"
                  disabled
                  title="Missões injetadas pelo Arquiteto não podem ser editadas."
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-red-950/40 border border-red-500/40 text-red-300 flex items-center gap-2 cursor-not-allowed"
                >
                  <Lock className="w-4 h-4 text-red-400" />
                  <span>Edição Bloqueada</span>
                </button>
              ) : (
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
              )}
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
        initialStartDate={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null}
      />
    </>
  );
};

