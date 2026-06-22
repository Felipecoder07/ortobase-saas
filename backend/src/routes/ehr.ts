import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middlewares/authMiddleware';

// Configuração do Multer para salvar os uploads localmente
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });
import {
  getAnamnesis,
  upsertAnamnesis,
  getTreatmentPlans,
  createTreatmentPlan,
  updateTreatmentPlanStatus,
  deleteTreatmentPlan,
  getToothConditions,
  updateToothCondition,
  getAttachments,
  uploadAttachment,
  deleteAttachment,
  signAnamnesis,
  unlockAnamnesis,
  signTreatmentPlan,
  receiveMobileSignature,
  pollMobileSignature,
  getOdontogramLegends,
  addOdontogramLegend,
  deleteOdontogramLegend
} from '../controllers/ehrController';

const router = Router();

import { authenticate, requireRole } from '../middlewares/authMiddleware';

// Rotas públicas para assinatura no celular
router.post('/mobile-sign', receiveMobileSignature);
router.get('/mobile-sign/:token', pollMobileSignature);

router.use(authenticate);

// Anamnese
router.get('/patients/:patientId/anamnesis', requireRole(['ADMIN', 'DENTIST']), getAnamnesis);
router.post('/patients/:patientId/anamnesis', requireRole(['ADMIN', 'DENTIST']), upsertAnamnesis); // Usado para criar ou atualizar
router.post('/patients/:patientId/anamnesis/sign', requireRole(['ADMIN', 'DENTIST']), signAnamnesis);
router.post('/patients/:patientId/anamnesis/unlock', requireRole(['ADMIN', 'DENTIST']), unlockAnamnesis);

// Planos de Tratamento (Orçamentos)
router.get('/patients/:patientId/treatment-plans', getTreatmentPlans);
router.post('/patients/:patientId/treatment-plans', requireRole(['ADMIN', 'DENTIST']), createTreatmentPlan);
router.put('/treatment-plans/:planId/status', updateTreatmentPlanStatus);
router.delete('/treatment-plans/:planId', requireRole(['ADMIN', 'DENTIST']), deleteTreatmentPlan);
router.post('/treatment-plans/:planId/sign', signTreatmentPlan);

// Odontograma
router.get('/odontogram-legends', getOdontogramLegends);
router.post('/odontogram-legends', requireRole(['ADMIN']), addOdontogramLegend);
router.delete('/odontogram-legends/:name', requireRole(['ADMIN']), deleteOdontogramLegend);
router.get('/patients/:patientId/odontogram', requireRole(['ADMIN', 'DENTIST']), getToothConditions);
router.post('/patients/:patientId/odontogram', requireRole(['ADMIN', 'DENTIST']), updateToothCondition);

// Anexos (Arquivos)
router.get('/patients/:patientId/attachments', requireRole(['ADMIN', 'DENTIST']), getAttachments);
router.post('/patients/:patientId/attachments', requireRole(['ADMIN', 'DENTIST']), upload.single('file'), uploadAttachment);
router.delete('/attachments/:attachmentId', requireRole(['ADMIN', 'DENTIST']), deleteAttachment);

export default router;
