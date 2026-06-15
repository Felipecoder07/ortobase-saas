import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../prisma';

export const createDentist = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { name, cro, specialties, phone, email } = req.body;

    const dentist = await prisma.dentist.create({
      data: {
        tenantId,
        name,
        cro,
        specialties,
        phone,
        email
      }
    });

    return res.status(201).json(dentist);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const getDentists = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { query } = req.query;

    let whereClause: any = { tenantId, isActive: true };

    if (query) {
      whereClause.OR = [
        { name: { contains: String(query) } },
        { cro: { contains: String(query) } }
      ];
    }

    const dentists = await prisma.dentist.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    });

    return res.json(dentists);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const getDentistById = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { id } = req.params;

    const dentist = await prisma.dentist.findFirst({
      where: { id, tenantId, isActive: true }
    });

    if (!dentist) {
      return res.status(404).json({ error: 'Dentista não encontrado' });
    }

    return res.json(dentist);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const updateDentist = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { id } = req.params;
    const { name, cro, specialties, phone, email } = req.body;

    const dentist = await prisma.dentist.findFirst({
      where: { id, tenantId }
    });

    if (!dentist) {
      return res.status(404).json({ error: 'Dentista não encontrado' });
    }

    const updatedDentist = await prisma.dentist.update({
      where: { id },
      data: { name, cro, specialties, phone, email }
    });

    return res.json(updatedDentist);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const deleteDentist = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { id } = req.params;

    const dentist = await prisma.dentist.findFirst({
      where: { id, tenantId }
    });

    if (!dentist) {
      return res.status(404).json({ error: 'Dentista não encontrado' });
    }

    // Soft Delete
    await prisma.dentist.update({
      where: { id },
      data: { isActive: false }
    });

    return res.json({ message: 'Dentista inativado com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};
