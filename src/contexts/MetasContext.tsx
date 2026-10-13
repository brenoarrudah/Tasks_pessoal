import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { MetaMacro, MetaStatus } from '@/types';

interface MetasContextType {
  metas: MetaMacro[];
  loading: boolean;
  error: string | null;
  fetchMetas: () => Promise<void>;
  createMeta: (data: {
    titulo: string;
    descricao?: string | null;
    progresso_alvo: number;
    progresso_atual?: number;
    status?: MetaStatus | string;
  }) => Promise<MetaMacro | null>;
  updateMeta: (
    id: string,
    data: {
      titulo?: string;
      descricao?: string | null;
      progresso_alvo?: number;
      progresso_atual?: number;
      status?: MetaStatus | string;
    }
  ) => Promise<boolean>;
  deleteMeta: (id: string) => Promise<boolean>;
  incrementarProgresso: (id: string, quantidade?: number) => Promise<boolean>;
}

const MetasContext = createContext<MetasContextType | undefined>(undefined);

export const MetasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [metas, setMetas] = useState<MetaMacro[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetas = useCallback(async () => {
    if (!user) {
      setMetas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchErr } = await supabase
        .from('metas_macro')
        .select('*')
        .eq('id_usuario', user.id)
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setMetas(data || []);
    } catch (err: unknown) {
      console.error('Erro ao buscar metas macro:', err);
      setError(err instanceof Error ? err.message : 'Falha ao carregar metas');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMetas();
  }, [fetchMetas]);

  const createMeta = async (data: {
    titulo: string;
    descricao?: string | null;
    progresso_alvo: number;
    progresso_atual?: number;
    status?: MetaStatus | string;
  }) => {
    if (!user) return null;

    try {
      const payload = {
        id_usuario: user.id,
        titulo: data.titulo.trim(),
        descricao: data.descricao?.trim() || null,
        progresso_alvo: Math.max(1, Number(data.progresso_alvo) || 100),
        progresso_atual: Math.max(0, Number(data.progresso_atual) || 0),
        status: data.status || 'em_andamento',
      };

      const { data: inserted, error: insertErr } = await supabase
        .from('metas_macro')
        .insert(payload)
        .select()
        .single();

      if (insertErr) throw insertErr;

      await fetchMetas();
      return inserted;
    } catch (err: unknown) {
      console.error('Erro ao criar meta macro:', err);
      throw err;
    }
  };

  const updateMeta = async (
    id: string,
    data: {
      titulo?: string;
      descricao?: string | null;
      progresso_alvo?: number;
      progresso_atual?: number;
      status?: MetaStatus | string;
    }
  ) => {
    if (!user) return false;

    try {
      const payload = {
        ...(data.titulo !== undefined && { titulo: data.titulo.trim() }),
        ...(data.descricao !== undefined && { descricao: data.descricao?.trim() || null }),
        ...(data.progresso_alvo !== undefined && { progresso_alvo: Math.max(1, Number(data.progresso_alvo) || 1) }),
        ...(data.progresso_atual !== undefined && { progresso_atual: Math.max(0, Number(data.progresso_atual) || 0) }),
        ...(data.status !== undefined && { status: data.status }),
        updated_at: new Date().toISOString(),
      };

      const { error: updateErr } = await supabase
        .from('metas_macro')
        .update(payload)
        .eq('id', id)
        .eq('id_usuario', user.id);

      if (updateErr) throw updateErr;

      await fetchMetas();
      return true;
    } catch (err: unknown) {
      console.error('Erro ao atualizar meta macro:', err);
      throw err;
    }
  };

  const deleteMeta = async (id: string) => {
    if (!user) return false;

    try {
      const { error: deleteErr } = await supabase
        .from('metas_macro')
        .delete()
        .eq('id', id)
        .eq('id_usuario', user.id);

      if (deleteErr) throw deleteErr;

      setMetas((prev) => prev.filter((m) => m.id !== id));
      return true;
    } catch (err: unknown) {
      console.error('Erro ao excluir meta macro:', err);
      throw err;
    }
  };

  const incrementarProgresso = async (id: string, quantidade: number = 1) => {
    if (!user) return false;

    const meta = metas.find((m) => m.id === id);
    if (!meta) return false;

    const novoProgresso = Math.min(meta.progresso_alvo, meta.progresso_atual + quantidade);
    const novoStatus = novoProgresso >= meta.progresso_alvo ? 'concluida' : meta.status;

    return updateMeta(id, {
      progresso_atual: novoProgresso,
      status: novoStatus,
    });
  };

  return (
    <MetasContext.Provider
      value={{
        metas,
        loading,
        error,
        fetchMetas,
        createMeta,
        updateMeta,
        deleteMeta,
        incrementarProgresso,
      }}
    >
      {children}
    </MetasContext.Provider>
  );
};

export const useMetas = (): MetasContextType => {
  const context = useContext(MetasContext);
  if (!context) {
    throw new Error('useMetas deve ser utilizado dentro de um MetasProvider');
  }
  return context;
};
