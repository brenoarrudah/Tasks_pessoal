import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useGamificacao } from './GamificacaoContext';
import { notifyError } from '@/lib/notify';
import { dispararConfetes } from '@/lib/confetti';
import { ConquistaTitulo, PerfilTituloDesbloqueado } from '@/types';

interface ConquistasContextType {
  titulos: ConquistaTitulo[];
  desbloqueados: PerfilTituloDesbloqueado[];
  desbloqueadosIds: Set<string>;
  tituloEquipado: ConquistaTitulo | null;
  loading: boolean;
  novoTituloToast: ConquistaTitulo | null;
  fecharNovoTituloToast: () => void;
  fetchTitulosEProgresso: () => Promise<void>;
  verificarConquistas: () => Promise<void>;
  equiparTitulo: (titulo: ConquistaTitulo) => Promise<boolean>;
}

const ConquistasContext = createContext<ConquistasContextType | undefined>(undefined);

// Catálogo base de fallback para garantir que os títulos existam mesmo se a migração ainda não rodou no Supabase
const TITULOS_BASE_FALLBACK: Array<Omit<ConquistaTitulo, 'id'>> = [
  {
    titulo: 'Primeiro Passo',
    descricao: 'Deu início à grande jornada de evolução diária.',
    icone: 'footprints',
    condicao_tipo: 'nivel',
    condicao_valor: 2,
    condicao_desbloqueio: 'Atingir Nível 2',
  },
  {
    titulo: 'Iniciante Resiliente',
    descricao: 'Provou sua constância nos desafios fundamentais.',
    icone: 'shield',
    condicao_tipo: 'nivel',
    condicao_valor: 5,
    condicao_desbloqueio: 'Atingir Nível 5',
  },
  {
    titulo: 'Guerreiro Veterano',
    descricao: 'Demonstrou poder avançado e domínio de rotinas.',
    icone: 'swords',
    condicao_tipo: 'nivel',
    condicao_valor: 10,
    condicao_desbloqueio: 'Atingir Nível 10',
  },
  {
    titulo: 'Foco de Aço',
    descricao: 'Manteve a chama acesa por uma semana completa ininterrupta.',
    icone: 'flame',
    condicao_tipo: 'streak',
    condicao_valor: 7,
    condicao_desbloqueio: 'Atingir 7 dias de Ofensiva',
  },
  {
    titulo: 'Hábito Inabalável',
    descricao: 'Duas semanas de consistência implacável.',
    icone: 'crown',
    condicao_tipo: 'streak',
    condicao_valor: 14,
    condicao_desbloqueio: 'Atingir 14 dias de Ofensiva',
  },
  {
    titulo: 'Mestre da Riqueza',
    descricao: 'Acumulou uma respeitável fortuna em moedas de ouro.',
    icone: 'coins',
    condicao_tipo: 'gold',
    condicao_valor: 500,
    condicao_desbloqueio: 'Acumular 500 Gold',
  },
  {
    titulo: 'Magnata da Produtividade',
    descricao: 'Alcançou o topo da economia de recompensas.',
    icone: 'sparkles',
    condicao_tipo: 'gold',
    condicao_valor: 1000,
    condicao_desbloqueio: 'Acumular 1000 Gold',
  },
];

