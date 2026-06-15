import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../prisma';

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { patientId, dentistId, date, durationInMinutes, serviceType } = req.body;

    const appointmentDate = new Date(date);
    const appointmentEnd = new Date(appointmentDate.getTime() + durationInMinutes * 60000);

    // Validação de Conflito de Horário para o mesmo dentista
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        tenantId,
        dentistId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        OR: [
          {
            // Começa durante outra consulta
            date: {
              lt: appointmentEnd,
              gte: appointmentDate
            }
          },
          {
            // Outra consulta começa durante esta
            date: {
              lte: appointmentDate
            },
            // Note: Simplificamos a checagem no SQLite iterando se precisarmos, 
            // mas o ideal é fazer a checagem exata. 
            // Para garantir MVP, vamos checar qualquer consulta que ocorra +- na mesma hora.
          }
        ]
      }
    });

    // Filtro mais preciso no JS para evitar limitações do SQLite em expressões matemáticas
    if (conflictingAppointment) {
      const confStart = conflictingAppointment.date.getTime();
      const confEnd = confStart + conflictingAppointment.durationInMinutes * 60000;
      const reqStart = appointmentDate.getTime();
      const reqEnd = appointmentEnd.getTime();

      if ((reqStart >= confStart && reqStart < confEnd) || (reqEnd > confStart && reqEnd <= confEnd) || (reqStart <= confStart && reqEnd >= confEnd)) {
         return res.status(400).json({ error: 'Conflito de horário! O dentista já possui uma consulta neste período.' });
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        tenantId,
        patientId,
        dentistId,
        date: appointmentDate,
        durationInMinutes,
        serviceType
      },
      include: {
        patient: true,
        dentist: true
      }
    });

    return res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { date } = req.query; // format YYYY-MM-DD

    let whereClause: any = { tenantId };

    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: { select: { name: true, cpf: true, phone: true } },
        dentist: { select: { name: true, cro: true } },
        payment: true
      },
      orderBy: { date: 'asc' }
    });

    return res.json(appointments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const appointment = await prisma.appointment.findFirst({
      where: { id, tenantId }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Consulta não encontrada' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status, cancellationReason }
    });

    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const deleteAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { id } = req.params;

    const appointment = await prisma.appointment.findFirst({
      where: { id, tenantId }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Consulta não encontrada' });
    }

    await prisma.appointment.delete({
      where: { id }
    });

    return res.json({ message: 'Consulta excluída' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};
