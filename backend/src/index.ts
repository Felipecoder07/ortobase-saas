import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import path from 'path';

dotenv.config();

const app = express();

// Segurança: Proteção de Headers Http
app.use(helmet());

// Segurança: Rate Limiting Global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // Limite de 200 requisições por IP a cada 15 min
  message: { error: 'Muitas requisições deste IP, tente novamente mais tarde.' }
});
app.use('/api', globalLimiter);

app.use(cors({
  origin: function(origin, callback) {
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logger básico de auditoria
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('API Bot Clínica Odontológica rodando. Acesse /api-docs para a documentação Swagger.');
});

import patientRoutes from './routes/patients';
import dentistRoutes from './routes/dentists';
import appointmentRoutes from './routes/appointments';
import financeRoutes from './routes/finance';
import procedureRoutes from './routes/procedures';
import ehrRoutes from './routes/ehr';
import uploadRoutes from './routes/upload';
import superAdminRoutes from './routes/superAdmin';
import usersRoutes from './routes/users';
import tenantRoutes from './routes/tenant';
import auditRoutes from './routes/audit';

import { errorHandler } from './middlewares/errorHandler';

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/dentists', dentistRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/procedures', procedureRoutes);
app.use('/api/ehr', ehrRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/audit', auditRoutes);

// Middleware de Erros (DEVE ser o último)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(Number(PORT), () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
