import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { notifyError } from '@/lib/notify';
import { supabase } from '@/lib/supabase';
import { Flame, Crown } from 'lucide-react';
import { useAuth } from './AuthContext';
import { getTodaySaoPauloString, parseLocalDateSaoPaulo } from '@/lib/dateUtils';
import { dispararConfetesLevelUp } from '@/lib/confetti';
import type { GamificacaoPerfil, AtributoRpg, PrioridadeTipo } from '@/types';

/** Diferença em dias inteiros entre duas datas 'YYYY-MM-DD' (b - a) */
const diffDias = (a: string, b: string): number => {
  const da = parseLocalDateSaoPaulo(a);
  const db = parseLocalDateSaoPaulo(b);
  return Math.round((db.getTime() - da.getTime()) / 86400000);
};

/**
 * Curva de nível: para sair do nível N são necessários N * 100 XP.
 * XP total acumulado necessário para ATINGIR o nível N = 50 * (N - 1) * N
 * (Nível 2 = 100, Nível 3 = 300, Nível 4 = 600, ...)
 */
export const xpParaAtingirNivel = (nivel: number): number => 50 * (nivel - 1) * nivel;

export const calcularNivel = (xp: number): number => {
  let nivel = 1;
  while (xpParaAtingirNivel(nivel + 1) <= xp) nivel++;
  return nivel;
};

const mapaAtributoColuna: Record<AtributoRpg, keyof GamificacaoPerfil> = {
  STR: 'atributo_str',
  INT: 'atributo_int',
  SPR: 'atributo_spr',
  CHA: 'atributo_cha',
  PER: 'atributo_per',
};

interface GamificacaoContextType {
  perfil: GamificacaoPerfil | null;
  loading: boolean;
  fetchPerfil: () => Promise<void>;
  ajustarXp: (delta: number) => Promise<boolean>;
  ajustarAtributo: (atributo: AtributoRpg, delta: number) => Promise<boolean>;
  consumirEnergiaTarefa: (prioridade?: PrioridadeTipo, atributo?: AtributoRpg | null, isConclusao?: boolean) => Promise<boolean>;
  descansarCompleto: () => Promise<boolean>;
  registrarVitoriaDiaria: () => Promise<boolean>;
}

const GamificacaoContext = createContext<GamificacaoContextType | undefined>(undefined);

