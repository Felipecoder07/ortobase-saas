import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../prisma';
import { validateCPF } from '../utils/cpfValidator';

export const createPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { name, cpf, dateOfBirth, phone, email, address, clinicalNotes, avatarUrl } = req.body;



    // Check unique CPF in tenant
    const existingPatient = await prisma.patient.findUnique({
      where: { tenantId_cpf: { tenantId, cpf } }
    });

    if (existingPatient) {
      return res.status(400).json({ error: 'Já existe um paciente cadastrado com este CPF nesta clínica.' });
    }

    const patient = await prisma.patient.create({
      data: {
        tenantId,
        name,
        cpf,
        dateOfBirth: new Date(dateOfBirth),
        phone,
        email,
        address,
        clinicalNotes,
        avatarUrl
      }
    });

    return res.status(201).json(patient);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const getPatients = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { query } = req.query;

    let whereClause: any = { tenantId, isActive: true };

    if (query) {
      whereClause.OR = [
        { name: { contains: String(query) } },
        { cpf: { contains: String(query) } },
        { phone: { contains: String(query) } }
      ];
    }

    const patients = await prisma.patient.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      take: 50
    });

    return res.json(patients);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const getPatientById = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { id } = req.params;

    const patient = await prisma.patient.findFirst({
      where: { id, tenantId, isActive: true },
      include: {
        appointments: {
          include: {
            dentist: { select: { name: true } },
            payment: true
          },
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    return res.json(patient);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const updatePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { id } = req.params;
    const { name, phone, email, address, clinicalNotes, cpf, avatarUrl } = req.body;



    const patient = await prisma.patient.findFirst({
      where: { id, tenantId }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: { name, phone, email, address, clinicalNotes, cpf, avatarUrl }
    });

    return res.json(updatedPatient);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const deletePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { id } = req.params;

    const patient = await prisma.patient.findFirst({
      where: { id, tenantId }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    // Soft Delete
    await prisma.patient.update({
      where: { id },
      data: { isActive: false }
    });

    return res.json({ message: 'Paciente inativado com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};
