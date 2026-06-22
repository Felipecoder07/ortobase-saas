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

    let whereClause: any = { patientId, tenantId };

    if ((req.user as any)?.role === 'DENTIST') {
      const authDentist = await prisma.dentist.findFirst({ where: { email: (req.user as any)?.email, tenantId } });
      if (authDentist) {
        whereClause.dentistId = authDentist.id;
      } else {
        return res.json([]);
      }
    }

    const plans = await prisma.treatmentPlan.findMany({
      where: whereClause,
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
    console.error('Error updating tooth condition:', error);
    return res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
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

// --- ASSINATURAS DIGITAIS ---
import fs from 'fs';
import path from 'path';

const saveBase64Image = (base64String: string, filenamePrefix: string): string => {
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 string');
  }

  const imageBuffer = Buffer.from(matches[2], 'base64');
  const filename = `${filenamePrefix}-${Date.now()}.png`;
  const uploadDir = path.join(__dirname, '../../uploads/signatures');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, imageBuffer);

  return `/uploads/signatures/${filename}`;
};

export const signAnamnesis = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { patientId } = req.params;
    const { signatureDataUrl } = req.body;

    if (!signatureDataUrl) return res.status(400).json({ error: 'Signature data is required' });

    const signatureUrl = saveBase64Image(signatureDataUrl, `anamnesis-${patientId}`);

    const anamnesis = await prisma.anamnesis.upsert({
      where: { patientId },
      update: {
        signatureUrl,
        signedAt: new Date()
      },
      create: {
        tenantId,
        patientId,
        signatureUrl,
        signedAt: new Date()
      }
    });

    return res.json(anamnesis);
  } catch (error) {
    console.error('Error signing anamnesis:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const unlockAnamnesis = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { patientId } = req.params;

    const anamnesis = await prisma.anamnesis.update({
      where: { patientId },
      data: {
        signatureUrl: null,
        signedAt: null
      }
    });

    return res.json(anamnesis);
  } catch (error) {
    console.error('Error unlocking anamnesis:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const signTreatmentPlan = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { planId } = req.params;
    const { signatureDataUrl } = req.body;

    if (!signatureDataUrl) return res.status(400).json({ error: 'Signature data is required' });

    const signatureUrl = saveBase64Image(signatureDataUrl, `plan-${planId}`);

    const plan = await prisma.treatmentPlan.update({
      where: { id: planId, tenantId },
      data: {
        signatureUrl,
        signedAt: new Date()
      }
    });

    return res.json(plan);
  } catch (error) {
    console.error('Error signing treatment plan:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOdontogramLegends = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const legends = await prisma.odontogramLegend.findMany({
      where: { tenantId: tenantId! }
    });
    return res.json(legends);
  } catch (error) {
    console.error('Error getting odontogram legends:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const addOdontogramLegend = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { name, color } = req.body;
    
    if (!name || !color) return res.status(400).json({ error: 'Name and color are required' });

    const existing = await prisma.odontogramLegend.findUnique({
      where: { tenantId_name: { tenantId: tenantId!, name } }
    });

    if (existing) {
      const updated = await prisma.odontogramLegend.update({
        where: { id: existing.id },
        data: { color }
      });
      return res.json(updated);
    }

    const legend = await prisma.odontogramLegend.create({
      data: {
        tenantId: tenantId!,
        name,
        color
      }
    });
    return res.json(legend);
  } catch (error) {
    console.error('Error adding odontogram legend:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteOdontogramLegend = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { name } = req.params;

    // Remove conditions matching this legend name
    await prisma.toothCondition.deleteMany({
      where: { tenantId: tenantId!, condition: name }
    });

    // Remove the legend
    await prisma.odontogramLegend.deleteMany({
      where: { tenantId: tenantId!, name }
    });
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting odontogram legend:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// In-memory map for mobile signatures
const mobileSignatures = new Map<string, string>();

export const receiveMobileSignature = async (req: Request, res: Response) => {
  try {
    const { token, signatureDataUrl } = req.body;
    if (!token || !signatureDataUrl) return res.status(400).json({ error: 'Missing token or signature' });
    mobileSignatures.set(token, signatureDataUrl);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const pollMobileSignature = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    if (mobileSignatures.has(token)) {
      const signatureDataUrl = mobileSignatures.get(token);
      mobileSignatures.delete(token); // Clear once retrieved
      return res.json({ signatureDataUrl });
    }
    return res.status(202).json({ status: 'pending' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
