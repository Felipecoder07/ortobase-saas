import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/authMiddleware';
import {
  getProcedures,
  createProcedure,
  updateProcedure,
  deleteProcedure
} from '../controllers/procedureController';

const router = Router();

router.use(authenticate);

router.get('/', requireRole(['ADMIN', 'RECEPTIONIST', 'DENTIST']), getProcedures);
router.post('/', requireRole(['ADMIN']), createProcedure);
router.put('/:id', requireRole(['ADMIN']), updateProcedure);
router.delete('/:id', requireRole(['ADMIN']), deleteProcedure);

export default router;
