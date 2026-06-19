import { Router } from 'express';
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient
} from '../controllers/patientController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas de pacientes exigem autenticação
router.use(authenticate);

/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Cadastra um novo paciente na clínica do usuário logado
 *     tags: [Patients]
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
 *               - cpf
 *               - dateOfBirth
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *               cpf:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               clinicalNotes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paciente criado
 *       400:
 *         description: CPF já cadastrado na clínica
 */
router.post('/', createPatient);

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Lista os pacientes ativos da clínica (com busca opcional)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Busca por nome, CPF ou telefone
 *     responses:
 *       200:
 *         description: Lista de pacientes
 */
router.get('/', getPatients);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Retorna os detalhes de um paciente específico
 *     tags: [Patients]
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
 *         description: Detalhes do paciente
 *       404:
 *         description: Paciente não encontrado
 */
router.get('/:id', getPatientById);

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     summary: Atualiza os dados de um paciente
 *     tags: [Patients]
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
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               clinicalNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Paciente atualizado
 *       404:
 *         description: Paciente não encontrado
 */
router.put('/:id', updatePatient);

/**
 * @swagger
 * /api/patients/{id}:
 *   delete:
 *     summary: Inativa (soft delete) um paciente
 *     tags: [Patients]
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
 *         description: Paciente inativado
 *       404:
 *         description: Paciente não encontrado
 */
router.delete('/:id', deletePatient);

export default router;
