import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authLoading && user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('E-mail ou senha incorretos. Verifique suas credenciais.');
        } else {
          setError(authError.message || 'Falha ao realizar login. Tente novamente.');
        }
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      setError('Ocorreu um erro inesperado ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Container Principal */}
      <div className="w-full max-w-md">
        {/* Cartão de Login Minimalista Inspirado no Google Tasks */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          
          {/* Header do Cartão / Logotipo */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-3 text-blue-500 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              Tarefas
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Gestor Pessoal de Tarefas & Produtividade
            </p>
          </div>

          {/* Alert de Erro */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/50 border border-red-900/50 text-red-300 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 uppercase tracking-wider">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full bg-zinc-950/80 border border-zinc-800 text-zinc-100 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950/80 border border-zinc-800 text-zinc-100 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-zinc-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <span>Entrar no Sistema</span>
              )}
            </button>
          </form>

          {/* Nota de rodapé informando uso pessoal sem botão de registro */}
          <div className="mt-8 pt-4 border-t border-zinc-800/60 text-center">
            <p className="text-xs text-zinc-500">
              Acesso exclusivo para usuários cadastrados.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
