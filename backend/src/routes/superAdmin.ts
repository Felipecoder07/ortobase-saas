import { Router } from 'express';
import {
  loginSuperAdmin,
  getGlobalStats,
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenantStatus,
  updateTenantPlan,
  updateTenantName,
  deleteTenant,
  getAllUsers,
  impersonateTenant,
  getAuditLog,
  updateSuperAdminProfile
} from '../controllers/superAdminController';
import { authenticate, requireSuperAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Rota de login pública (para super admin)
router.post('/login', loginSuperAdmin);

// A partir daqui, todas as rotas exigem autenticação e perfil SUPER_ADMIN
router.use(authenticate);
router.use(requireSuperAdmin);

// Dashboard
router.get('/stats', getGlobalStats);

// Tenants
router.get('/tenants', getAllTenants);
router.post('/tenants', createTenant);
router.get('/tenants/:id', getTenantById);
router.patch('/tenants/:id/status', updateTenantStatus);
router.patch('/tenants/:id/plan', updateTenantPlan);
router.patch('/tenants/:id/name', updateTenantName);
router.delete('/tenants/:id', deleteTenant);
router.post('/tenants/:id/impersonate', impersonateTenant);

// Users
router.get('/users', getAllUsers);

// Audit
router.get('/audit', getAuditLog);

// Profile
router.patch('/profile', updateSuperAdminProfile);

export default router;
