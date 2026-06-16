import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutos

export const register = async (req: Request, res: Response) => {
  try {
    const { tenantName, name, email, password } = req.body;

    if (!tenantName || !name || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já está em uso' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        users: {
          create: {
            name,
            email,
            password: hashedPassword,
            role: 'ADMIN', // Primeiro usuário da clínica é ADMIN
          },
        },
      },
      include: {
        users: true,
      },
    });

    return res.status(201).json({ message: 'Clínica e usuário criados com sucesso', tenant });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar se está bloqueado
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(403).json({ error: 'Conta bloqueada temporariamente devido a múltiplas tentativas falhas.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const newAttempts = user.failedLoginAttempts + 1;
      let lockedUntil = null;

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        lockedUntil = new Date(Date.now() + LOCK_TIME_MS);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          lockedUntil,
        },
      });

      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Login com sucesso, resetar tentativas
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    const token = jwt.sign(
      { id: user.id, tenantId: user.tenantId, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' } // 7 dias de sessão
    );

    return res.json({ token, role: user.role });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const recoverPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  // TODO: Implementar lógica real de envio de e-mail (Mock por enquanto)
  return res.json({ message: 'Se o e-mail existir, um link de recuperação foi enviado.' });
};