export const ConquistasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { perfil, equiparTituloPerfil } = useGamificacao();

  const [titulos, setTitulos] = useState<ConquistaTitulo[]>([]);
  const [desbloqueados, setDesbloqueados] = useState<PerfilTituloDesbloqueado[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [novoTituloToast, setNovoTituloToast] = useState<ConquistaTitulo | null>(null);

  const checandoRef = useRef(false);

  const desbloqueadosIds = new Set(desbloqueados.map((d) => d.id_titulo));

  const tituloEquipado = perfil?.titulo_equipado_id
    ? titulos.find((t) => t.id === perfil.titulo_equipado_id) ?? null
    : null;

  const fecharNovoTituloToast = () => setNovoTituloToast(null);

  const fetchTitulosEProgresso = useCallback(async () => {
    if (!user) {
      setTitulos([]);
      setDesbloqueados([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 1. Buscar catálogo de títulos
      let { data: catalogo, error: catErr } = await supabase
        .from('conquistas_titulos')
        .select('*')
        .order('condicao_valor', { ascending: true });

      if (catErr) throw catErr;

      // Se a tabela estiver vazia, popula com os títulos base
      if (!catalogo || catalogo.length === 0) {
        const { data: seeded, error: seedErr } = await supabase
          .from('conquistas_titulos')
          .insert(TITULOS_BASE_FALLBACK)
          .select();

        if (!seedErr && seeded) {
          catalogo = seeded;
        }
      }

      setTitulos(catalogo || []);

      // 2. Buscar títulos desbloqueados do usuário
      const { data: desbloqs, error: desbErr } = await supabase
        .from('perfil_titulos_desbloqueados')
        .select('*, titulo_info:conquistas_titulos(*)')
        .eq('id_usuario', user.id);

      if (desbErr) throw desbErr;

      setDesbloqueados(desbloqs || []);
    } catch {
      notifyError();
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Função central para verificar e desbloquear novos títulos
  const verificarConquistas = useCallback(async () => {
    if (!user || !perfil || titulos.length === 0 || checandoRef.current) return;

    checandoRef.current = true;

    try {
      const currentUnlockedIds = new Set(desbloqueados.map((d) => d.id_titulo));
      const nivel = perfil.nivel_atual ?? 1;
      const streak = perfil.streak_atual ?? 0;
      const gold = perfil.gold_atual ?? perfil.moedas ?? 0;

      for (const t of titulos) {
        if (currentUnlockedIds.has(t.id)) continue;

        let atingiu = false;
        if (t.condicao_tipo === 'nivel' && nivel >= t.condicao_valor) atingiu = true;
        if (t.condicao_tipo === 'streak' && streak >= t.condicao_valor) atingiu = true;
        if (t.condicao_tipo === 'gold' && gold >= t.condicao_valor) atingiu = true;

        if (atingiu) {
          // Desbloquear no Supabase
          const { data: inserted, error: insertErr } = await supabase
            .from('perfil_titulos_desbloqueados')
            .insert({
              id_usuario: user.id,
              id_titulo: t.id,
            })
            .select('*, titulo_info:conquistas_titulos(*)')
            .maybeSingle();

          if (!insertErr && inserted) {
            currentUnlockedIds.add(t.id);
            setDesbloqueados((prev) => [...prev, inserted]);

            // Disparar confetes e Toast Épico
            dispararConfetes();
            setNovoTituloToast(t);
            setTimeout(() => setNovoTituloToast(null), 6000);

            // Se o usuário ainda não tiver nenhum título equipado, equipa este automaticamente
            if (!perfil.titulo_equipado_id) {
              await equiparTituloPerfil(t.id);
            }
          }
        }
      }
    } catch {
      // Falhas silenciosas em verificações de background tratadas pelo barramento global
    } finally {
      checandoRef.current = false;
    }
  }, [user, perfil, titulos, desbloqueados, equiparTituloPerfil]);

  useEffect(() => {
    fetchTitulosEProgresso();
  }, [fetchTitulosEProgresso]);

  // Verificação reativa contínua a cada mudança relevante no perfil
  useEffect(() => {
    if (titulos.length > 0 && perfil) {
      verificarConquistas();
    }
  }, [perfil?.nivel_atual, perfil?.streak_atual, perfil?.gold_atual, titulos.length, verificarConquistas]);

  const equiparTitulo = async (titulo: ConquistaTitulo): Promise<boolean> => {
    if (!desbloqueadosIds.has(titulo.id)) return false;

    const ok = await equiparTituloPerfil(titulo.id);
    if (ok) {
      dispararConfetes();
    }
    return ok;
  };

  return (
    <ConquistasContext.Provider
      value={{
        titulos,
        desbloqueados,
        desbloqueadosIds,
        tituloEquipado,
        loading,
        novoTituloToast,
        fecharNovoTituloToast,
        fetchTitulosEProgresso,
        verificarConquistas,
        equiparTitulo,
      }}
    >
      {children}

      {/* Toast Épico de Novo Título Desbloqueado */}
      {novoTituloToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] max-w-md w-[92%] bg-gradient-to-r from-amber-950 via-zinc-950 to-amber-950 border-2 border-amber-400/80 text-zinc-100 p-4 rounded-2xl shadow-2xl shadow-amber-950/90 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-2.5 rounded-xl bg-amber-500/25 border border-amber-400/50 text-amber-300 shrink-0">
              <span className="text-2xl animate-bounce">🏆</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                Novo Título Desbloqueado!
              </p>
              <p className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 truncate">
                [ {novoTituloToast.titulo} ]
              </p>
              <p className="text-xs text-zinc-400 truncate">
                {novoTituloToast.descricao}
              </p>
            </div>
          </div>
          <button
            onClick={fecharNovoTituloToast}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </ConquistasContext.Provider>
  );
};

export const useConquistas = (): ConquistasContextType => {
  const context = useContext(ConquistasContext);
  if (!context) {
    throw new Error('useConquistas deve ser utilizado dentro de um ConquistasProvider');
  }
  return context;
};
