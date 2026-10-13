import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Flame } from 'lucide-react';
import { useAuth } from './AuthContext';
import { getTodaySaoPauloString, parseLocalDateSaoPaulo } from '@/lib/dateUtils';
import type { GamificacaoPerfil } from '@/types';

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

interface GamificacaoContextType {
  perfil: GamificacaoPerfil | null;
  loading: boolean;
  fetchPerfil: () => Promise<void>;
  ajustarXp: (delta: number) => Promise<boolean>;
  registrarVitoriaDiaria: () => Promise<boolean>;
}

const GamificacaoContext = createContext<GamificacaoContextType | undefined>(undefined);

export const GamificacaoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<GamificacaoPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [celebracao, setCelebracao] = useState<string | null>(null);

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
          setPerfil({ ...data, streak_atual: 0 });
        } else {
          setPerfil(data);
        }
      } else {
        // Cria o perfil caso ainda não exista para este usuário
        const { data: created, error: insertErr } = await supabase
          .from('gamificacao_perfil')
          .insert({ id: user.id, nivel_atual: 1, xp_acumulado: 0, moedas: 0, streak_atual: 0 })
          .select()
          .single();
        if (insertErr) throw insertErr;
        setPerfil(created);
      }
    } catch (err) {
      console.error('Erro ao buscar perfil de gamificação:', err);
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

      const novoXp = Math.max(0, (atual?.xp_acumulado ?? 0) + delta);
      const novoNivel = calcularNivel(novoXp);

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
      console.error('Erro ao ajustar XP:', err);
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
      console.error('Erro ao registrar vitória diária:', err);
      return false;
    }
  };

  return (
    <GamificacaoContext.Provider
      value={{ perfil, loading, fetchPerfil, ajustarXp, registrarVitoriaDiaria }}
    >
      {children}

      {/* Toast comemorativo de Vitória Diária */}
      {celebracao && (
        <div className="fixed bottom-6 right-6 z-[60] bg-zinc-900 border border-orange-500/40 text-zinc-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <Flame className="w-5 h-5 text-orange-400 shrink-0" />
          <span className="text-sm font-semibold">{celebracao}</span>
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
