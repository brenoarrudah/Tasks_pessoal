/**
 * Utilitários de data e fuso horário para America/Sao_Paulo
 */

export function getSaoPauloDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date); // Formato YYYY-MM-DD
}

export function getTodaySaoPauloString(): string {
  return getSaoPauloDateString(new Date());
}

export function parseLocalDateSaoPaulo(dateStr: string): Date {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const y = Number(match[1]);
    const m = Number(match[2]) - 1;
    const d = Number(match[3]);
    return new Date(y, m, d, 12, 0, 0); // Meio-dia local para blindar contra deslocamento de timezone
  }
  return new Date(dateStr);
}

export function isTodaySaoPaulo(dateStr: string | null): boolean {
  if (!dateStr) return false;
  try {
    const taskDate = parseLocalDateSaoPaulo(dateStr);
    return getSaoPauloDateString(taskDate) === getTodaySaoPauloString();
  } catch (e) {
    console.error('Erro ao formatar data:', e);
    return false;
  }
}

export function isOverdueSaoPaulo(dateStr: string | null): boolean {
  if (!dateStr) return false;
  try {
    const taskDate = parseLocalDateSaoPaulo(dateStr);
    return getSaoPauloDateString(taskDate) < getTodaySaoPauloString();
  } catch (e) {
    console.error('Erro ao formatar data:', e);
    return false;
  }
}

export function formatSaoPauloHeaderDate(): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

export interface RecurrenceCalculationParams {
  prazo: string | null;
  repeticao_tipo?: 'dia' | 'semana' | 'mes' | 'ano';
  repeticao_intervalo?: number;
  repeticao_dias_semana?: number[] | null;
}

/**
 * Calcula a próxima data de uma tarefa recorrente com catch-up automático (prevenção de efeito bola de neve).
 * 
 * Regras de negócio:
 * 1. Calcula a próxima data matematicamente (prazo atual + intervalo).
 * 2. Compara essa próxima data com a data atual (hoje no fuso America/Sao_Paulo).
 * 3. Se a data calculada estiver no passado, ignora a matemática base e projeta para hoje
 *    ou para a próxima ocorrência válida a partir de hoje.
 * 4. Para tarefas diárias ('dia'), novoPrazo = max(prazoCalculado, dataAtual).
 */
export function calculateNextRecurrenceDate(params: RecurrenceCalculationParams): Date {
  const baseDate = params.prazo ? parseLocalDateSaoPaulo(params.prazo) : new Date();
  const nextDate = isNaN(baseDate.getTime()) ? new Date() : new Date(baseDate.getTime());
  const intervalo = Math.max(1, params.repeticao_intervalo || 1);
  const tipo = params.repeticao_tipo || 'dia';
  const todayStr = getTodaySaoPauloString();

  const advanceCycle = (target: Date) => {
    if (tipo === 'dia') {
      target.setDate(target.getDate() + intervalo);
    } else if (tipo === 'semana') {
      const diasSemana = (params.repeticao_dias_semana || []).slice().sort((a, b) => a - b);
      if (diasSemana.length > 0) {
        const currentDayOfWeek = target.getDay();
        const nextDayInSameWeek = diasSemana.find((d) => d > currentDayOfWeek);

        if (nextDayInSameWeek !== undefined) {
          const daysToAdd = nextDayInSameWeek - currentDayOfWeek;
          target.setDate(target.getDate() + daysToAdd);
        } else {
          const firstDay = diasSemana[0];
          const daysToAdd = (7 - currentDayOfWeek) + firstDay + ((intervalo - 1) * 7);
          target.setDate(target.getDate() + daysToAdd);
        }
      } else {
        target.setDate(target.getDate() + (intervalo * 7));
      }
    } else if (tipo === 'mes') {
      target.setMonth(target.getMonth() + intervalo);
    } else if (tipo === 'ano') {
      target.setFullYear(target.getFullYear() + intervalo);
    }
  };

  // 1. Calcule a próxima data matematicamente (ex: prazo atual + intervalo)
  advanceCycle(nextDate);

  // 2. Compare essa "próxima data" com a data atual (hoje)
  const isPast = getSaoPauloDateString(nextDate) < todayStr;

  // 3 & 4. Catch-up automático se estiver no passado
  if (isPast) {
    if (tipo === 'dia') {
      // Regra geral: novoPrazo = max(prazoCalculado, dataAtual)
      // Avança dia a dia até alcançar a data atual (hoje), preservando o horário
      let safetyCounter = 0;
      while (getSaoPauloDateString(nextDate) < todayStr && safetyCounter < 500) {
        nextDate.setDate(nextDate.getDate() + 1);
        safetyCounter++;
      }
    } else {
      // Para semana, mês ou ano: avança ciclos até a próxima ocorrência válida a partir de hoje
      let safetyCounter = 0;
      while (getSaoPauloDateString(nextDate) < todayStr && safetyCounter < 500) {
        advanceCycle(nextDate);
        safetyCounter++;
      }
    }
  }

  return nextDate;
}

