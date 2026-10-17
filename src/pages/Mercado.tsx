import React, { useState } from 'react';
import { 
  Store, 
  Plus, 
  Coins, 
  Trash2, 
  Sparkles, 
  Gamepad2, 
  Tv, 
  Coffee, 
  Utensils, 
  BookOpen, 
  Gift, 
  Music, 
  Film, 
  Bed, 
  X,
  Lock,
  ShieldAlert
} from 'lucide-react';
import { useLoja } from '@/contexts/LojaContext';
import { useGamificacao } from '@/contexts/GamificacaoContext';
import { LojaRecompensa, RecompensaTier } from '@/types';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
  gamepad: Gamepad2,
  tv: Tv,
  coffee: Coffee,
  pizza: Utensils,
  book: BookOpen,
  gift: Gift,
  music: Music,
  film: Film,
  bed: Bed,
};

const ICON_OPTIONS = [
  { id: 'gift', label: 'Presente', Icon: Gift },
  { id: 'gamepad', label: 'Videogame', Icon: Gamepad2 },
  { id: 'tv', label: 'Séries / TV', Icon: Tv },
  { id: 'coffee', label: 'Café / Lanche', Icon: Coffee },
  { id: 'pizza', label: 'Refeição Especial', Icon: Utensils },
  { id: 'book', label: 'Livro', Icon: BookOpen },
  { id: 'music', label: 'Música', Icon: Music },
  { id: 'film', label: 'Cinema', Icon: Film },
];

interface TierStyle {
  label: string;
  badgeClass: string;
  cardBorder: string;
  iconBg: string;
  glowDot: string;
}

const TIER_CONFIG: Record<string, TierStyle> = {
  comum: {
    label: 'Comum',
    badgeClass: 'border-zinc-700/60 bg-zinc-800/40 text-zinc-300',
    cardBorder: 'border-zinc-800 hover:border-zinc-700',
    iconBg: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/50',
    glowDot: 'bg-zinc-400',
  },
  raro: {
    label: 'Raro',
    badgeClass: 'border-blue-500 text-blue-400 bg-blue-500/10',
    cardBorder: 'border-blue-900/40 hover:border-blue-500/50 shadow-blue-950/20',
    iconBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    glowDot: 'bg-blue-400',
  },
  epico: {
    label: 'Épico',
    badgeClass: 'border-purple-500 text-purple-400 bg-purple-500/10',
    cardBorder: 'border-purple-900/40 hover:border-purple-500/50 shadow-purple-950/20',
    iconBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    glowDot: 'bg-purple-400',
  },
  lendario: {
    label: 'Lendário',
    badgeClass: 'border-amber-500 text-amber-400 bg-amber-500/10 shadow-sm shadow-amber-500/20',
    cardBorder: 'border-amber-500/30 hover:border-amber-500/60 shadow-amber-950/30',
    iconBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    glowDot: 'bg-amber-400 animate-pulse',
  },
};

