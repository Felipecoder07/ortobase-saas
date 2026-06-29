import { Router } from 'express';
import { getAuditLog } from '../controllers/auditController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, getAuditLog);

export default router;
