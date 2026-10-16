import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Shield, Zap, Brain, Sparkles, Users, Target, Heart, Bed, Coins } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useGamificacao, xpParaAtingirNivel } from '@/contexts/GamificacaoContext';
import { cn } from '@/lib/utils';

const ATRIBUTOS_RPG = [
  {
    chave: 'atributo_str' as const,
    sigla: 'STR',
    nome: 'Força',
    subtitulo: 'Vitalidade',
    Icon: Flame,
    accentColor: 'text-red-400',
    borderColor: 'border-red-500/25 hover:border-red-500/50 hover:shadow-red-500/10',
    bgColor: 'bg-red-500/10',
    barColor: 'bg-red-500',
  },
  {
    chave: 'atributo_int' as const,
    sigla: 'INT',
    nome: 'Inteligência',
    subtitulo: 'Foco',
    Icon: Brain,
    accentColor: 'text-blue-400',
    borderColor: 'border-blue-500/25 hover:border-blue-500/50 hover:shadow-blue-500/10',
    bgColor: 'bg-blue-500/10',
    barColor: 'bg-blue-500',
  },
  {
    chave: 'atributo_spr' as const,
    sigla: 'SPR',
    nome: 'Espírito',
    subtitulo: 'Sabedoria',
    Icon: Sparkles,
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-500/25 hover:border-amber-500/50 hover:shadow-amber-500/10',
    bgColor: 'bg-amber-500/10',
    barColor: 'bg-amber-400',
  },
  {
    chave: 'atributo_cha' as const,
    sigla: 'CHA',
    nome: 'Carisma',
    subtitulo: 'Liderança',
    Icon: Users,
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/25 hover:border-emerald-500/50 hover:shadow-emerald-500/10',
    bgColor: 'bg-emerald-500/10',
    barColor: 'bg-emerald-500',
  },
  {
    chave: 'atributo_per' as const,
    sigla: 'PER',
    nome: 'Percepção',
    subtitulo: 'Organização',
    Icon: Target,
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-500/25 hover:border-purple-500/50 hover:shadow-purple-500/10',
    bgColor: 'bg-purple-500/10',
    barColor: 'bg-purple-500',
  },
];

export const PlayerStatusCard: React.FC = () => {
  const { perfil, loading, descansarCompleto } = useGamificacao();

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

  const hpAtual = perfil.hp_atual ?? 100;
  const hpMaximo = perfil.hp_maximo ?? 100;
  const mpAtual = perfil.mp_atual ?? 50;
  const mpMaximo = perfil.mp_maximo ?? 50;
  const goldAtual = perfil.gold_atual ?? perfil.moedas ?? 0;

  const progressoHp = hpMaximo > 0 ? Math.min(100, Math.max(0, (hpAtual / hpMaximo) * 100)) : 0;
  const progressoMp = mpMaximo > 0 ? Math.min(100, Math.max(0, (mpAtual / mpMaximo) * 100)) : 0;

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

      {/* Topo: Nível, XP, Barras de Sobrevivência (HP/MP) e Streak */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-5">
        {/* Escudo de Nível e Display de Gold */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative w-16 h-16 shrink-0 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <Shield className="w-14 h-14 text-indigo-400/30 absolute" />
            <span className="text-2xl font-extrabold text-indigo-200 relative">{nivel}</span>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">Nível Atual</p>
            <p className="text-lg font-bold text-zinc-100">Nível {nivel}</p>
            {/* Display de Gold */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-xs shadow-amber-500/10">
              <span className="text-sm">🪙</span>
              <span className="text-xs font-black font-mono tracking-tight text-amber-200">
                {goldAtual} <span className="text-[10px] uppercase font-bold text-amber-400/90 font-sans">Gold</span>
              </span>
            </div>
          </div>
        </div>

        {/* Centro: Barra de XP + Barras de HP e MP */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Barra de XP */}
          <div className="space-y-1.5">
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
              className="h-2.5"
              indicatorClassName="bg-gradient-to-r from-indigo-500 to-amber-400"
            />
          </div>

          {/* Barras de Status de Sobrevivência: HP (Vermelho) e MP (Azul) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
            {/* Barra de HP: Vermelha vibrante */}
            <div className="space-y-1.5 bg-zinc-950/60 border border-red-500/30 rounded-xl p-2.5 shadow-inner">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-red-400">
                  <Heart className="w-3.5 h-3.5 fill-red-500/30 text-red-500 animate-pulse" />
                  HP: {hpAtual} / {hpMaximo}
                </span>
                <span className="text-[11px] font-mono text-red-400/90 font-bold">
                  {hpAtual === 0 ? 'Exausto! ⚠️' : `${Math.round(progressoHp)}%`}
                </span>
              </div>
              <div className="h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-red-950/80">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-red-500 to-rose-500 rounded-full transition-all duration-500 shadow-sm shadow-red-500/50"
                  style={{ width: `${progressoHp}%` }}
                />
              </div>
            </div>

            {/* Barra de MP: Azul brilhante */}
            <div className="space-y-1.5 bg-zinc-950/60 border border-blue-500/30 rounded-xl p-2.5 shadow-inner">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-blue-400">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  MP: {mpAtual} / {mpMaximo}
                </span>
                <span className="text-[11px] font-mono text-blue-400/90 font-bold">
                  {mpAtual === 0 ? 'Esgotado! ⚠️' : `${Math.round(progressoMp)}%`}
                </span>
              </div>
              <div className="h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-blue-950/80">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 rounded-full transition-all duration-500 shadow-sm shadow-blue-500/50"
                  style={{ width: `${progressoMp}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Streak, A Taverna e O Mercado */}
        <div className="flex flex-row lg:flex-col items-stretch gap-2 self-start lg:self-auto shrink-0">
          {/* Streak */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <Flame className="w-4 h-4 text-orange-400" />
            <div className="leading-tight">
              <p className="text-sm font-bold text-orange-300">🔥 {perfil.streak_atual} dias</p>
              <p className="text-[9px] uppercase tracking-wider text-orange-400/80">
                ofensiva diária
              </p>
            </div>
          </div>

          {/* A Taverna: Botão de Cura Completa (Descansar) */}
          <button
            onClick={() => descansarCompleto()}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/35 border border-amber-500/35 text-amber-200 text-xs font-bold shadow-xs hover:shadow-amber-500/20 transition-all cursor-pointer group"
            title="Recupera todo HP e MP (A Taverna)"
          >
            <Bed className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Descansar</span>
          </button>

          {/* O Mercado */}
          <Link
            to="/mercado"
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 active:from-amber-500/40 active:to-amber-600/40 border border-amber-500/40 text-amber-200 text-xs font-bold shadow-xs hover:shadow-amber-500/25 transition-all cursor-pointer group"
            title="Visitar O Mercado de Recompensas"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>O Mercado</span>
          </Link>
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
                  "group relative overflow-hidden rounded-2xl border p-3.5 transition-all duration-300 hover:-translate-y-0.5 bg-zinc-950/60 backdrop-blur-xs cursor-default",
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
