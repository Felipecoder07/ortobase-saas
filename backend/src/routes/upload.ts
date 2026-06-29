import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

router.post('/', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({ url: fileUrl });
});

export default router;
