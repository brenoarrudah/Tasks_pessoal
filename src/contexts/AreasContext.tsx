import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
      setAreas(data || []);
    } catch (err: unknown) {
      console.error('Erro ao carregar áreas de foco:', err);
      setError('Não foi possível carregar as áreas de foco.');
    } finally {
      setLoading(false);
    }
  }, [user]);

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
      console.warn('Erro ao registrar log de auditoria para áreas_foco:', logErr);
    }
  };

  const createArea = async (data: { nome: string; cor: string; icone: string }) => {
    if (!user) return null;

    try {
      // Calcular a maior ordem atual para colocar a nova área ao final
      const maxOrdem = areas.reduce((max, area) => (area.ordem > max ? area.ordem : max), -1);
      const novaOrdem = maxOrdem + 1;

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
      console.error('Erro ao criar área:', err);
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
      console.error('Erro ao atualizar área:', err);
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

      await fetchAreas();
      return true;
    } catch (err: unknown) {
      console.error('Erro ao excluir área:', err);
      throw err;
    }
  };

  const reorderArea = async (id: string, direction: 'up' | 'down') => {
    if (!user || areas.length <= 1) return false;

    const currentIndex = areas.findIndex((a) => a.id === id);
    if (currentIndex === -1) return false;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= areas.length) return false;

    const currentArea = areas[currentIndex];
    const targetArea = areas[targetIndex];

    try {
      // Inverter valores de ordem
      const tempOrdem = currentArea.ordem;
      const targetOrdem = targetArea.ordem === tempOrdem 
        ? (direction === 'up' ? tempOrdem - 1 : tempOrdem + 1)
        : targetArea.ordem;

      // Atualizar ambos em lote
      await Promise.all([
        supabase.from('areas_foco').update({ ordem: targetOrdem }).eq('id', currentArea.id),
        supabase.from('areas_foco').update({ ordem: tempOrdem }).eq('id', targetArea.id),
      ]);

      await fetchAreas();
      return true;
    } catch (err: unknown) {
      console.error('Erro ao reordenar áreas:', err);
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
