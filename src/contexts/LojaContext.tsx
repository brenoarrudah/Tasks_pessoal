import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useGamificacao } from './GamificacaoContext';
import { notifyError } from '@/lib/notify';
import { dispararConfetes } from '@/lib/confetti';
import { LojaRecompensa } from '@/types';

interface LojaContextType {
  recompensas: LojaRecompensa[];
  loading: boolean;
  toastFeedback: { tipo: 'sucesso' | 'erro'; mensagem: string } | null;
  fecharToast: () => void;
  fetchRecompensas: () => Promise<void>;
  createRecompensa: (data: {
    titulo: string;
    custo_gold: number;
    icone?: string | null;
    tier?: string;
    nivel_minimo?: number;
  }) => Promise<LojaRecompensa | null>;
  deleteRecompensa: (id: string) => Promise<boolean>;
  comprarRecompensa: (recompensa: LojaRecompensa) => Promise<boolean>;
}

const LojaContext = createContext<LojaContextType | undefined>(undefined);

// Itens iniciais padrão sugeridos caso o usuário ainda não tenha cadastrado nenhum
const ITENS_PADRAO = [
  { titulo: '1h de Videojogo', custo_gold: 30, icone: 'gamepad', tier: 'comum', nivel_minimo: 1 },
  { titulo: 'Assistir 1 Episódio de Série', custo_gold: 20, icone: 'tv', tier: 'comum', nivel_minimo: 1 },
  { titulo: 'Café Especial & Lanche', custo_gold: 15, icone: 'coffee', tier: 'comum', nivel_minimo: 1 },
  { titulo: 'Noite da Pizza', custo_gold: 80, icone: 'pizza', tier: 'raro', nivel_minimo: 2 },
  { titulo: 'Comprar um Livro Novo', custo_gold: 120, icone: 'book', tier: 'epico', nivel_minimo: 3 },
];

export const LojaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { perfil, comprarItemGold } = useGamificacao();
  const [recompensas, setRecompensas] = useState<LojaRecompensa[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastFeedback, setToastFeedback] = useState<{ tipo: 'sucesso' | 'erro'; mensagem: string } | null>(null);

  const fecharToast = () => setToastFeedback(null);

  const fetchRecompensas = useCallback(async () => {
    if (!user) {
      setRecompensas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('loja_recompensas')
        .select('*')
        .eq('id_usuario', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Se não houver itens cadastrados para o usuário, inicializa com os padrões
      if (!data || data.length === 0) {
        const payload = ITENS_PADRAO.map((item) => ({
          id_usuario: user.id,
          titulo: item.titulo,
          custo_gold: item.custo_gold,
          icone: item.icone,
          tier: item.tier,
          nivel_minimo: item.nivel_minimo,
        }));

        const { data: seeded, error: seedErr } = await supabase
          .from('loja_recompensas')
          .insert(payload)
          .select();

        if (!seedErr && seeded) {
          setRecompensas(seeded);
          return;
        }
      }

      setRecompensas(data || []);
    } catch {
      notifyError();
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRecompensas();
  }, [fetchRecompensas]);

  const createRecompensa = async (data: {
    titulo: string;
    custo_gold: number;
    icone?: string | null;
    tier?: string;
    nivel_minimo?: number;
  }): Promise<LojaRecompensa | null> => {
    if (!user) return null;

    try {
      const { data: created, error } = await supabase
        .from('loja_recompensas')
        .insert({
          id_usuario: user.id,
          titulo: data.titulo,
          custo_gold: Math.max(1, data.custo_gold),
          icone: data.icone || 'gift',
          tier: data.tier || 'comum',
          nivel_minimo: Math.max(1, data.nivel_minimo ?? 1),
        })
        .select()
        .single();

      if (error) throw error;

      setRecompensas((prev) => [created, ...prev]);
      return created;
    } catch {
      notifyError();
      return null;
    }
  };

  const deleteRecompensa = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('loja_recompensas')
        .delete()
        .eq('id', id)
        .eq('id_usuario', user.id);

      if (error) throw error;

      setRecompensas((prev) => prev.filter((r) => r.id !== id));
      return true;
    } catch {
      notifyError();
      return false;
    }
  };

  const comprarRecompensa = async (recompensa: LojaRecompensa): Promise<boolean> => {
    const nivelAtual = perfil?.nivel_atual ?? 1;
    const nivelMinimo = recompensa.nivel_minimo ?? 1;

    if (nivelAtual < nivelMinimo) {
      setToastFeedback({
        tipo: 'erro',
        mensagem: `Nível insuficiente! Requer Nível ${nivelMinimo}.`,
      });
      setTimeout(() => setToastFeedback(null), 5000);
      return false;
    }

    const res = await comprarItemGold(recompensa.custo_gold);

    if (res.sucesso) {
      dispararConfetes();
      setToastFeedback({
        tipo: 'sucesso',
        mensagem: 'Recompensa Comprada! Aproveite o seu prêmio.',
      });
      setTimeout(() => setToastFeedback(null), 5000);
      return true;
    } else {
      setToastFeedback({
        tipo: 'erro',
        mensagem: 'Gold insuficiente. Complete mais missões!',
      });
      setTimeout(() => setToastFeedback(null), 5000);
      return false;
    }
  };

  return (
    <LojaContext.Provider
      value={{
        recompensas,
        loading,
        toastFeedback,
        fecharToast,
        fetchRecompensas,
        createRecompensa,
        deleteRecompensa,
        comprarRecompensa,
      }}
    >
      {children}

      {/* Toast Feedback de Compra no Mercado */}
      {toastFeedback && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] max-w-md w-[92%] p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5 duration-300 border-2 ${
            toastFeedback.tipo === 'sucesso'
              ? 'bg-gradient-to-r from-amber-950 via-zinc-950 to-amber-950 border-amber-500/60 text-amber-100 shadow-amber-950/80'
              : 'bg-gradient-to-r from-red-950 via-zinc-950 to-red-950 border-red-500/60 text-red-100 shadow-red-950/80'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl shrink-0">
              {toastFeedback.tipo === 'sucesso' ? '🎉' : '⚠️'}
            </span>
            <div className="min-w-0">
              <p
                className={`text-xs font-black uppercase tracking-wider ${
                  toastFeedback.tipo === 'sucesso' ? 'text-amber-400' : 'text-red-400'
                }`}
              >
                {toastFeedback.tipo === 'sucesso' ? 'Mercado de Recompensas' : 'Saldo Insuficiente'}
              </p>
              <p className="text-sm font-bold truncate">{toastFeedback.mensagem}</p>
            </div>
          </div>
          <button
            onClick={fecharToast}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </LojaContext.Provider>
  );
};

export const useLoja = (): LojaContextType => {
  const context = useContext(LojaContext);
  if (!context) {
    throw new Error('useLoja deve ser utilizado dentro de um LojaProvider');
  }
  return context;
};
