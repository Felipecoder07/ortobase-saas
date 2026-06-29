import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MobileSign from './pages/MobileSign';
import ConfirmAppointment from './pages/public/ConfirmAppointment';
import Register from './pages/public/Register';
import Suspended from './pages/public/Suspended';
import RecoverPassword from './pages/public/RecoverPassword';
import ResetPassword from './pages/public/ResetPassword';
import NotFound from './pages/public/NotFound';

import DashboardLayout from './layouts/DashboardLayout';
import Patients from './pages/Patients';
import PatientProfile from './pages/PatientProfile';
import Dentists from './pages/Dentists';
import Agenda from './pages/Agenda';
import Finance from './pages/Finance';
import Procedures from './pages/Procedures';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import UsersAudit from './pages/UsersAudit';

// Super Admin Imports
import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminLogin from './pages/super-admin/SuperAdminLogin';
import SADashboard from './pages/super-admin/SADashboard';
import SAClients from './pages/super-admin/SAClients';
import SAClientDetail from './pages/super-admin/SAClientDetail';
import SAUsers from './pages/super-admin/SAUsers';
import SAAudit from './pages/super-admin/SAAudit';
import SAProfile from './pages/super-admin/SAProfile';

// Função auxiliar para verificar autenticação
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

const isSAAuthenticated = () => {
  return !!localStorage.getItem('sa_token');
};

const getRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return '';
  try {
    const payloadBase64 = token.split('.')[1];
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

const SuperAdminProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  if (!isSAAuthenticated()) {
    return <Navigate to="/super-admin/login" replace />;
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
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/suspended" element={<Suspended />} />
      <Route path="/mobile-sign" element={<MobileSign />} />
      <Route path="/recover-password" element={<RecoverPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/c/:id" element={<ConfirmAppointment />} />
      
      {/* Rotas de Clínicas */}
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
        <Route path="dentists" element={<RoleGuard allowedRoles={['ADMIN', 'RECEPTIONIST']}><Dentists /></RoleGuard>} />
        <Route path="finance" element={<RoleGuard allowedRoles={['ADMIN', 'RECEPTIONIST']}><Finance /></RoleGuard>} />
        <Route path="procedures" element={<RoleGuard allowedRoles={['ADMIN', 'RECEPTIONIST']}><Procedures /></RoleGuard>} />
        <Route path="users" element={<RoleGuard allowedRoles={['ADMIN']}><Users /></RoleGuard>} />
        <Route path="settings" element={<RoleGuard allowedRoles={['ADMIN']}><Settings /></RoleGuard>} />
        <Route path="profile" element={<Profile />} />
        <Route path="audit" element={<RoleGuard allowedRoles={['ADMIN']}><UsersAudit /></RoleGuard>} />
      </Route>

      {/* Rotas de Super Admin */}
      <Route path="/super-admin/login" element={<SuperAdminLogin />} />
      <Route
        path="/super-admin"
        element={
          <SuperAdminProtectedRoute>
            <SuperAdminLayout />
          </SuperAdminProtectedRoute>
        }
      >
        <Route index element={<SADashboard />} />
        <Route path="clients" element={<SAClients />} />
        <Route path="clients/:id" element={<SAClientDetail />} />
        <Route path="users" element={<SAUsers />} />
        <Route path="audit" element={<SAAudit />} />
        <Route path="profile" element={<SAProfile />} />
      </Route>

      {/* Rota padrão redireciona para o painel se logado, ou erro 404 se url errada */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
