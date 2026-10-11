import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { RepeticaoTipo, TerminoTipo } from '@/contexts/TasksContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export interface RecurrenceConfig {
  recorrente: boolean;
  repeticao_intervalo: number;
  repeticao_tipo: RepeticaoTipo;
  repeticao_dias_semana?: number[] | null;
  termino_tipo: TerminoTipo;
  termino_data: string | null;
  termino_ocorrencias: number | null;
}

const DIAS_DA_SEMANA = [
  { value: 0, label: 'D', name: 'Domingo' },
  { value: 1, label: 'S', name: 'Segunda-feira' },
  { value: 2, label: 'T', name: 'Terça-feira' },
  { value: 3, label: 'Q', name: 'Quarta-feira' },
  { value: 4, label: 'Q', name: 'Quinta-feira' },
  { value: 5, label: 'S', name: 'Sexta-feira' },
  { value: 6, label: 'S', name: 'Sábado' },
];

interface RecurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: RecurrenceConfig) => void;
  initialConfig?: Partial<RecurrenceConfig>;
  initialStartDate?: string | null;
}

export const RecurrenceModal: React.FC<RecurrenceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig,
  initialStartDate,
}) => {
  const [intervalo, setIntervalo] = useState<number>(1);
  const [tipo, setTipo] = useState<RepeticaoTipo>('dia');
  const [diasSemana, setDiasSemana] = useState<number[]>([]);
  const [terminoTipo, setTerminoTipo] = useState<TerminoTipo>('nunca');
  const [selectedTerminoDate, setSelectedTerminoDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [terminoOcorrencias, setTerminoOcorrencias] = useState<number>(1);

  useEffect(() => {
    if (isOpen) {
      setIntervalo(initialConfig?.repeticao_intervalo || 1);
      setTipo(initialConfig?.repeticao_tipo || 'dia');
      
      const defaultDay = initialStartDate ? new Date(initialStartDate).getDay() : new Date().getDay();
      if (initialConfig?.repeticao_dias_semana && initialConfig.repeticao_dias_semana.length > 0) {
        setDiasSemana(initialConfig.repeticao_dias_semana);
      } else {
        setDiasSemana([defaultDay]);
      }

      setTerminoTipo(initialConfig?.termino_tipo || 'nunca');
      
      if (initialConfig?.termino_data) {
        const parts = initialConfig.termino_data.split('-').map(Number);
        if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          setSelectedTerminoDate(new Date(parts[0], parts[1] - 1, parts[2]));
        } else {
          const parsed = new Date(initialConfig.termino_data);
          setSelectedTerminoDate(!isNaN(parsed.getTime()) ? parsed : undefined);
        }
      } else {
        setSelectedTerminoDate(undefined);
      }

      setTerminoOcorrencias(initialConfig?.termino_ocorrencias || 5);
      setIsCalendarOpen(false);
    }
  }, [isOpen, initialConfig, initialStartDate]);

  if (!isOpen) return null;

  const toggleDiaSemana = (diaValue: number) => {
    setDiasSemana((prev) => {
      if (prev.includes(diaValue)) {
        return prev.filter((d) => d !== diaValue);
      } else {
        return [...prev, diaValue].sort((a, b) => a - b);
      }
    });
  };

  const handleConcluir = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedTerminoData = terminoTipo === 'data' && selectedTerminoDate
      ? format(selectedTerminoDate, 'yyyy-MM-dd')
      : null;

    onSave({
      recorrente: true,
      repeticao_intervalo: Math.max(1, Number(intervalo) || 1),
      repeticao_tipo: tipo,
      repeticao_dias_semana: tipo === 'semana' && diasSemana.length > 0 ? diasSemana : null,
      termino_tipo: terminoTipo,
      termino_data: formattedTerminoData,
      termino_ocorrencias: terminoTipo === 'ocorrencias' ? Math.max(1, Number(terminoOcorrencias) || 1) : null,
    });
    onClose();
  };

  // Formatação amigável da data de início
  const formattedStartDate = initialStartDate
    ? new Date(initialStartDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'A partir de hoje';

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Dialog Personalizado Estilo Google Tasks */}
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-20 animate-in zoom-in-95 duration-150 text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-zinc-100">
              Repetição personalizada
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConcluir} className="px-6 py-4 space-y-6">
          
          {/* Seção 1: Repetição a cada */}
          <div className="space-y-3">
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Repetição a cada
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="999"
                value={intervalo}
                onChange={(e) => setIntervalo(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-center text-sm font-semibold text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as RepeticaoTipo)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
              >
                <option value="dia">{intervalo > 1 ? 'dias' : 'dia'}</option>
                <option value="semana">{intervalo > 1 ? 'semanas' : 'semana'}</option>
                <option value="mes">{intervalo > 1 ? 'meses' : 'mês'}</option>
                <option value="ano">{intervalo > 1 ? 'anos' : 'ano'}</option>
              </select>
            </div>

            {/* Seleção de Dias da Semana (Estilo Google Tasks) */}
            {tipo === 'semana' && (
              <div className="pt-2 animate-in fade-in duration-150">
                <p className="text-[11px] font-medium text-zinc-400 mb-2">
                  Repetir em:
                </p>
                <div className="flex items-center justify-between gap-1">
                  {DIAS_DA_SEMANA.map((dia) => {
                    const isSelected = diasSemana.includes(dia.value);
                    return (
                      <button
                        key={dia.value}
                        type="button"
                        onClick={() => toggleDiaSemana(dia.value)}
                        title={dia.name}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                            : 'bg-zinc-800/80 hover:bg-zinc-750 text-zinc-400 hover:text-zinc-200 border border-zinc-750'
                        }`}
                      >
                        {dia.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Seção 2: Início */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/60">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
              <CalendarIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span>Início da repetição</span>
            </div>
            <p className="text-sm font-medium text-zinc-200 pl-5.5">
              {formattedStartDate}
            </p>
          </div>

          {/* Seção 3: Término */}
          <div className="space-y-3">
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Término
            </label>

            <div className="space-y-3 pl-1">
              {/* Opção 1: Nunca */}
              <label className="flex items-center gap-3 cursor-pointer select-none text-sm group">
                <input
                  type="radio"
                  name="termino_tipo"
                  value="nunca"
                  checked={terminoTipo === 'nunca'}
                  onChange={() => setTerminoTipo('nunca')}
                  className="w-4 h-4 text-blue-600 bg-zinc-950 border-zinc-700 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-zinc-200 group-hover:text-zinc-100">Nunca</span>
              </label>

              {/* Opção 2: Em (Data limite com DatePicker) */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-3 cursor-pointer select-none text-sm group shrink-0">
                  <input
                    type="radio"
                    name="termino_tipo"
                    value="data"
                    checked={terminoTipo === 'data'}
                    onChange={() => setTerminoTipo('data')}
                    className="w-4 h-4 text-blue-600 bg-zinc-950 border-zinc-700 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-zinc-200 group-hover:text-zinc-100">Em</span>
                </label>

                <div className="flex-1 min-w-0">
                  <Popover
                    open={isCalendarOpen && terminoTipo === 'data'}
                    onOpenChange={(open) => {
                      if (terminoTipo === 'data') {
                        setIsCalendarOpen(open);
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        disabled={terminoTipo !== 'data'}
                        onClick={() => {
                          if (terminoTipo === 'data') {
                            setIsCalendarOpen(true);
                          }
                        }}
                        className={cn(
                          "w-full flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs transition-colors text-left",
                          terminoTipo === 'data'
                            ? "hover:border-zinc-700 focus:outline-hidden focus:border-blue-500 cursor-pointer text-zinc-100"
                            : "opacity-40 cursor-not-allowed text-zinc-500"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CalendarIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className={cn("truncate", selectedTerminoDate ? "text-zinc-100 font-medium" : "text-zinc-500")}>
                            {selectedTerminoDate
                              ? format(selectedTerminoDate, "dd/MM/yyyy", { locale: ptBR })
                              : "Selecionar data"}
                          </span>
                        </div>

                        {selectedTerminoDate && terminoTipo === 'data' && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTerminoDate(undefined);
                            }}
                            title="Remover data"
                            className="p-0.5 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors ml-1"
                          >
                            <X className="w-3 h-3" />
                          </span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 bg-zinc-950 border-zinc-800 shadow-2xl z-[70]" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedTerminoDate}
                        onSelect={(date) => {
                          setSelectedTerminoDate(date);
                          setIsCalendarOpen(false);
                        }}
                        locale={ptBR}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Opção 3: Após (Ocorrências) */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-3 cursor-pointer select-none text-sm group shrink-0">
                  <input
                    type="radio"
                    name="termino_tipo"
                    value="ocorrencias"
                    checked={terminoTipo === 'ocorrencias'}
                    onChange={() => setTerminoTipo('ocorrencias')}
                    className="w-4 h-4 text-blue-600 bg-zinc-950 border-zinc-700 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-zinc-200 group-hover:text-zinc-100">Após</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="999"
                    disabled={terminoTipo !== 'ocorrencias'}
                    value={terminoOcorrencias}
                    onChange={(e) => setTerminoOcorrencias(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-18 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-center text-xs font-semibold text-zinc-100 focus:outline-none focus:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  />
                  <span className={`text-xs ${terminoTipo === 'ocorrencias' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    ocorrências
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé com Botões Arredondados (rounded-full) */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full text-sm font-medium bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              Concluir
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
