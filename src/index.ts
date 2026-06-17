import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';

const app = express();

import path from 'path';

app.use(cors());
app.use(express.json());
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

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/dentists', dentistRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/procedures', procedureRoutes);
app.use('/api/ehr', ehrRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
