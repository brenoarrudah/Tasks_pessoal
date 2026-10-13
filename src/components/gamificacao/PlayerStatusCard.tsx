import React from 'react';
import { Flame, Shield, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useGamificacao, xpParaAtingirNivel } from '@/contexts/GamificacaoContext';

export const PlayerStatusCard: React.FC = () => {
  const { perfil, loading } = useGamificacao();

  if (loading || !perfil) {
    return (
      <div className="h-32 rounded-3xl border border-zinc-800 bg-zinc-900/60 animate-pulse" />
    );
  }

  const nivel = perfil.nivel_atual;
  const xpInicioNivel = xpParaAtingirNivel(nivel);
  const xpProximoNivel = xpParaAtingirNivel(nivel + 1);
  const progressoNivel =
    ((perfil.xp_acumulado - xpInicioNivel) / (xpProximoNivel - xpInicioNivel)) * 100;

  return (
    <section
      id="player-status-card"
      className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-r from-indigo-950/60 via-zinc-900 to-zinc-950 p-6 shadow-xl"
    >
      <div className="absolute -top-10 -left-10 w-44 h-44 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
        {/* Escudo de Nível */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <Shield className="w-14 h-14 text-indigo-400/30 absolute" />
            <span className="text-2xl font-extrabold text-indigo-200 relative">{nivel}</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">Nível Atual</p>
            <p className="text-lg font-bold text-zinc-100">Nível {nivel}</p>
          </div>
        </div>

        {/* Barra de XP */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              XP: {perfil.xp_acumulado} / {xpProximoNivel}
            </span>
            <span className="text-zinc-500">
              faltam {Math.max(0, xpProximoNivel - perfil.xp_acumulado)} XP
            </span>
          </div>
          <Progress
            value={progressoNivel}
            className="h-3"
            indicatorClassName="bg-gradient-to-r from-indigo-500 to-amber-400"
          />
        </div>

        {/* Streak */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 self-start sm:self-auto">
          <Flame className="w-5 h-5 text-orange-400" />
          <div className="leading-tight">
            <p className="text-lg font-bold text-orange-300">🔥 {perfil.streak_atual}</p>
            <p className="text-[10px] uppercase tracking-wider text-orange-400/80">
              {perfil.streak_atual === 1 ? 'dia de ofensiva' : 'dias de ofensiva'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
