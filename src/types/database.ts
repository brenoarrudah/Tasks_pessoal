export type RepeticaoTipo = 'dia' | 'semana' | 'mes' | 'ano';
export type TerminoTipo = 'nunca' | 'data' | 'ocorrencias';
export type PrioridadeTipo = 'alta' | 'media' | 'baixa';
export type MetaStatus = 'em_andamento' | 'concluida' | 'pausada' | 'cancelada';
export type AtributoRpg = 'STR' | 'INT' | 'SPR' | 'CHA' | 'PER';

/**
 * Perfil de Gamificação do Usuário
 * Controla níveis, progressão de experiência (XP), economia virtual e hábitos/streaks
 */
export interface GamificacaoPerfil {
  id: string; // Referência a auth.users(id)
  nivel_atual: number;
  xp_acumulado: number;
  moedas: number;
  gold_atual?: number;
  streak_atual: number;
  ultima_ofensiva_data?: string | null; // 'YYYY-MM-DD'
  atributo_str?: number;
  atributo_int?: number;
  atributo_spr?: number;
  atributo_cha?: number;
  atributo_per?: number;
  hp_atual?: number;
  hp_maximo?: number;
  mp_atual?: number;
  mp_maximo?: number;
  titulo_equipado_id?: string | null;
  titulo_equipado?: ConquistaTitulo | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Catálogo de Títulos e Conquistas
 */
export interface ConquistaTitulo {
  id: string;
  titulo: string;
  descricao: string;
  icone?: string | null;
  condicao_tipo: 'nivel' | 'streak' | 'gold' | string;
  condicao_valor: number;
  condicao_desbloqueio: string;
  created_at?: string;
}

/**
 * Títulos Desbloqueados pelo Usuário
 */
export interface PerfilTituloDesbloqueado {
  id: string;
  id_usuario: string;
  id_titulo: string;
  data_desbloqueio: string;
  titulo_info?: ConquistaTitulo;
}

export type RecompensaTier = 'comum' | 'raro' | 'epico' | 'lendario';

/**
 * Recompensa da Loja / Mercado
 */
export interface LojaRecompensa {
  id: string;
  id_usuario: string;
  titulo: string;
  custo_gold: number;
  icone?: string | null;
  tier?: RecompensaTier | string;
  nivel_minimo?: number;
  created_at?: string;
}

/**
 * Meta de Longo Prazo / Objetivo Macro
 * Agrupa demandas e direciona a progressão das tarefas diárias
 */
export interface MetaMacro {
  id: string;
  id_usuario: string;
  titulo: string;
  descricao?: string | null;
  progresso_atual: number;
  progresso_alvo: number;
  status: MetaStatus | string;
  created_at?: string;
  updated_at?: string;
}

export interface Subtask {
  id: string;
  id_tarefa: string;
  titulo: string;
  concluida: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  id_usuario: string;
  id_area: string | null;
  titulo: string;
  descricao: string | null;
  prazo: string | null;
  horario?: string | null;
  prioridade: PrioridadeTipo;
  concluida: boolean;
  concluida_em: string | null;
  recorrente?: boolean;
  repeticao_intervalo?: number;
  repeticao_tipo?: RepeticaoTipo;
  repeticao_dias_semana?: number[] | null;
  termino_tipo?: TerminoTipo;
  termino_data?: string | null;
  termino_ocorrencias?: number | null;
  ocorrencias_realizadas?: number;
  id_meta_vinculada?: string | null;
  recompensa_xp?: number;
  atributo_alvo?: AtributoRpg | null;
  gerada_por_ia?: boolean;
  penalidade_falha?: string | null;
  created_at: string;
  updated_at: string;
  subtarefas?: Subtask[];
}

// Aliases em português para interoperabilidade
export type Tarefa = Task;
export type Subtarefa = Subtask;
