import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import crypto from 'crypto';

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

    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: { select: { status: true } } }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (user.tenant && user.tenant.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Sua conta está suspensa. Entre em contato com o suporte.' });
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

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não definido');
    }

    const token = jwt.sign(
      { id: user.id, tenantId: user.tenantId, role: user.role, email: user.email },
      process.env.JWT_SECRET,
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
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = crypto.randomBytes(20).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpires: new Date(Date.now() + 3600000) // 1 hora
      }
    });
    console.log(`[E-mail Mock] Link de recuperação para ${email}: http://localhost:5173/reset-password?token=${token}`);
  }
  
  return res.json({ message: 'Se o e-mail existir, um link de recuperação foi enviado.' });
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      }
    });

    return res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, role: true } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, password } = req.body;
    
    let updateData: any = { name };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true }
    });
    
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};
