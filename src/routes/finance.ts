import { Router } from 'express';
import {
  createPayment,
  getFinancials,
  refundPayment,
  getDefaulters,
  sendReceipt,
  getReports
} from '../controllers/financeController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/finance:
 *   post:
 *     summary: Registra o pagamento de uma consulta
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *               - method
 *             properties:
 *               appointmentId:
 *                 type: string
 *               method:
 *                 type: string
 *                 enum: [PIX, CREDIT_CARD, DEBIT_CARD, CASH]
 *               discount:
 *                 type: number
 *               installments:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Pagamento registrado
 *       400:
 *         description: Erro nas regras de parcelamento
 *       403:
 *         description: Recepcionista tentou aplicar desconto > 20%
 */
router.post('/', createPayment);

/**
 * @swagger
 * /api/finance:
 *   get:
 *     summary: "Lista o faturamento e os pagamentos (opcional: filtra por data)"
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de pagamentos
 */
router.get('/', getFinancials);

/**
 * @swagger
 * /api/finance/defaulters:
 *   get:
 *     summary: "Lista os pacientes inadimplentes (consultas concluídas sem pagamento)"
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de inadimplentes
 */
router.get('/defaulters', getDefaulters);

/**
 * @swagger
 * /api/finance/reports:
 *   get:
 *     summary: "Obtém faturamento agregado (diário, mensal, anual)"
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Objeto com daily, monthly e yearly
 */
router.get('/reports', getReports);

/**
 * @swagger
 * /api/finance/{id}/refund:
 *   post:
 *     summary: Estorna um pagamento exigindo justificativa
 *     tags: [Finance]
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
 *             required:
 *               - refundReason
 *             properties:
 *               refundReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pagamento estornado
 */
router.post('/:id/refund', refundPayment);

/**
 * @swagger
 * /api/finance/{id}/receipt:
 *   post:
 *     summary: Envia comprovante por WhatsApp (Mock)
 *     tags: [Finance]
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
 *         description: Comprovante enviado
 */
router.post('/:id/receipt', sendReceipt);

export default router;
