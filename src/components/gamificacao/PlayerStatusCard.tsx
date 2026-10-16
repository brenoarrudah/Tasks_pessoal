import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Flame, 
  Shield, 
  Zap, 
  Brain, 
  Sparkles, 
  Users, 
  Target, 
  Heart, 
  Bed, 
  Award 
} from 'lucide-react';
import { useGamificacao, xpParaAtingirNivel } from '@/contexts/GamificacaoContext';
import { useConquistas } from '@/contexts/ConquistasContext';
import { cn } from '@/lib/utils';

const ATRIBUTOS_RPG = [
  {
    chave: 'atributo_str' as const,
    sigla: 'STR',
    nome: 'Força',
    subtitulo: 'Vitalidade',
    Icon: Flame,
    color: 'text-red-400',
    borderColor: 'border-red-500/25 hover:border-red-500/50',
    bgColor: 'bg-red-500/10 hover:bg-red-500/15',
  },
  {
    chave: 'atributo_int' as const,
    sigla: 'INT',
    nome: 'Inteligência',
    subtitulo: 'Foco',
    Icon: Brain,
    color: 'text-blue-400',
    borderColor: 'border-blue-500/25 hover:border-blue-500/50',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/15',
  },
  {
    chave: 'atributo_spr' as const,
    sigla: 'SPR',
    nome: 'Espírito',
    subtitulo: 'Sabedoria',
    Icon: Sparkles,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/25 hover:border-amber-500/50',
    bgColor: 'bg-amber-500/10 hover:bg-amber-500/15',
  },
  {
    chave: 'atributo_cha' as const,
    sigla: 'CHA',
    nome: 'Carisma',
    subtitulo: 'Liderança',
    Icon: Users,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/25 hover:border-emerald-500/50',
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/15',
  },
  {
    chave: 'atributo_per' as const,
    sigla: 'PER',
    nome: 'Percepção',
    subtitulo: 'Organização',
    Icon: Target,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/25 hover:border-purple-500/50',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/15',
  },
];

export const PlayerStatusCard: React.FC = () => {
  const { perfil, loading, descansarCompleto } = useGamificacao();
  const { tituloEquipado } = useConquistas();

  if (loading || !perfil) {
    return (
      <div className="h-32 rounded-2xl border border-zinc-800 bg-zinc-900/60 animate-pulse" />
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
      className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-indigo-950/40 via-zinc-900/90 to-zinc-950 p-4 sm:p-5 shadow-xl backdrop-blur-sm"
    >
      <div className="absolute -top-10 -left-10 w-44 h-44 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Topo: Identidade, Barras de Status Vitais e Descanso */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Identidade do Jogador: Nível, Título e Saldo de Gold */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center shadow-md shadow-indigo-950/40 shrink-0">
            <Shield className="w-10 h-10 text-indigo-400/25 absolute" />
            <span className="text-xl font-black text-indigo-200 relative">{nivel}</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-zinc-100">Nível {nivel}</span>
              <Link
                to="/conquistas"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-200 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer group"
                title="Galeria de Títulos e Conquistas"
              >
                <Award className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-[140px]">
                  [ {tituloEquipado ? tituloEquipado.titulo : 'Sem Título'} ]
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/mercado"
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-colors shadow-xs"
                title="Ver saldo no Mercado de Recompensas"
              >
                <span className="text-xs">🪙</span>
                <span className="text-xs font-mono font-bold text-amber-200">{goldAtual}</span>
                <span className="text-[9px] uppercase font-bold text-amber-400/80">Gold</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Centro: Barra de XP + Vitais HP e MP */}
        <div className="flex-1 min-w-[240px] space-y-2">
          {/* Barra de XP */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                <Zap className="w-3 h-3 text-amber-400" />
                XP: {perfil.xp_acumulado} / {xpProximoNivel}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                faltam {Math.max(0, xpProximoNivel - perfil.xp_acumulado)} XP
              </span>
            </div>
            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-amber-400 to-amber-300 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, progressoNivel))}%` }}
              />
            </div>
          </div>

          {/* Barras de HP e MP lado a lado */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* HP */}
            <div className="bg-zinc-950/60 border border-red-500/25 rounded-xl px-2.5 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500/30 shrink-0" />
                <span className="text-xs font-bold text-red-400 truncate">
                  HP {hpAtual}/{hpMaximo}
                </span>
              </div>
              <div className="w-14 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-red-950/80 shrink-0 ml-2">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressoHp}%` }}
                />
              </div>
            </div>

            {/* MP */}
            <div className="bg-zinc-950/60 border border-blue-500/25 rounded-xl px-2.5 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-xs font-bold text-blue-400 truncate">
                  MP {mpAtual}/{mpMaximo}
                </span>
              </div>
              <div className="w-14 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-blue-950/80 shrink-0 ml-2">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressoMp}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Streak e Botão Único de Descanso (A Taverna) */}
        <div className="flex items-center md:flex-col justify-between md:justify-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <div className="leading-tight">
              <p className="text-xs font-bold font-mono">🔥 {perfil.streak_atual} {perfil.streak_atual === 1 ? 'dia' : 'dias'}</p>
              <p className="text-[8px] uppercase tracking-wider text-orange-400/80 font-semibold">Ofensiva</p>
            </div>
          </div>

          <button
            onClick={() => descansarCompleto()}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/35 border border-amber-500/35 text-amber-200 text-xs font-bold shadow-xs hover:shadow-amber-500/20 transition-all cursor-pointer group"
            title="Recupera todo HP e MP (A Taverna)"
          >
            <Bed className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Descansar</span>
          </button>
        </div>
      </div>

      {/* Faixa Inferior Compacta: 5 Atributos RPG */}
      <div className="relative z-10 pt-3 mt-3 border-t border-zinc-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Atributos RPG</span>
            <span className="text-[10px] text-zinc-500 font-mono font-normal">({totalAtributos} pts)</span>
          </div>

          {/* Chips Horizontais dos 5 Atributos */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 flex-1 sm:max-w-xl sm:ml-auto">
            {ATRIBUTOS_RPG.map((attr) => {
              const valor = perfil[attr.chave] ?? 0;
              const Icon = attr.Icon;
              return (
                <div
                  key={attr.sigla}
                  className={cn(
                    "flex items-center justify-between px-2 py-1 rounded-lg border transition-all duration-200 bg-zinc-950/70 backdrop-blur-xs cursor-default",
                    attr.borderColor,
                    attr.bgColor
                  )}
                  title={`${attr.nome} (${attr.subtitulo}): ${valor} pts acumulados`}
                >
                  <div className="flex items-center gap-1 min-w-0">
                    <Icon className={cn("w-3 h-3 shrink-0", attr.color)} />
                    <span className="text-[10px] font-mono font-bold text-zinc-400 hidden sm:inline">{attr.sigla}</span>
                  </div>
                  <span className={cn("text-xs font-black font-mono ml-1", attr.color)}>
                    {valor}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

