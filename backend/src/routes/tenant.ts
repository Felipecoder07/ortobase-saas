import { Router } from 'express';
import { getMyTenantSettings, updateMyTenantSettings } from '../controllers/tenantController';
import { authenticate, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);
router.use(requireRole(['ADMIN']));

router.get('/settings', getMyTenantSettings);
router.patch('/settings', updateMyTenantSettings);

export default router;
