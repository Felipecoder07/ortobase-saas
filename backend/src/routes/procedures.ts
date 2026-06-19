import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import {
  getProcedures,
  createProcedure,
  updateProcedure,
  deleteProcedure
} from '../controllers/procedureController';

const router = Router();

router.use(authenticate);

router.get('/', getProcedures);
router.post('/', createProcedure);
router.put('/:id', updateProcedure);
router.delete('/:id', deleteProcedure);

export default router;
