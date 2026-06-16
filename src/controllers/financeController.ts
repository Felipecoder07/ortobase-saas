import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../prisma';

export const createPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId, role } = req.user!;
    const { appointmentId, method, amount, serviceType, installments = 1 } = req.body;

    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, tenantId }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Consulta não encontrada' });
    }

    const finalAmount = amount !== undefined ? Number(amount) : (appointment.price || 0);

    // Regra: Parcela mínima R$30 no cartão
    if (['CREDIT_CARD'].includes(method) && installments > 1) {
      const installmentValue = finalAmount / installments;
      if (installmentValue < 30) {
        return res.status(400).json({ error: 'O valor mínimo por parcela é de R$ 30,00.' });
      }
    } else if (method !== 'CREDIT_CARD' && installments > 1) {
       return res.status(400).json({ error: 'Parcelamento só é permitido no cartão de crédito.' });
    }

    // Calcula o desconto se o valor pago for menor que o valor original da consulta
    const originalPrice = appointment.price || 0;
    const discount = originalPrice > finalAmount ? (originalPrice - finalAmount) : 0;

    // Atualiza a consulta apenas com o novo serviço (se houver), preservando o preço original
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        ...(serviceType !== undefined && { serviceType })
      }
    });

    const payment = await prisma.payment.create({
      data: {
        tenantId,
        appointmentId,
        amount: finalAmount,
        method,
        discount,
        installments,
        status: 'PAID' // MVP: assumed paid upon registration
      }
    });

    return res.status(201).json(payment);
  } catch (error) {
    // Unique constraint on appointmentId
    if ((error as any).code === 'P2002') {
       return res.status(400).json({ error: 'Esta consulta já possui um pagamento registrado.' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const getFinancials = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { date } = req.query; // optional date filter YYYY-MM-DD

    let whereClause: any = { tenantId };

    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      whereClause.createdAt = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        appointment: {
          include: {
            patient: { select: { name: true } },
            dentist: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(payments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const refundPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { id } = req.params;
    const { refundReason } = req.body;

    if (!refundReason) {
      return res.status(400).json({ error: 'Justificativa de estorno é obrigatória.' });
    }

    const payment = await prisma.payment.findFirst({
      where: { id, tenantId }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: { status: 'REFUNDED', refundReason }
    });

    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const getDefaulters = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { month } = req.query; // YYYY-MM
    
    let whereClause: any = {
      tenantId,
      status: 'COMPLETED',
      payment: null
    };

    if (month) {
      const year = parseInt((month as string).split('-')[0]);
      const monthIndex = parseInt((month as string).split('-')[1]) - 1;
      const startOfMonth = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));
      
      whereClause.date = {
        gte: startOfMonth,
        lte: endOfMonth
      };
    }

    // Inadimplentes: Consultas com status COMPLETED que não têm pagamento associado
    const defaulters = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: { select: { name: true, phone: true } },
        dentist: { select: { name: true } }
      },
      orderBy: { date: 'asc' }
    });

    return res.json(defaulters);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const sendReceipt = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { id } = req.params; // payment ID

    const payment = await prisma.payment.findFirst({
      where: { id, tenantId },
      include: {
        appointment: {
          include: { patient: true }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    // Mock envio WhatsApp
    console.log(`[WhatsApp Mock] Comprovante de R$ ${payment.amount} enviado para o paciente ${payment.appointment.patient.name} (${payment.appointment.patient.phone})`);

    return res.json({ success: true, message: 'Comprovante enviado com sucesso via WhatsApp' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor ao enviar comprovante' });
  }
};

export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { month } = req.query; // YYYY-MM
    
    const targetDate = month ? new Date(`${month}-01T12:00:00.000Z`) : new Date();
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();
    
    // Buscar todos os pagamentos PAID para agregar
    const payments = await prisma.payment.findMany({
      where: { tenantId, status: 'PAID' },
      select: { amount: true, createdAt: true }
    });

    const isCurrentMonth = !month || (targetYear === new Date().getFullYear() && targetMonth === new Date().getMonth());
    
    let daily = 0;
    let monthly = 0;
    let yearly = 0;

    payments.forEach(p => {
      const pDate = new Date(p.createdAt);
      if (pDate.getFullYear() === targetYear) {
        yearly += p.amount;
        if (pDate.getMonth() === targetMonth) {
          monthly += p.amount;
          if (isCurrentMonth && pDate.getDate() === new Date().getDate()) {
            daily += p.amount;
          }
        }
      }
    });

    return res.json({ daily, monthly, yearly });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};
