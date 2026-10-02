/**
 * Utilitários de data e fuso horário para America/Sao_Paulo
 */

export function getTodaySaoPauloString(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date()); // Formato YYYY-MM-DD
}

export function isTodaySaoPaulo(dateStr: string | null): boolean {
  if (!dateStr) return false;
  try {
    const taskDate = new Date(dateStr);
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(taskDate) === getTodaySaoPauloString();
  } catch (e) {
    console.error('Erro ao formatar data:', e);
    return false;
  }
}

export function isOverdueSaoPaulo(dateStr: string | null): boolean {
  if (!dateStr) return false;
  try {
    const taskDate = new Date(dateStr);
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(taskDate) < getTodaySaoPauloString();
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
