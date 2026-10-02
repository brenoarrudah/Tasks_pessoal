import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, Menu, Settings, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userName = profile?.nome || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const userEmail = profile?.email || user?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-zinc-950 border-b border-zinc-800/80 px-4 flex items-center justify-between sticky top-0 z-30">
      {/* Lado Esquerdo: Botão Mobile + Logotipo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
          title="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-lg font-semibold text-zinc-100 tracking-tight">
            Tarefas
          </span>
        </div>
      </div>

      {/* Lado Direito: Perfil do Usuário e Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-sm shadow-md">
            {userInitial}
          </div>
          <span className="text-sm font-medium text-zinc-200 hidden sm:inline-block max-w-[120px] truncate">
            {userName}
          </span>
          <ChevronDown className="w-4 h-4 text-zinc-400 hidden sm:block" />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-base shrink-0">
                {userInitial}
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-zinc-100 truncate">{userName}</p>
                <p className="text-xs text-zinc-400 truncate">{userEmail}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-1">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/configuracoes');
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-zinc-400" />
                <span>Configurações</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-red-950/40 text-red-400 hover:text-red-300 flex items-center gap-2.5 transition-colors cursor-pointer mt-0.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair / Terminar Sessão</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