export const Mercado: React.FC = () => {
  const { recompensas, loading, createRecompensa, deleteRecompensa, comprarRecompensa } = useLoja();
  const { perfil, descansarCompleto } = useGamificacao();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoCusto, setNovoCusto] = useState('20');
  const [novoTier, setNovoTier] = useState<RecompensaTier>('comum');
  const [novoNivelMinimo, setNovoNivelMinimo] = useState('1');
  const [novoIcone, setNovoIcone] = useState('gift');
  const [comprandoId, setComprandoId] = useState<string | null>(null);

  const goldAtual = perfil?.gold_atual ?? perfil?.moedas ?? 0;
  const nivelAtual = perfil?.nivel_atual ?? 1;

  const handleOpenModal = () => {
    setNovoTitulo('');
    setNovoCusto('20');
    setNovoTier('comum');
    setNovoNivelMinimo('1');
    setNovoIcone('gift');
    setIsModalOpen(true);
  };

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim()) return;

    const custo = parseInt(novoCusto, 10);
    if (isNaN(custo) || custo <= 0) return;

    const nivelMin = parseInt(novoNivelMinimo, 10);
    const nivelMinimoValido = isNaN(nivelMin) || nivelMin < 1 ? 1 : nivelMin;

    await createRecompensa({
      titulo: novoTitulo.trim(),
      custo_gold: custo,
      tier: novoTier,
      nivel_minimo: nivelMinimoValido,
      icone: novoIcone,
    });

    setIsModalOpen(false);
  };

  const handleComprar = async (recompensa: LojaRecompensa) => {
    setComprandoId(recompensa.id);
    await comprarRecompensa(recompensa);
    setComprandoId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      
      {/* Header do Mercado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm">
              <Store className="w-6 h-6 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
              O Mercado de Recompensas
            </h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Gaste as moedas de Gold que você conquistou cumprindo suas missões diárias.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nova Recompensa</span>
        </button>
      </div>

      {/* Banner de Saldo e Informações do Jogador */}
      <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative z-10">
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Economia Virtual RPG
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-100">
              Seu Saldo & Nível de Herói
            </h2>
            <p className="text-xs text-zinc-400 max-w-md hidden sm:block">
              Complete tarefas de alta prioridade para ganhar até +20 Gold e desbloquear itens de tiers lendários.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
            {/* Status do Nível Atual */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 bg-zinc-950/80 border border-indigo-500/30 rounded-2xl p-3 sm:p-4 px-3.5 sm:px-5 shadow-inner">
              <div className="text-xl sm:text-2xl">⚔️</div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-indigo-300 font-mono tracking-tight">
                  Nv. {nivelAtual}
                </p>
                <p className="text-[9px] sm:text-[11px] uppercase tracking-wider font-bold text-indigo-400/80">
                  Nível do Herói
                </p>
              </div>
            </div>

            {/* Status do Gold */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 bg-zinc-950/80 border border-amber-500/30 rounded-2xl p-3 sm:p-4 px-3.5 sm:px-5 shadow-inner">
              <div className="text-xl sm:text-2xl">🪙</div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-amber-300 font-mono tracking-tight">
                  {goldAtual}
                </p>
                <p className="text-[9px] sm:text-[11px] uppercase tracking-wider font-bold text-amber-400/80">
                  Gold Acumulado
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Item do Sistema: A Taverna (Cura Completa) */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-950 border border-indigo-500/25 rounded-2xl p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
            <Bed className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-zinc-100">
                A Taverna • Cura Completa
              </h3>
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                Sistema
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
              Restaura imediatamente 100% de HP e MP.
            </p>
          </div>
        </div>

        <button
          onClick={() => descansarCompleto()}
          className="w-full sm:w-auto bg-indigo-600/80 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/20 shrink-0 flex items-center justify-center gap-2 min-h-[42px]"
        >
          <Bed className="w-4 h-4" />
          <span>Descansar Agora (Grátis)</span>
        </button>
      </div>

      {/* Grid de Recompensas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            Recompensas Cadastradas ({recompensas.length})
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-44 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 animate-pulse"
              />
            ))}
          </div>
        ) : recompensas.length === 0 ? (
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-200">
              Nenhuma recompensa personalizada no mercado
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mt-1 mb-4">
              Crie suas próprias recompensas da vida real (ex: 1h de videogame, lanche especial) para trocar por Gold!
            </p>
            <button
              onClick={handleOpenModal}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer min-h-[40px]"
            >
              + Adicionar Primeira Recompensa
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {recompensas.map((rec) => {
              const IconComponent = (rec.icone && ICON_MAP[rec.icone]) || Gift;
              const tierKey = (rec.tier || 'comum').toLowerCase();
              const tier = TIER_CONFIG[tierKey] || TIER_CONFIG.comum;
              
              const nivelMinimo = rec.nivel_minimo ?? 1;
              const nivelBloqueado = nivelAtual < nivelMinimo;
              const semGold = goldAtual < rec.custo_gold;
              const podeComprar = !nivelBloqueado && !semGold;
              const estaComprando = comprandoId === rec.id;

              // Definição dos textos e estados do botão segundo regra de negócio
              let botaoTexto = "Comprar";
              let botaoDisabled = false;
              let botaoClasses = "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:from-amber-600 text-zinc-950 shadow-amber-500/20 cursor-pointer";

              if (estaComprando) {
                botaoTexto = "Processando...";
                botaoDisabled = true;
                botaoClasses = "bg-zinc-800 text-zinc-400 border border-zinc-700/50 cursor-not-allowed";
              } else if (nivelBloqueado) {
                botaoTexto = `🔒 Bloqueado (Nv. ${nivelMinimo})`;
                botaoDisabled = true;
                botaoClasses = "bg-zinc-900 text-zinc-500 border border-zinc-800/80 cursor-not-allowed opacity-80";
              } else if (semGold) {
                botaoTexto = "Gold Insuficiente";
                botaoDisabled = true;
                botaoClasses = "bg-zinc-800/60 text-zinc-400 border border-zinc-700/50 cursor-not-allowed";
              }

              return (
                <div
                  key={rec.id}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-4 sm:p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between",
                    tier.cardBorder
                  )}
                >
                  <div className="space-y-3">
                    {/* Topo do Card: Badge de Tier estilizado e Requisito de Nível / Ação */}
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0",
                          tier.badgeClass
                        )}
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full", tier.glowDot)} />
                        {tier.label}
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Se nivel_minimo > 1, exibe claramente o requisito */}
                        {nivelMinimo > 1 && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold border",
                              nivelBloqueado
                                ? "bg-red-500/10 text-red-400 border-red-500/30"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            )}
                            title={nivelBloqueado ? `Requer nível ${nivelMinimo} (Seu nível: ${nivelAtual})` : `Nível ${nivelMinimo} alcançado!`}
                          >
                            <span>🔒 Requer Nv. {nivelMinimo}</span>
                          </span>
                        )}

                        <button
                          onClick={() => deleteRecompensa(rec.id)}
                          className="opacity-100 sm:opacity-0 group-hover:opacity-100 p-2 sm:p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title="Remover recompensa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Bloco Central: Ícone e Título com Preço em Gold */}
                    <div className="flex items-start gap-3 sm:gap-3.5">
                      <div
                        className={cn(
                          "p-2.5 sm:p-3 rounded-xl border shadow-sm shrink-0",
                          tier.iconBg
                        )}
                      >
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-bold text-zinc-100 group-hover:text-amber-200 transition-colors leading-snug break-words">
                          {rec.titulo}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs sm:text-sm">🪙</span>
                          <span className="text-xs sm:text-sm font-extrabold text-amber-300 font-mono">
                            {rec.custo_gold} Gold
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rodapé: Botão de Compra com Trava por Nível e Gold e Touch Target de 44px */}
                  <div className="pt-3 sm:pt-4 mt-3 border-t border-zinc-800/80">
                    <button
                      onClick={() => handleComprar(rec)}
                      disabled={botaoDisabled}
                      className={cn(
                        "w-full min-h-[44px] py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md",
                        botaoClasses
                      )}
                    >
                      {estaComprando ? (
                        <span>Processando...</span>
                      ) : (
                        <>
                          {nivelBloqueado ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Coins className="w-4 h-4" />
                          )}
                          <span>{botaoTexto}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Criação de Recompensa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-zinc-100">Nova Recompensa</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriar} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Título da Recompensa
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 1h de videogame, Noite de Pizza..."
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Grid: Custo em Gold e Nível Mínimo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Custo em Gold (🪙)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={novoCusto}
                    onChange={(e) => setNovoCusto(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Nível Mínimo
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={novoNivelMinimo}
                    onChange={(e) => setNovoNivelMinimo(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    placeholder="1"
                  />
                </div>
              </div>

              {/* Seleção de Tier / Raridade RPG */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between">
                  <span>Tier de Raridade</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                      TIER_CONFIG[novoTier]?.badgeClass
                    )}
                  >
                    {TIER_CONFIG[novoTier]?.label}
                  </span>
                </label>
                <select
                  value={novoTier}
                  onChange={(e) => setNovoTier(e.target.value as RecompensaTier)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="comum">Comum (Padrão)</option>
                  <option value="raro">Raro</option>
                  <option value="epico">Épico</option>
                  <option value="lendario">Lendário</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Ícone Representativo
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ICON_OPTIONS.map((opt) => {
                    const Icon = opt.Icon;
                    const isSelected = novoIcone === opt.id;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setNovoIcone(opt.id)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border transition-all cursor-pointer text-xs",
                          isSelected
                            ? "bg-amber-500/20 border-amber-500 text-amber-300"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px] truncate max-w-full">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  Salvar Recompensa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
