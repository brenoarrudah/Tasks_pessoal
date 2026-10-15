import React from 'react';
import { Flame, Shield, Zap, Dumbbell, Brain, Sparkles, Crown, Eye } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useGamificacao, xpParaAtingirNivel } from '@/contexts/GamificacaoContext';
import { cn } from '@/lib/utils';

const ATRIBUTOS_RPG = [
  {
    chave: 'atributo_str' as const,
    sigla: 'STR',
    nome: 'Força',
    subtitulo: 'Vitalidade',
    Icon: Dumbbell,
    accentColor: 'text-rose-400',
    borderColor: 'border-rose-500/20 hover:border-rose-500/40',
    bgColor: 'bg-rose-500/10',
    barColor: 'bg-rose-500',
  },
  {
    chave: 'atributo_int' as const,
    sigla: 'INT',
    nome: 'Inteligência',
    subtitulo: 'Foco',
    Icon: Brain,
    accentColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/20 hover:border-cyan-500/40',
    bgColor: 'bg-cyan-500/10',
    barColor: 'bg-cyan-500',
  },
  {
    chave: 'atributo_spr' as const,
    sigla: 'SPR',
    nome: 'Espírito',
    subtitulo: 'Sabedoria',
    Icon: Sparkles,
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-500/20 hover:border-purple-500/40',
    bgColor: 'bg-purple-500/10',
    barColor: 'bg-purple-500',
  },
  {
    chave: 'atributo_cha' as const,
    sigla: 'CHA',
    nome: 'Carisma',
    subtitulo: 'Liderança',
    Icon: Crown,
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-500/20 hover:border-amber-500/40',
    bgColor: 'bg-amber-500/10',
    barColor: 'bg-amber-500',
  },
  {
    chave: 'atributo_per' as const,
    sigla: 'PER',
    nome: 'Percepção',
    subtitulo: 'Organização',
    Icon: Eye,
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
    bgColor: 'bg-emerald-500/10',
    barColor: 'bg-emerald-500',
  },
];

export const PlayerStatusCard: React.FC = () => {
  const { perfil, loading } = useGamificacao();

  if (loading || !perfil) {
    return (
      <div className="h-44 rounded-3xl border border-zinc-800 bg-zinc-900/60 animate-pulse" />
    );
  }

  const nivel = perfil.nivel_atual;
  const xpInicioNivel = xpParaAtingirNivel(nivel);
  const xpProximoNivel = xpParaAtingirNivel(nivel + 1);
  const progressoNivel =
    ((perfil.xp_acumulado - xpInicioNivel) / (xpProximoNivel - xpInicioNivel)) * 100;

  const totalAtributos =
    (perfil.atributo_str ?? 0) +
    (perfil.atributo_int ?? 0) +
    (perfil.atributo_spr ?? 0) +
    (perfil.atributo_cha ?? 0) +
    (perfil.atributo_per ?? 0);

  return (
    <section
      id="player-status-card"
      className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-r from-indigo-950/60 via-zinc-900 to-zinc-950 p-6 shadow-xl"
    >
      <div className="absolute -top-10 -left-10 w-44 h-44 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Topo: Nível, XP e Streak */}
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

      {/* 5 Pilares de Evolução RPG */}
      <div className="relative z-10 pt-5 mt-5 border-t border-zinc-800/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Pilares de Evolução RPG
            </h3>
          </div>
          <span className="text-[11px] font-medium text-zinc-500">
            Total acumulado: <strong className="text-zinc-300 font-mono">{totalAtributos}</strong> pts
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {ATRIBUTOS_RPG.map((attr) => {
            const valor = perfil[attr.chave] ?? 0;
            const Icon = attr.Icon;
            return (
              <div
                key={attr.sigla}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border p-3.5 transition-all bg-zinc-950/60 backdrop-blur-xs",
                  attr.borderColor
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={cn("p-1.5 rounded-xl border border-zinc-800/80", attr.bgColor, attr.accentColor)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {attr.sigla}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-baseline justify-between">
                    <p className="text-xs font-semibold text-zinc-200">{attr.nome}</p>
                    <span className={cn("text-base font-extrabold font-mono", attr.accentColor)}>
                      {valor}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 truncate">{attr.subtitulo}</p>
                </div>

                {/* Mini-barra de progresso relativa ao ciclo atual (de 10 em 10 pontos) */}
                <div className="mt-2.5 h-1 w-full bg-zinc-800/80 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", attr.barColor)}
                    style={{ width: `${Math.min(100, (valor % 10 === 0 && valor > 0 ? 10 : valor % 10) * 10)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
