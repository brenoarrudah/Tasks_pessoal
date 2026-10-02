import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AreasProvider } from '@/contexts/AreasContext';
import { TasksProvider } from '@/contexts/TasksContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';

import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { VisaoGeral } from '@/pages/VisaoGeral';
import { GestaoAreas } from '@/pages/GestaoAreas';
import { Configuracoes } from '@/pages/Configuracoes';
import { LogsSistema } from '@/pages/LogsSistema';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AreasProvider>
          <TasksProvider>
            <Routes>
              {/* Rota Pública */}
              <Route path="/login" element={<Login />} />

              {/* Rotas Protegidas com Layout Base */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/tarefas" element={<VisaoGeral />} />
                  <Route path="/areas" element={<GestaoAreas />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="/logs" element={<LogsSistema />} />
                </Route>
              </Route>

              {/* Fallback para rotas desconhecidas */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </TasksProvider>
        </AreasProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
