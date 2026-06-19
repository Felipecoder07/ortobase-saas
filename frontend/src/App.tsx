import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MobileSign from './pages/MobileSign';

import DashboardLayout from './layouts/DashboardLayout';
import Patients from './pages/Patients';
import PatientProfile from './pages/PatientProfile';
import Dentists from './pages/Dentists';
import Agenda from './pages/Agenda';
import Finance from './pages/Finance';
import Procedures from './pages/Procedures';

// Função auxiliar para verificar autenticação
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/mobile-sign" element={<MobileSign />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/:id" element={<PatientProfile />} />
        <Route path="dentists" element={<Dentists />} />
        <Route path="finance" element={<Finance />} />
        <Route path="procedures" element={<Procedures />} />
      </Route>
      {/* Rota padrão redireciona para o painel se logado, ou login se deslogado */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
