import { Request, Response } from 'express';
import prisma from '../prisma';

// --- ANAMNESE ---

export const getAnamnesis = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { patientId } = req.params;

    const anamnesis = await prisma.anamnesis.findUnique({
      where: { patientId },
    });

    if (!anamnesis) {
      return res.status(404).json({ error: 'Anamnesis not found' });
    }

    // Garante que é do mesmo tenant
    if (anamnesis.tenantId !== tenantId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.json(anamnesis);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const upsertAnamnesis = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { patientId } = req.params;
    const { mainComplaint, allergies, medicationsInUse, chronicDiseases, previousSurgeries, observations } = req.body;

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, tenantId }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const anamnesis = await prisma.anamnesis.upsert({
      where: { patientId },
      update: {
        mainComplaint,
        allergies,
        medicationsInUse,
        chronicDiseases,
        previousSurgeries,
        observations
      },
      create: {
        tenantId,
        patientId,
        mainComplaint,
        allergies,
        medicationsInUse,
        chronicDiseases,
        previousSurgeries,
        observations
      }
    });

    return res.json(anamnesis);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// --- PLANOS DE TRATAMENTO ---

export const getTreatmentPlans = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { patientId } = req.params;

    const plans = await prisma.treatmentPlan.findMany({
      where: { patientId, tenantId },
      include: {
        dentist: { select: { id: true, name: true } },
        items: {
          include: { procedure: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(plans);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTreatmentPlan = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id; // Assumindo que req.user tem id do usuario logado
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { patientId } = req.params;
    const { items, discount, notes, dentistId } = req.body;

    // Calcula total
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += Number(item.price);
    }
    
    // Desconto se houver
    const finalDiscount = discount ? Number(discount) : 0;
    
    const plan = await prisma.treatmentPlan.create({
      data: {
        tenantId,
        patientId,
        dentistId,
        totalAmount,
        discount: finalDiscount,
        notes,
        items: {
          create: items.map((item: any) => ({
            procedureId: item.procedureId,
            price: Number(item.price),
            tooth: item.tooth,
            notes: item.notes
          }))
        }
      },
      include: { items: true, dentist: { select: { name: true } } }
    });

    return res.status(201).json(plan);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTreatmentPlanStatus = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { planId } = req.params;
    const { status } = req.body;

    const plan = await prisma.treatmentPlan.update({
      where: { id: planId, tenantId },
      data: { status }
    });

    return res.json(plan);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTreatmentPlan = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { planId } = req.params;

    await prisma.treatmentPlan.delete({
      where: { id: planId, tenantId }
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// --- ODONTOGRAMA ---

export const getToothConditions = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { patientId } = req.params;
    const conditions = await prisma.toothCondition.findMany({
      where: { patientId, tenantId }
    });

    return res.json(conditions);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateToothCondition = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { patientId } = req.params;
    const { toothNumber, face, condition, notes } = req.body;

    const upsertedCondition = await prisma.toothCondition.upsert({
      where: {
        patientId_toothNumber_face: {
          patientId,
          toothNumber,
          face
        }
      },
      update: { condition, notes },
      create: {
        tenantId,
        patientId,
        toothNumber,
        face,
        condition,
        notes
      }
    });

    return res.json(upsertedCondition);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// --- ANEXOS ---

export const getAttachments = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { patientId } = req.params;
    const attachments = await prisma.patientAttachment.findMany({
      where: { patientId, tenantId },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(attachments);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadAttachment = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { patientId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const attachment = await prisma.patientAttachment.create({
      data: {
        tenantId,
        patientId,
        filename: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype,
        uploadedBy: req.user?.name || req.user?.email || 'User'
      }
    });

    return res.status(201).json(attachment);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAttachment = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { attachmentId } = req.params;

    // Ideally, also delete file from disk using fs.unlink
    await prisma.patientAttachment.delete({
      where: { id: attachmentId, tenantId }
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
