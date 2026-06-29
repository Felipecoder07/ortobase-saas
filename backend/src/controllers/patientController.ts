import { Response } from 'express';
import { TenantRequest } from '../middlewares/authMiddleware';
import prisma from '../prisma';
import { validateCPF } from '../utils/cpfValidator';

export const createPatient = async (req: TenantRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { name, cpf, dateOfBirth, phone, email, address, clinicalNotes, avatarUrl } = req.body;

    if (!validateCPF(cpf)) {
      return res.status(400).json({ error: 'CPF inválido.' });
    }

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

    await prisma.auditLog.create({
      data: {
        tenantId,
        action: 'PATIENT_CREATED',
        details: `Paciente ${patient.name} criado`,
        userEmail: req.user!.email
      }
    });

    return res.status(201).json(patient);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const getPatients = async (req: TenantRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { query, page = '1', limit = '10' } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    let whereClause: any = { tenantId, isActive: true };

    if (query) {
      whereClause.OR = [
        { name: { contains: String(query) } },
        { cpf: { contains: String(query) } },
        { phone: { contains: String(query) } }
      ];
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where: whereClause,
        orderBy: { name: 'asc' },
        skip,
        take: limitNumber
      }),
      prisma.patient.count({ where: whereClause })
    ]);

    return res.json({
      data: patients,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber) || 1
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const getPatientById = async (req: TenantRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { id } = req.params;

    const patient = await prisma.patient.findFirst({
      where: { id, tenantId, isActive: true },
      include: {
        appointments: {
          include: {
            dentist: { select: { name: true } },
            payments: true
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

export const updatePatient = async (req: TenantRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { id } = req.params;
    const { name, phone, email, address, clinicalNotes, cpf, avatarUrl } = req.body;

    if (cpf && !validateCPF(cpf)) {
      return res.status(400).json({ error: 'CPF inválido.' });
    }

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

export const deletePatient = async (req: TenantRequest, res: Response) => {
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
