import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Sun, 
  ListTodo, 
  Folders, 
  Settings, 
  Activity, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAreas } from '@/contexts/AreasContext';
import { useTasks } from '@/contexts/TasksContext';
import { AreaIcon } from '@/components/areas/AreaIcon';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onCreateTaskClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  mobileOpen = false, 
  onCloseMobile,
  onCreateTaskClick 
}) => {
  const location = useLocation();
  const { areas, loading: loadingAreas } = useAreas();
  const { openCreateTaskModal } = useTasks();
  const [listsOpen, setListsOpen] = useState(true);

  // NavItems conforme a especificação da Etapa 2
  const navItems = [
    { label: 'Tarefas do Dia', path: '/', icon: Sun },
    { label: 'Visão Geral', path: '/tarefas', icon: ListTodo },
    { label: 'Gestão de Áreas', path: '/areas', icon: Folders },
    { label: 'Configurações', path: '/configuracoes', icon: Settings },
    { label: 'Logs do Sistema', path: '/logs', icon: Activity },
  ];

  const content = (
    <div className="flex flex-col h-full py-4 px-3 bg-zinc-950 text-zinc-300">
      
      {/* Botão de Fechar no Mobile */}
      {onCloseMobile && (
        <div className="flex items-center justify-between pb-3 px-2 lg:hidden border-b border-zinc-800 mb-3">
          <span className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Navegação</span>
          <button 
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Botão Grande de Criar Tarefa (Estilo Google Tasks) */}
      <div className="mb-6 px-1">
        <button
          onClick={() => {
            openCreateTaskModal();
            if (onCreateTaskClick) onCreateTaskClick();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 font-medium py-3 px-4 rounded-2xl shadow-lg flex items-center gap-3 transition-all hover:border-zinc-700 active:scale-[0.98] cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:bg-blue-500 transition-colors">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-sm font-semibold tracking-wide">Criar tarefa</span>
        </button>
      </div>

      {/* Navegação Principal */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80"
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-blue-400" : "text-zinc-400")} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="my-5 border-t border-zinc-800/80" />

      {/* Secção Expansível "Listas" (Áreas de Foco) */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1">
        <button
          onClick={() => setListsOpen(!listsOpen)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase text-zinc-400 tracking-wider hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-900/50 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Folders className="w-4 h-4 text-zinc-500" />
            Listas / Áreas
          </span>
          {listsOpen ? (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          )}
        </button>

        {listsOpen && (
          <div className="mt-1 space-y-0.5 pl-1">
            {loadingAreas ? (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                <span>Carregando listas...</span>
              </div>
            ) : areas.length === 0 ? (
              <div className="px-3 py-2 text-xs text-zinc-500 italic">
                Nenhuma área criada ainda.
              </div>
            ) : (
              areas.map((list) => (
                <NavLink
                  key={list.id}
                  to={`/tarefas?areaId=${list.id}`}
                  onClick={onCloseMobile}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60 transition-colors group"
                >
                  <div 
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" 
                    style={{ backgroundColor: list.cor }} 
                  />
                  <AreaIcon name={list.icone} className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 shrink-0" />
                  <span className="truncate">{list.nome}</span>
                </NavLink>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer da Sidebar */}
      <div className="pt-3 border-t border-zinc-900 px-2 text-center">
        <p className="text-[11px] text-zinc-600">
          Gestor Pessoal de Tarefas v1.0
        </p>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixa) */}
      <aside className="hidden lg:block w-64 border-r border-zinc-800/80 shrink-0 h-[calc(100vh-4rem)] sticky top-16 bg-zinc-950">
        {content}
      </aside>

      {/* Mobile Drawer (Sheet) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onCloseMobile}
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] bg-zinc-950 border-r border-zinc-800 h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
