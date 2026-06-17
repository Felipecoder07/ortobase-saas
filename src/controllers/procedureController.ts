import { Request, Response } from 'express';
import prisma from '../prisma';

export const getProcedures = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const procedures = await prisma.procedure.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' }
    });

    return res.json(procedures);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProcedure = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, description, basePrice } = req.body;

    const procedure = await prisma.procedure.create({
      data: {
        tenantId,
        name,
        description,
        basePrice: Number(basePrice)
      }
    });

    return res.status(201).json(procedure);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProcedure = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const { name, description, basePrice, isActive } = req.body;

    const procedure = await prisma.procedure.update({
      where: { id, tenantId },
      data: {
        name,
        description,
        basePrice: basePrice !== undefined ? Number(basePrice) : undefined,
        isActive
      }
    });

    return res.json(procedure);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProcedure = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;

    // Apenas marca como inativo em vez de deletar para manter histórico
    await prisma.procedure.update({
      where: { id, tenantId },
      data: { isActive: false }
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
