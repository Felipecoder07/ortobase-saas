import { Router } from 'express';
import {
  createDentist,
  getDentists,
  getDentistById,
  updateDentist,
  deleteDentist
} from '../controllers/dentistController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas de dentistas exigem autenticação
router.use(authenticate);

/**
 * @swagger
 * /api/dentists:
 *   post:
 *     summary: Cadastra um novo dentista na clínica do usuário logado
 *     tags: [Dentists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - cro
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *               cro:
 *                 type: string
 *               specialties:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dentista criado
 */
router.post('/', createDentist);

/**
 * @swagger
 * /api/dentists:
 *   get:
 *     summary: Lista os dentistas ativos da clínica (com busca opcional)
 *     tags: [Dentists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Busca por nome ou CRO
 *     responses:
 *       200:
 *         description: Lista de dentistas
 */
router.get('/', getDentists);

/**
 * @swagger
 * /api/dentists/{id}:
 *   get:
 *     summary: Retorna os detalhes de um dentista específico
 *     tags: [Dentists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalhes do dentista
 *       404:
 *         description: Dentista não encontrado
 */
router.get('/:id', getDentistById);

/**
 * @swagger
 * /api/dentists/{id}:
 *   put:
 *     summary: Atualiza os dados de um dentista
 *     tags: [Dentists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               cro:
 *                 type: string
 *               specialties:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dentista atualizado
 *       404:
 *         description: Dentista não encontrado
 */
router.put('/:id', updateDentist);

/**
 * @swagger
 * /api/dentists/{id}:
 *   delete:
 *     summary: Inativa (soft delete) um dentista
 *     tags: [Dentists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dentista inativado
 *       404:
 *         description: Dentista não encontrado
 */
router.delete('/:id', deleteDentist);

export default router;