/**
 * Formata o prazo da tarefa para exibição limpa no card:
 * - Se não houver horário definido: exibe APENAS a data (ex: "12 de Out.")
 * - Se houver horário definido: exibe ambos (ex: "12 de Out., 07:00")
 */
export function formatPrazoComHorario(prazo: string | null, horario?: string | null): string | null {
  if (!prazo) {
    return horario && horario.trim() !== '' ? horario.trim() : null;
  }

  const date = parseLocalDateSaoPaulo(prazo);
  const diaMes = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  // Capitaliza a primeira letra do mês para maior elegância (ex: "12 de out." -> "12 de Out.")
  const diaMesCapitalizado = diaMes.replace(/([a-záéíóúç]+)\.?$/i, (match) => {
    return match.charAt(0).toUpperCase() + match.slice(1).replace('.', '');
  });

  if (horario && horario.trim() !== '') {
    return `${diaMesCapitalizado}, ${horario.trim()}`;
  }

  return diaMesCapitalizado;
}

/**
 * Ordenação cronológica estrita para a lista "Tarefas do Dia" no Dashboard:
 * 1. Ordem crescente de horário (ex: '07:00' vem antes de '14:00')
 * 2. Tarefas sem horário definido (null/vazio) são empurradas para o FINAL da lista do dia
 * 3. Desempate: Prioridade (Alta > Média > Baixa)
 * 4. Desempate final: Data de criação mais recente primeiro
 */
export function sortTasksCronologicamente(a: { horario?: string | null; prioridade?: 'alta' | 'media' | 'baixa'; created_at?: string }, b: { horario?: string | null; prioridade?: 'alta' | 'media' | 'baixa'; created_at?: string }): number {
  const hasTimeA = !!(a.horario && a.horario.trim() !== '');
  const hasTimeB = !!(b.horario && b.horario.trim() !== '');

  // 1. Ordem crescente de horário
  if (hasTimeA && hasTimeB) {
    const timeCompare = a.horario!.trim().localeCompare(b.horario!.trim());
    if (timeCompare !== 0) return timeCompare;
  } else if (hasTimeA && !hasTimeB) {
    return -1; // A tem horário, vem antes
  } else if (!hasTimeA && hasTimeB) {
    return 1; // B tem horário, A sem horário vai para o final
  }

  // 2. Desempate: Prioridade (Alta > Média > Baixa)
  const priorityWeight: Record<string, number> = {
    alta: 1,
    media: 2,
    baixa: 3,
  };
  const weightA = priorityWeight[a.prioridade || 'media'] ?? 2;
  const weightB = priorityWeight[b.prioridade || 'media'] ?? 2;
  if (weightA !== weightB) {
    return weightA - weightB;
  }

  // 3. Desempate final: data de criação (mais novas primeiro)
  const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
  const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
  return timeB - timeA;
}
