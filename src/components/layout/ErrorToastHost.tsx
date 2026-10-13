import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { APP_ERROR_EVENT } from '@/lib/notify';

/** Toast global de erro (vermelho), disparado por `notifyError()` */
export const ErrorToastHost: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const handler = (event: Event) => {
      setMessage((event as CustomEvent<string>).detail);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setMessage(null), 5000);
    };

    window.addEventListener(APP_ERROR_EVENT, handler);
    return () => {
      window.removeEventListener(APP_ERROR_EVENT, handler);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!message) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-zinc-900 border border-red-500/40 text-zinc-100 pl-4 pr-2 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200"
    >
      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button
        type="button"
        onClick={() => setMessage(null)}
        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
