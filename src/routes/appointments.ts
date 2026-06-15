import { Router } from 'express';
import {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
  deleteAppointment
} from '../controllers/appointmentController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Agenda uma nova consulta
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - dentistId
 *               - date
 *               - durationInMinutes
 *               - serviceType
 *             properties:
 *               patientId:
 *                 type: string
 *               dentistId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               durationInMinutes:
 *                 type: integer
 *               serviceType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Consulta agendada
 *       400:
 *         description: Conflito de horário
 */
router.post('/', createAppointment);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: "Lista as consultas (opcional: filtra por data YYYY-MM-DD)"
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de consultas
 */
router.get('/', getAppointments);

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   patch:
 *     summary: Atualiza o status da consulta
 *     tags: [Appointments]
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
 *               status:
 *                 type: string
 *               cancellationReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status atualizado
 */
router.patch('/:id/status', updateAppointmentStatus);

router.delete('/:id', deleteAppointment);

export default router;
