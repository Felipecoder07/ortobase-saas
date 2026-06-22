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

const getRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return '';
  try {
    const payloadBase64 = token.split('.')[1];
    // JWT é codificado em Base64Url, precisamos normalizar para Base64 normal antes do atob
    const normalizedBase64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = JSON.parse(atob(normalizedBase64));
    return decodedPayload.role || '';
  } catch (e) {
    return '';
  }
};

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RoleGuard = ({ children, allowedRoles }: { children: React.ReactElement, allowedRoles: string[] }) => {
  const role = getRole();
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard/agenda" replace />;
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
        <Route index element={<RoleGuard allowedRoles={['ADMIN']}><Dashboard /></RoleGuard>} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/:id" element={<PatientProfile />} />
        <Route path="dentists" element={<RoleGuard allowedRoles={['ADMIN', 'RECEPTIONIST']}><Dentists /></RoleGuard>} />
        <Route path="finance" element={<RoleGuard allowedRoles={['ADMIN', 'RECEPTIONIST']}><Finance /></RoleGuard>} />
        <Route path="procedures" element={<RoleGuard allowedRoles={['ADMIN', 'RECEPTIONIST']}><Procedures /></RoleGuard>} />
      </Route>
      {/* Rota padrão redireciona para o painel se logado, ou login se deslogado */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
