import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../prisma';
import { AppError } from '../utils/AppError';

export const createAppointment = async (req: AuthRequest, res: Response) => {
    const { tenantId } = req.user!;
    const { patientId, dentistId, date, durationInMinutes, serviceType, price, procedureIds } = req.body;

    const appointmentDate = new Date(date);
    const appointmentEnd = new Date(appointmentDate.getTime() + durationInMinutes * 60000);

    // Validação de Conflito de Horário para o mesmo dentista
    const startOfDay = new Date(appointmentDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Validação de Conflito de Horário para o paciente
    const patientConflictingAppointments = await prisma.appointment.findMany({
      where: {
        tenantId,
        patientId,
        status: { not: 'CANCELED' },
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    const hasPatientConflict = patientConflictingAppointments.some(conflicting => {
      const confStart = conflicting.date.getTime();
      const confEnd = confStart + conflicting.durationInMinutes * 60000;
      const reqStart = appointmentDate.getTime();
      const reqEnd = appointmentEnd.getTime();

      return reqStart < confEnd && reqEnd > confStart;
    });

    if (hasPatientConflict) {
      throw new AppError('O paciente já possui uma consulta agendada neste mesmo horário.', 400);
    }

    const conflictingAppointments = await prisma.appointment.findMany({
      where: {
        tenantId,
        dentistId,
        status: { not: 'CANCELED' },
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    const hasConflict = conflictingAppointments.some(conflicting => {
      const BUFFER = 10 * 60000; // 10 minutos em milissegundos
      const confStart = conflicting.date.getTime();
      const confEnd = confStart + conflicting.durationInMinutes * 60000;
      
      const blockedStart = confStart - BUFFER;
      const blockedEnd = confEnd + BUFFER;

      const reqStart = appointmentDate.getTime();
      const reqEnd = appointmentEnd.getTime();

      return reqStart < blockedEnd && reqEnd > blockedStart;
    });

    if (hasConflict) {
      throw new AppError('Conflito! É necessário um intervalo mínimo de 10 minutos entre as consultas.', 400);
    }

    const appointment = await prisma.appointment.create({
      data: {
        tenantId,
        patientId,
        dentistId,
        date: appointmentDate,
        durationInMinutes,
        serviceType,
        price: price !== undefined ? Number(price) : 0,
        ...(procedureIds && procedureIds.length > 0 && {
          procedures: {
            connect: procedureIds.map((id: string) => ({ id }))
          }
        })
      },
      include: {
        patient: true,
        dentist: true,
        procedures: true
      }
    });

    return res.status(201).json(appointment);
};

export const getAppointments = async (req: AuthRequest, res: Response) => {
    const { tenantId } = req.user!;
    const { date, start, end } = req.query;

    let whereClause: any = { tenantId };

    if (start && end) {
      whereClause.date = {
        gte: new Date(String(start)),
        lte: new Date(String(end))
      };
    } else if (date) {
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
        dentist: { select: { name: true, cro: true, gender: true } },
        payment: true,
        procedures: { select: { id: true, name: true, basePrice: true } }
      },
      orderBy: { date: 'asc' }
    });

    return res.json(appointments);
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
    const { tenantId } = req.user!;
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const appointment = await prisma.appointment.findFirst({
      where: { id, tenantId }
    });

    if (!appointment) {
      throw new AppError('Consulta não encontrada', 404);
    }

    const updated = await prisma.appointment.update({
      where: { id: id as string },
      data: { status, cancellationReason }
    });

    return res.json(updated);
};

export const deleteAppointment = async (req: AuthRequest, res: Response) => {
    const { tenantId } = req.user!;
    const { id } = req.params;

    const appointment = await prisma.appointment.findFirst({
      where: { id: id as string, tenantId: tenantId as string }
    });

    if (!appointment) {
      throw new AppError('Consulta não encontrada', 404);
    }

    await prisma.appointment.delete({
      where: { id: id as string }
    });

    return res.json({ message: 'Consulta excluída' });
};

export const updateAppointment = async (req: AuthRequest, res: Response) => {
    const { tenantId } = req.user!;
    const { id } = req.params;
    const { patientId, dentistId, date, durationInMinutes, serviceType, price, procedureIds } = req.body;

    const appointment = await prisma.appointment.findFirst({
      where: { id, tenantId }
    });

    if (!appointment) {
      throw new AppError('Consulta não encontrada', 404);
    }

    const appointmentDate = new Date(date);
    const appointmentEnd = new Date(appointmentDate.getTime() + durationInMinutes * 60000);

    const startOfDay = new Date(appointmentDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Validação de Conflito de Horário para o paciente
    const patientConflictingAppointments = await prisma.appointment.findMany({
      where: {
        tenantId: tenantId as string,
        patientId: patientId as string,
        id: { not: id as string },
        status: { not: 'CANCELED' },
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    const hasPatientConflict = patientConflictingAppointments.some(conflicting => {
      const confStart = conflicting.date.getTime();
      const confEnd = confStart + conflicting.durationInMinutes * 60000;
      const reqStart = appointmentDate.getTime();
      const reqEnd = appointmentEnd.getTime();

      return reqStart < confEnd && reqEnd > confStart;
    });

    if (hasPatientConflict) {
      throw new AppError('O paciente já possui uma consulta agendada neste mesmo horário.', 400);
    }

    const conflictingAppointments = await prisma.appointment.findMany({
      where: {
        tenantId: tenantId as string,
        dentistId: dentistId as string,
        id: { not: id as string },
        status: { not: 'CANCELED' },
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    const hasConflict = conflictingAppointments.some(conflicting => {
      const BUFFER = 10 * 60000; // 10 minutos em milissegundos
      const confStart = conflicting.date.getTime();
      const confEnd = confStart + conflicting.durationInMinutes * 60000;
      
      const blockedStart = confStart - BUFFER;
      const blockedEnd = confEnd + BUFFER;

      const reqStart = appointmentDate.getTime();
      const reqEnd = appointmentEnd.getTime();

      return reqStart < blockedEnd && reqEnd > blockedStart;
    });

    if (hasConflict) {
      throw new AppError('Conflito! É necessário um intervalo mínimo de 10 minutos entre as consultas.', 400);
    }

    const updated = await prisma.appointment.update({
      where: { id: id as string },
      data: { 
        patientId, 
        dentistId, 
        date: appointmentDate, 
        durationInMinutes, 
        serviceType,
        ...(price !== undefined && { price: Number(price) }),
        ...(procedureIds !== undefined && {
          procedures: {
            set: procedureIds.map((id: string) => ({ id }))
          }
        })
      },
      include: { patient: true, dentist: true, procedures: true }
    });

    return res.json(updated);
};
