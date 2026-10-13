import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { notifyError } from '@/lib/notify';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

export interface AreaFoco {
  id: string;
  id_usuario: string;
  nome: string;
  cor: string;
  icone: string;
  ordem: number;
  created_at: string;
  updated_at: string;
}

interface AreasContextType {
  areas: AreaFoco[];
  loading: boolean;
  error: string | null;
  fetchAreas: () => Promise<void>;
  createArea: (data: { nome: string; cor: string; icone: string }) => Promise<AreaFoco | null>;
  updateArea: (id: string, data: { nome: string; cor: string; icone: string }) => Promise<boolean>;
  deleteArea: (id: string) => Promise<boolean>;
  reorderArea: (id: string, direction: 'up' | 'down') => Promise<boolean>;
}

const AreasContext = createContext<AreasContextType | undefined>(undefined);

export const AreasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [areas, setAreas] = useState<AreaFoco[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeAreaOrders = useCallback(async (items: AreaFoco[]) => {
    if (!user || items.length === 0) return items;

    const updatesNeeded: { id: string; ordem: number }[] = [];
    const normalizedList: AreaFoco[] = items.map((item, index) => {
      const expectedOrdem = index + 1;
      if (item.ordem !== expectedOrdem) {
        updatesNeeded.push({ id: item.id, ordem: expectedOrdem });
        return { ...item, ordem: expectedOrdem };
      }
      return item;
    });

    if (updatesNeeded.length > 0) {
      try {
        const results = await Promise.all(
          updatesNeeded.map(({ id, ordem }) =>
            supabase
              .from('areas_foco')
              .update({ ordem, updated_at: new Date().toISOString() })
              .eq('id', id)
              .eq('id_usuario', user.id)
          )
        );
        if (results.some((r) => r.error)) notifyError();
      } catch {
        notifyError();
      }
    }

    return normalizedList;
  }, [user]);

  const fetchAreas = useCallback(async () => {
    if (!user) {
      setAreas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchErr } = await supabase
        .from('areas_foco')
        .select('*')
        .eq('id_usuario', user.id)
        .order('ordem', { ascending: true })
        .order('created_at', { ascending: true });

      if (fetchErr) throw fetchErr;

      const currentList: AreaFoco[] = data || [];

      // Verificar se há necessidade de normalização (se primeiro item !== 1 ou se houver saltos/buracos)
      const needsNormalization =
        currentList.length > 0 &&
        (currentList[0].ordem !== 1 ||
          currentList.some((item, idx) => item.ordem !== idx + 1));

      if (needsNormalization) {
        // Atualiza imediatamente o estado para refletir a sequência limpa 1, 2, 3...
        const normalizedOptimistic = currentList.map((item, idx) => ({
          ...item,
          ordem: idx + 1,
        }));
        setAreas(normalizedOptimistic);

        // Dispara re-indexação no Supabase em segundo plano
        normalizeAreaOrders(currentList).catch(() => notifyError());
      } else {
        setAreas(currentList);
      }
    } catch (err: unknown) {
      notifyError();
      setError('Não foi possível carregar as áreas de foco.');
    } finally {
      setLoading(false);
    }
  }, [user, normalizeAreaOrders]);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  // Função auxiliar para registrar logs de auditoria programaticamente em logs_sistema
  const logAuditAction = async (
    acao: 'INSERT' | 'UPDATE' | 'DELETE',
    idRegistro: string,
    dadosAnteriores: object | null,
    dadosNovos: object | null
  ) => {
    if (!user) return;
    try {
      await supabase.from('logs_sistema').insert({
        id_usuario: user.id,
        acao,
        tabela: 'areas_foco',
        id_registro: idRegistro,
        dados_anteriores: dadosAnteriores ? JSON.parse(JSON.stringify(dadosAnteriores)) : null,
        dados_novos: dadosNovos ? JSON.parse(JSON.stringify(dadosNovos)) : null,
      });
    } catch (logErr) {
    }
  };

  const createArea = async (data: { nome: string; cor: string; icone: string }) => {
    if (!user) return null;

    try {
      // Nova ordem é a próxima posição contínua (ex: 1, 2, 3...)
      const novaOrdem = areas.length + 1;

      const novaArea = {
        id_usuario: user.id,
        nome: data.nome.trim(),
        cor: data.cor || '#3B82F6',
        icone: data.icone || 'folder',
        ordem: novaOrdem,
      };

      const { data: inserted, error: insertErr } = await supabase
        .from('areas_foco')
        .insert(novaArea)
        .select()
        .single();

      if (insertErr) throw insertErr;

      // Registrar log de auditoria
      if (inserted) {
        await logAuditAction('INSERT', inserted.id, null, inserted);
      }

      await fetchAreas();
      return inserted;
    } catch (err: unknown) {
      throw err;
    }
  };

  const updateArea = async (id: string, data: { nome: string; cor: string; icone: string }) => {
    if (!user) return false;

    try {
      const areaAntiga = areas.find((a) => a.id === id);

      const payload = {
        nome: data.nome.trim(),
        cor: data.cor,
        icone: data.icone,
        updated_at: new Date().toISOString(),
      };

      const { data: updated, error: updateErr } = await supabase
        .from('areas_foco')
        .update(payload)
        .eq('id', id)
        .eq('id_usuario', user.id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      if (updated) {
        await logAuditAction('UPDATE', id, areaAntiga || null, updated);
      }

      await fetchAreas();
      return true;
    } catch (err: unknown) {
      throw err;
    }
  };

  const deleteArea = async (id: string) => {
    if (!user) return false;

    try {
      const areaAntiga = areas.find((a) => a.id === id);

      const { error: deleteErr } = await supabase
        .from('areas_foco')
        .delete()
        .eq('id', id)
        .eq('id_usuario', user.id);

      if (deleteErr) throw deleteErr;

      if (areaAntiga) {
        await logAuditAction('DELETE', id, areaAntiga, null);
      }

      // Re-indexar a lista restante garantindo sequência contínua (1, 2, 3...)
      const remainingAreas = areas
        .filter((a) => a.id !== id)
        .map((area, index) => ({
          ...area,
          ordem: index + 1,
        }));

      // Atualização otimista imediata
      setAreas(remainingAreas);

      // Atualizar no Supabase para fechar lacunas
      if (remainingAreas.length > 0) {
        await Promise.all(
          remainingAreas.map((area) =>
            supabase
              .from('areas_foco')
              .update({ ordem: area.ordem, updated_at: new Date().toISOString() })
              .eq('id', area.id)
              .eq('id_usuario', user.id)
          )
        );
      }

      await fetchAreas();
      return true;
    } catch (err: unknown) {
      throw err;
    }
  };

  const reorderArea = async (id: string, direction: 'up' | 'down') => {
    if (!user || areas.length <= 1) return false;

    const currentIndex = areas.findIndex((a) => a.id === id);
    if (currentIndex === -1) return false;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= areas.length) return false;

    // Criar nova lista reordenada
    const newAreas = [...areas];
    const [movedArea] = newAreas.splice(currentIndex, 1);
    newAreas.splice(targetIndex, 0, movedArea);

    // Forçar o campo ordem a ser estritamente igual ao seu index + 1 (1, 2, 3...)
    const reindexedAreas = newAreas.map((area, index) => ({
      ...area,
      ordem: index + 1,
    }));

    // Atualização otimista imediata na interface
    setAreas(reindexedAreas);

    try {
      // Atualizar todas as ordens no Supabase
      await Promise.all(
        reindexedAreas.map((area) =>
          supabase
            .from('areas_foco')
            .update({ ordem: area.ordem, updated_at: new Date().toISOString() })
            .eq('id', area.id)
            .eq('id_usuario', user.id)
        )
      );

      return true;
    } catch (err: unknown) {
      notifyError();
      await fetchAreas();
      return false;
    }
  };

  return (
    <AreasContext.Provider
      value={{
        areas,
        loading,
        error,
        fetchAreas,
        createArea,
        updateArea,
        deleteArea,
        reorderArea,
      }}
    >
      {children}
    </AreasContext.Provider>
  );
};

export const useAreas = () => {
  const context = useContext(AreasContext);
  if (!context) {
    throw new Error('useAreas deve ser usado dentro de um AreasProvider');
  }
  return context;
};
