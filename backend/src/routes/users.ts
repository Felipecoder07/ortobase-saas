import { Router } from 'express';
import { getClinicUsers, createClinicUser, updateClinicUser, deleteClinicUser } from '../controllers/userController';
import { authenticate, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

// Apenas ADMIN pode gerenciar usuários
router.use(requireRole(['ADMIN']));

router.get('/', getClinicUsers);
router.post('/', createClinicUser);
router.patch('/:id', updateClinicUser);
router.delete('/:id', deleteClinicUser);

export default router;
