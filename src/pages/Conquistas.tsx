import React from 'react';
import { 
  Trophy, 
  Award, 
  Shield, 
  Flame, 
  Crown, 
  Coins, 
  Sparkles, 
  Footprints, 
  Swords, 
  Lock, 
  Check, 
  CheckCircle2, 
  Medal 
} from 'lucide-react';
import { useConquistas } from '@/contexts/ConquistasContext';
import { ConquistaTitulo } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ICON_MAP: Record<string, React.ElementType> = {
  footprints: Footprints,
  shield: Shield,
  swords: Swords,
  flame: Flame,
  crown: Crown,
  coins: Coins,
  sparkles: Sparkles,
  award: Award,
};

export const Conquistas: React.FC = () => {
  const { titulos, desbloqueados, desbloqueadosIds, tituloEquipado, loading, equiparTitulo } = useConquistas();

  const totalTitulos = titulos.length;
  const totalDesbloqueados = desbloqueados.length;
  const porcentagemDesbloqueada = totalTitulos > 0 
    ? Math.round((totalDesbloqueados / totalTitulos) * 100) 
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
              Galeria de Títulos e Conquistas
            </h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Conquistas permanentes e insígnias lendárias conquistadas ao atingir marcos de evolução.
          </p>
        </div>
      </div>

      {/* Hero: Título Atualmente Equipado & Progresso Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card Título Equipado */}
        <div className="md:col-span-2 bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Título Ativo em Exibição
            </span>

            {tituloEquipado ? (
              <div className="pt-2">
                <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
                  [ {tituloEquipado.titulo} ]
                </h2>
                <p className="text-sm text-zinc-300 mt-1 max-w-lg">
                  {tituloEquipado.descricao}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-400/90 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Exibido com destaque no topo do seu Dashboard e Perfil</span>
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-400">
                  [ Nenhum Título Equipado ]
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Selecione um dos seus títulos desbloqueados abaixo e clique em "Equipar".
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card de Progresso da Galeria */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              <Medal className="w-4 h-4 text-amber-400" />
              <span>Conquistas Totais</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-4xl font-black text-zinc-100 font-mono">
                {totalDesbloqueados}
              </span>
              <span className="text-zinc-500 font-medium text-sm">
                / {totalTitulos} desbloqueados
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-zinc-400">Progresso da Galeria</span>
              <span className="text-amber-400 font-mono">{porcentagemDesbloqueada}%</span>
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden border border-zinc-800">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${porcentagemDesbloqueada}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Grelha de Títulos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Todos os Títulos ({totalTitulos})
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-44 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {titulos.map((t) => {
              const IconComponent = (t.icone && ICON_MAP[t.icone]) || Award;
              const isDesbloqueado = desbloqueadosIds.has(t.id);
              const isEquipado = tituloEquipado?.id === t.id;
              const registro = desbloqueados.find((d) => d.id_titulo === t.id);

              return (
                <div
                  key={t.id}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border p-5 shadow-lg transition-all duration-300 flex flex-col justify-between",
                    isDesbloqueado
                      ? isEquipado
                        ? "bg-gradient-to-b from-amber-950/30 via-zinc-900 to-zinc-950 border-amber-400/70 shadow-amber-500/10 ring-1 ring-amber-400/40"
                        : "bg-zinc-900/80 hover:bg-zinc-900 border-zinc-700/60 hover:border-amber-500/40 hover:-translate-y-1"
                      : "bg-zinc-950/40 border-zinc-800/60 opacity-60 grayscale hover:opacity-75 transition-opacity"
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div
                        className={cn(
                          "p-3 rounded-xl border shadow-sm",
                          isDesbloqueado
                            ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                            : "bg-zinc-900 border-zinc-800 text-zinc-600"
                        )}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>

                      {isDesbloqueado ? (
                        isEquipado ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                            <Check className="w-3 h-3 stroke-[3]" />
                            Equipado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-semibold">
                            Desbloqueado
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px] font-semibold">
                          <Lock className="w-3 h-3" />
                          Bloqueado
                        </span>
                      )}
                    </div>

                    <div>
                      <h3
                        className={cn(
                          "text-base font-extrabold tracking-tight",
                          isDesbloqueado ? "text-zinc-100" : "text-zinc-400"
                        )}
                      >
                        [ {t.titulo} ]
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                        {t.descricao}
                      </p>
                    </div>

                    <div className="pt-2 text-xs">
                      <span className="text-[11px] font-medium text-zinc-500 block">
                        Requisito: <strong className="text-zinc-300">{t.condicao_desbloqueio}</strong>
                      </span>
                      {registro?.data_desbloqueio && (
                        <span className="text-[10px] text-zinc-500 mt-0.5 block">
                          Conquistado em {format(new Date(registro.data_desbloqueio), "d 'de' MMMM", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ação de Equipar */}
                  <div className="pt-4 mt-3 border-t border-zinc-800/80">
                    {isDesbloqueado ? (
                      isEquipado ? (
                        <div className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Em Uso Atualmente</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => equiparTitulo(t)}
                          className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/35 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all cursor-pointer shadow-xs hover:shadow-amber-500/15 flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Equipar Título</span>
                        </button>
                      )
                    ) : (
                      <div className="w-full py-2 px-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-500 text-xs font-medium flex items-center justify-center gap-1.5 cursor-not-allowed">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Atingir Marco Para Liberar</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