export const GamificacaoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<GamificacaoPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [celebracao, setCelebracao] = useState<string | null>(null);
  const [levelUpNivel, setLevelUpNivel] = useState<number | null>(null);

  const fetchPerfil = useCallback(async () => {
    if (!user) {
      setPerfil(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('gamificacao_perfil')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const perfilNormalizado: GamificacaoPerfil = {
          ...data,
          atributo_str: data.atributo_str ?? 0,
          atributo_int: data.atributo_int ?? 0,
          atributo_spr: data.atributo_spr ?? 0,
          atributo_cha: data.atributo_cha ?? 0,
          atributo_per: data.atributo_per ?? 0,
          hp_atual: data.hp_atual ?? 100,
          hp_maximo: data.hp_maximo ?? 100,
          mp_atual: data.mp_atual ?? 50,
          mp_maximo: data.mp_maximo ?? 50,
        };

        // Aversão à perda: se falhou o dia de ontem inteiro (diferença > 1 dia), zera a ofensiva
        const hoje = getTodaySaoPauloString();
        if (
          data.streak_atual > 0 &&
          data.ultima_ofensiva_data &&
          diffDias(data.ultima_ofensiva_data, hoje) > 1
        ) {
          const { error: resetErr } = await supabase
            .from('gamificacao_perfil')
            .update({ streak_atual: 0, updated_at: new Date().toISOString() })
            .eq('id', user.id);
          if (resetErr) throw resetErr;
          setPerfil({ ...perfilNormalizado, streak_atual: 0 });
        } else {
          setPerfil(perfilNormalizado);
        }
      } else {
        // Cria o perfil caso ainda não exista para este usuário
        const { data: created, error: insertErr } = await supabase
          .from('gamificacao_perfil')
          .insert({
            id: user.id,
            nivel_atual: 1,
            xp_acumulado: 0,
            moedas: 0,
            streak_atual: 0,
            atributo_str: 0,
            atributo_int: 0,
            atributo_spr: 0,
            atributo_cha: 0,
            atributo_per: 0,
            hp_atual: 100,
            hp_maximo: 100,
            mp_atual: 50,
            mp_maximo: 50,
          })
          .select()
          .single();
        if (insertErr) throw insertErr;
        setPerfil(created);
      }
    } catch (err) {
      notifyError();
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPerfil();
  }, [fetchPerfil]);

  const ajustarXp = async (delta: number) => {
    if (!user || !delta) return false;

    try {
      // Valor mais recente do banco para evitar divergência
      const { data: atual, error: fetchErr } = await supabase
        .from('gamificacao_perfil')
        .select('xp_acumulado')
        .eq('id', user.id)
        .maybeSingle();
      if (fetchErr) throw fetchErr;

      const xpAnterior = atual?.xp_acumulado ?? perfil?.xp_acumulado ?? 0;
      const nivelAnterior = calcularNivel(xpAnterior);
      const novoXp = Math.max(0, xpAnterior + delta);
      const novoNivel = calcularNivel(novoXp);

      // Gatilho Level Up: confetes dourados e alerta épico
      if (delta > 0 && novoNivel > nivelAnterior) {
        dispararConfetesLevelUp();
        setLevelUpNivel(novoNivel);
      }

      // Atualização otimista: barra reage imediatamente
      setPerfil((prev) =>
        prev ? { ...prev, xp_acumulado: novoXp, nivel_atual: novoNivel } : prev
      );

      const { error: updateErr } = await supabase
        .from('gamificacao_perfil')
        .update({
          xp_acumulado: novoXp,
          nivel_atual: novoNivel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateErr) {
        await fetchPerfil();
        throw updateErr;
      }
      return true;
    } catch (err) {
      notifyError();
      return false;
    }
  };

  const ajustarAtributo = async (atributo: AtributoRpg, delta: number) => {
    if (!user || !delta || !atributo) return false;

    const coluna = mapaAtributoColuna[atributo];
    if (!coluna) return false;

    try {
      // Valor mais recente do banco para evitar divergência
      const { data: atual, error: fetchErr } = await supabase
        .from('gamificacao_perfil')
        .select(coluna)
        .eq('id', user.id)
        .maybeSingle();
      if (fetchErr) throw fetchErr;

      const valorAtual = Number(atual?.[coluna as keyof typeof atual] ?? perfil?.[coluna] ?? 0);
      const novoValor = Math.max(0, valorAtual + delta);

      // Atualização otimista
      setPerfil((prev) => (prev ? { ...prev, [coluna]: novoValor } : prev));

      const { error: updateErr } = await supabase
        .from('gamificacao_perfil')
        .update({
          [coluna]: novoValor,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateErr) {
        await fetchPerfil();
        throw updateErr;
      }
      return true;
    } catch {
      notifyError();
      return false;
    }
  };

  const registrarVitoriaDiaria = async () => {
    if (!user) return false;

    try {
      const { data: atual, error: fetchErr } = await supabase
        .from('gamificacao_perfil')
        .select('streak_atual, ultima_ofensiva_data')
        .eq('id', user.id)
        .maybeSingle();
      if (fetchErr) throw fetchErr;

      const hoje = getTodaySaoPauloString();
      // Já ganhou a ofensiva de hoje: não duplica
      if (atual?.ultima_ofensiva_data === hoje) return false;

      const novoStreak = (atual?.streak_atual ?? 0) + 1;

      setPerfil((prev) =>
        prev ? { ...prev, streak_atual: novoStreak, ultima_ofensiva_data: hoje } : prev
      );

      const { error: updateErr } = await supabase
        .from('gamificacao_perfil')
        .update({
          streak_atual: novoStreak,
          ultima_ofensiva_data: hoje,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateErr) {
        await fetchPerfil();
        throw updateErr;
      }

      setCelebracao(`Vitória Diária! Ofensiva aumentada para ${novoStreak} 🔥`);
      setTimeout(() => setCelebracao(null), 4500);
      return true;
    } catch (err) {
      notifyError();
      return false;
    }
  };

  const consumirEnergiaTarefa = async (
    prioridade: PrioridadeTipo = 'media',
    atributo?: AtributoRpg | null,
    isConclusao: boolean = true
  ) => {
    if (!user) return false;

    // Regra Base de Custo: Alta = 15, Média = 10, Baixa = 5
    const custo = prioridade === 'alta' ? 15 : prioridade === 'baixa' ? 5 : 10;
    const delta = isConclusao ? -custo : custo;

    // Filtro de Atributo: STR ou sem atributo -> hp_atual; INT, PER, SPR, CHA -> mp_atual
    const isFisico = !atributo || atributo === 'STR';
    const campoAtual = isFisico ? 'hp_atual' : 'mp_atual';
    const campoMaximo = isFisico ? 'hp_maximo' : 'mp_maximo';

    try {
      const { data: atual, error: fetchErr } = await supabase
        .from('gamificacao_perfil')
        .select(`${campoAtual}, ${campoMaximo}`)
        .eq('id', user.id)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      const defaultMax = isFisico ? 100 : 50;
      const valAtual = Number(atual?.[campoAtual as keyof typeof atual] ?? perfil?.[campoAtual] ?? defaultMax);
      const valMaximo = Number(atual?.[campoMaximo as keyof typeof atual] ?? perfil?.[campoMaximo] ?? defaultMax);
      const novoValor = Math.max(0, Math.min(valMaximo, valAtual + delta));

      setPerfil((prev) => (prev ? { ...prev, [campoAtual]: novoValor } : prev));

      const { error: updateErr } = await supabase
        .from('gamificacao_perfil')
        .update({
          [campoAtual]: novoValor,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateErr) {
        await fetchPerfil();
        throw updateErr;
      }
      return true;
    } catch {
      notifyError();
      return false;
    }
  };

  const descansarCompleto = async () => {
    if (!user) return false;

    try {
      const { data: atual, error: fetchErr } = await supabase
        .from('gamificacao_perfil')
        .select('hp_maximo, mp_maximo')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      const hpMax = Number(atual?.hp_maximo ?? perfil?.hp_maximo ?? 100);
      const mpMax = Number(atual?.mp_maximo ?? perfil?.mp_maximo ?? 50);

      setPerfil((prev) => (prev ? { ...prev, hp_atual: hpMax, mp_atual: mpMax } : prev));

      const { error: updateErr } = await supabase
        .from('gamificacao_perfil')
        .update({
          hp_atual: hpMax,
          mp_atual: mpMax,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateErr) {
        await fetchPerfil();
        throw updateErr;
      }

      setCelebracao('HP e MP totalmente restaurados! 🏕️💤');
      setTimeout(() => setCelebracao(null), 4500);
      return true;
    } catch {
      notifyError();
      return false;
    }
  };

  return (
    <GamificacaoContext.Provider
      value={{
        perfil,
        loading,
        fetchPerfil,
        ajustarXp,
        ajustarAtributo,
        consumirEnergiaTarefa,
        descansarCompleto,
        registrarVitoriaDiaria,
      }}
    >
      {children}

      {/* Toast comemorativo de Ofensiva / Vitória Diária */}
      {celebracao && (
        <div className="fixed bottom-6 right-6 z-[60] bg-zinc-900 border border-orange-500/40 text-zinc-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <Flame className="w-5 h-5 text-orange-400 shrink-0" />
          <span className="text-sm font-semibold">{celebracao}</span>
        </div>
      )}

      {/* Modal / Overlay Épico de Level Up (Solo Leveling) */}
      {levelUpNivel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Efeito de Glow na tela inteira */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md pointer-events-auto"
            onClick={() => setLevelUpNivel(null)}
          />
          <div className="fixed inset-0 pointer-events-none ring-8 ring-amber-400/40 animate-pulse shadow-inner" />

          {/* Card de Level Up Estilo Solo Leveling */}
          <div className="relative z-10 w-full max-w-sm rounded-3xl border-2 border-amber-400/70 bg-gradient-to-b from-indigo-950 via-zinc-950 to-zinc-950 p-6 text-center shadow-2xl shadow-amber-500/30 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-36 h-36 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />

            <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/20">
              <Crown className="w-9 h-9 text-amber-400 animate-bounce" />
            </div>

            <p className="text-[11px] font-black tracking-widest text-amber-400 uppercase">
              Solo Leveling • Notificação do Sistema
            </p>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 my-1 tracking-tight">
              LEVEL UP!
            </h2>
            <p className="text-sm text-zinc-300 mb-5">
              Você alcançou o <strong className="text-amber-300 font-extrabold">Nível {levelUpNivel}</strong>! O seu poder e atributos foram elevados.
            </p>

            <button
              onClick={() => setLevelUpNivel(null)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:from-amber-600 active:to-amber-700 text-zinc-950 font-extrabold text-sm tracking-wide shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
            >
              Continuar Jornada
            </button>
          </div>
        </div>
      )}
    </GamificacaoContext.Provider>
  );
};

export const useGamificacao = (): GamificacaoContextType => {
  const context = useContext(GamificacaoContext);
  if (!context) {
    throw new Error('useGamificacao deve ser utilizado dentro de um GamificacaoProvider');
  }
  return context;
};
