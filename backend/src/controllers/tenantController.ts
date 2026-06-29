import { Response } from 'express';
import prisma from '../prisma';
import { TenantRequest } from '../middlewares/authMiddleware';

export const getMyTenantSettings = async (req: TenantRequest, res: Response) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.user.tenantId },
      select: {
        id: true,
        name: true,
        plan: true,
        status: true,
        planExpiresAt: true,
        trialEndsAt: true,
        createdAt: true
      }
    });
    return res.json(tenant);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const updateMyTenantSettings = async (req: TenantRequest, res: Response) => {
  try {
    const { name } = req.body;
    const tenant = await prisma.tenant.update({
      where: { id: req.user.tenantId },
      data: { name },
      select: { id: true, name: true, plan: true, status: true }
    });
    return res.json(tenant);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};
