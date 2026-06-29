import { Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma';
import { TenantRequest } from '../middlewares/authMiddleware';

export const getClinicUsers = async (req: TenantRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { tenantId: req.user.tenantId, role: { not: 'SUPER_ADMIN' } },
      select: { id: true, name: true, email: true, role: true, createdAt: true, lockedUntil: true }
    });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno' });
  }
};

export const createClinicUser = async (req: TenantRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    
    const tenant = await prisma.tenant.findUnique({ where: { id: req.user.tenantId } });
    if (!tenant) return res.status(404).json({ error: 'Clínica não encontrada' });

    // Checar limites do plano do tenant
    const userCount = await prisma.user.count({ where: { tenantId: req.user.tenantId, role: { not: 'SUPER_ADMIN' } } });
    
    if (tenant.plan === 'FREE' && userCount >= 3) {
      return res.status(400).json({ error: 'Limite de 3 usuários atingido no plano FREE. Faça o upgrade.' });
    }
    if (tenant.plan === 'PRO' && userCount >= 10) {
      return res.status(400).json({ error: 'Limite de 10 usuários atingido no plano PRO. Faça o upgrade.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'E-mail já está em uso' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        tenantId: req.user.tenantId
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno' });
  }
};

export const updateClinicUser = async (req: TenantRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role, password } = req.body;
    
    const targetUser = await prisma.user.findFirst({ where: { id, tenantId: req.user.tenantId } });
    if (!targetUser) return res.status(404).json({ error: 'Usuário não encontrado' });
    
    let updateData: any = { name, role };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno' });
  }
};

export const deleteClinicUser = async (req: TenantRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (id === req.user.id) return res.status(400).json({ error: 'Não é possível excluir a si mesmo' });

    const targetUser = await prisma.user.findFirst({ where: { id, tenantId: req.user.tenantId } });
    if (!targetUser) return res.status(404).json({ error: 'Usuário não encontrado' });
    
    await prisma.user.delete({ where: { id } });
    return res.json({ message: 'Excluído com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno' });
  }
};
