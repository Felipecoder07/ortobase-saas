import { Router } from 'express';
import { register, login, recoverPassword, resetPassword, getProfile, updateProfile } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra a clínica e o primeiro usuário (Admin)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenantName
 *               - name
 *               - email
 *               - password
 *             properties:
 *               tenantName:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Clínica e usuário criados
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza login no sistema e retorna JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sucesso (Retorna Token)
 *       401:
 *         description: Credenciais inválidas
 *       403:
 *         description: Conta bloqueada
 */
router.post('/login', login);
router.post('/recover-password', recoverPassword);
router.post('/reset-password', resetPassword);

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;
