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
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useLoja } from '@/contexts/LojaContext';
import { useGamificacao } from '@/contexts/GamificacaoContext';
import { LojaRecompensa } from '@/types';
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

export const Mercado: React.FC = () => {
  const { recompensas, loading, createRecompensa, deleteRecompensa, comprarRecompensa } = useLoja();
  const { perfil, descansarCompleto } = useGamificacao();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoCusto, setNovoCusto] = useState('20');
  const [novoIcone, setNovoIcone] = useState('gift');
  const [comprandoId, setComprandoId] = useState<string | null>(null);

  const goldAtual = perfil?.gold_atual ?? perfil?.moedas ?? 0;

  const handleOpenModal = () => {
    setNovoTitulo('');
    setNovoCusto('20');
    setNovoIcone('gift');
    setIsModalOpen(true);
  };

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim()) return;

    const custo = parseInt(novoCusto, 10);
    if (isNaN(custo) || custo <= 0) return;

    await createRecompensa({
      titulo: novoTitulo.trim(),
      custo_gold: custo,
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
      <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Economia Virtual RPG
              </span>
            </div>
            <h2 className="text-lg font-bold text-zinc-100">
              Seu Saldo Disponível
            </h2>
            <p className="text-xs text-zinc-400 max-w-md">
              Complete tarefas de alta prioridade para ganhar até +20 Gold por missão.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-zinc-950/80 border border-amber-500/30 rounded-2xl p-4 px-6 shadow-inner shrink-0">
            <div className="text-3xl">🪙</div>
            <div>
              <p className="text-3xl font-black text-amber-300 font-mono tracking-tight">
                {goldAtual}
              </p>
              <p className="text-[11px] uppercase tracking-wider font-bold text-amber-400/80">
                Gold Acumulado
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Item do Sistema: A Taverna (Cura Completa) */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-950 border border-indigo-500/25 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
            <Bed className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-100">
                A Taverna • Cura Completa (Descansar)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                Item de Sistema
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Restaura imediatamente 100% de HP e MP para você continuar produtivo.
            </p>
          </div>
        </div>

        <button
          onClick={() => descansarCompleto()}
          className="bg-indigo-600/80 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/20 shrink-0 flex items-center justify-center gap-2"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-36 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 animate-pulse"
              />
            ))}
          </div>
        ) : recompensas.length === 0 ? (
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
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
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
            >
              + Adicionar Primeira Recompensa
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recompensas.map((rec) => {
              const IconComponent = (rec.icone && ICON_MAP[rec.icone]) || Gift;
              const podeComprar = goldAtual >= rec.custo_gold;
              const estaComprando = comprandoId === rec.id;

              return (
                <div
                  key={rec.id}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-5 shadow-lg transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 shadow-sm">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      
                      <button
                        onClick={() => deleteRecompensa(rec.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                        title="Remover recompensa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-zinc-100 group-hover:text-amber-200 transition-colors">
                        {rec.titulo}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-sm">🪙</span>
                        <span className="text-sm font-extrabold text-amber-300 font-mono">
                          {rec.custo_gold} Gold
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-zinc-800/80">
                    <button
                      onClick={() => handleComprar(rec)}
                      disabled={estaComprando}
                      className={cn(
                        "w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md",
                        podeComprar
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:from-amber-600 active:to-amber-700 text-zinc-950 shadow-amber-500/20"
                          : "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                      )}
                    >
                      {estaComprando ? (
                        <span>Processando...</span>
                      ) : (
                        <>
                          <Coins className="w-4 h-4" />
                          <span>{podeComprar ? 'Comprar Recompensa' : 'Gold Insuficiente'}</span>
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
