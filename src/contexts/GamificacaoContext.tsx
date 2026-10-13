import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import type { GamificacaoPerfil } from '@/types';

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
}

const GamificacaoContext = createContext<GamificacaoContextType | undefined>(undefined);

export const GamificacaoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<GamificacaoPerfil | null>(null);
  const [loading, setLoading] = useState(true);

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
        setPerfil(data);
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

  return (
    <GamificacaoContext.Provider value={{ perfil, loading, fetchPerfil, ajustarXp }}>
      {children}
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
