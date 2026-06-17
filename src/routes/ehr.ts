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
  deleteAttachment
} from '../controllers/ehrController';

const router = Router();

router.use(authenticate);

// Anamnese
router.get('/patients/:patientId/anamnesis', getAnamnesis);
router.post('/patients/:patientId/anamnesis', upsertAnamnesis); // Usado para criar ou atualizar

// Planos de Tratamento (Orçamentos)
router.get('/patients/:patientId/treatment-plans', getTreatmentPlans);
router.post('/patients/:patientId/treatment-plans', createTreatmentPlan);
router.put('/treatment-plans/:planId/status', updateTreatmentPlanStatus);
router.delete('/treatment-plans/:planId', deleteTreatmentPlan);

// Odontograma
router.get('/patients/:patientId/odontogram', getToothConditions);
router.post('/patients/:patientId/odontogram', updateToothCondition);

// Anexos (Arquivos)
router.get('/patients/:patientId/attachments', getAttachments);
router.post('/patients/:patientId/attachments', upload.single('file'), uploadAttachment);
router.delete('/attachments/:attachmentId', deleteAttachment);

export default router;
