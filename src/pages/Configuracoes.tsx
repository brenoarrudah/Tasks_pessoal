import React from 'react';
import { Settings, User, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Configuracoes: React.FC = () => {
  const { user, profile } = useAuth();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700/50">
            <Settings className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Configurações
          </h1>
        </div>
        <p className="text-sm text-zinc-400 mt-1">
          Preferências de perfil, fuso horário e sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cartão de Perfil */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Perfil do Usuário</h3>
              <p className="text-xs text-zinc-400">Informações da conta autenticada</p>
            </div>
          </div>
          <div className="space-y-3 pt-2 text-sm">
            <div>
              <span className="text-xs font-medium text-zinc-400 block uppercase">Nome</span>
              <span className="text-zinc-200 font-medium">
                {profile?.nome || user?.user_metadata?.full_name || 'Usuário Gestor'}
              </span>
            </div>
            <div>
              <span className="text-xs font-medium text-zinc-400 block uppercase">E-mail</span>
              <span className="text-zinc-200 font-medium">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Cartão de Preferências */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Preferências do Sistema</h3>
              <p className="text-xs text-zinc-400">Configurações regionais e tema</p>
            </div>
          </div>
          <div className="space-y-3 pt-2 text-sm">
            <div>
              <span className="text-xs font-medium text-zinc-400 block uppercase">Fuso Horário Padrão</span>
              <span className="text-zinc-200 font-medium">America/Sao_Paulo (UTC-3)</span>
            </div>
            <div>
              <span className="text-xs font-medium text-zinc-400 block uppercase">Tema da Interface</span>
              <span className="text-zinc-200 font-medium">Modo Escuro (Dark Mode)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
