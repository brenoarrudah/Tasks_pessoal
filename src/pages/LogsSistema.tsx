import React from 'react';
import { Activity } from 'lucide-react';

export const LogsSistema: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Logs do Sistema
          </h1>
        </div>
        <p className="text-sm text-zinc-400 mt-1">
          Trilha de auditoria e registro de operações CRUD executadas
        </p>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[320px]">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 flex items-center justify-center text-zinc-500 mb-4 border border-zinc-700/50">
          <Activity className="w-8 h-8 text-orange-400" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-200">
          Módulo de Auditoria de Logs
        </h3>
        <p className="text-sm text-zinc-400 max-w-md mt-1.5">
          Esta tela apresentará a consulta em tempo real da tabela <code className="text-blue-400 bg-zinc-950 px-1.5 py-0.5 rounded">logs_sistema</code> alimentada pelos triggers do banco de dados.
        </p>
      </div>
    </div>
  );
};
