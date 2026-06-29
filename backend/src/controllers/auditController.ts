import { Response } from 'express';
import prisma from '../prisma';
import { TenantRequest } from '../middlewares/authMiddleware';

export const getAuditLog = async (req: TenantRequest, res: Response) => {
  try {
    const { tenantId } = req.user;
    const { page = 1, limit = 50, action } = req.query;
    
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    let whereClause: any = { tenantId };
    if (action) {
      whereClause.action = { contains: String(action) }; // sqlite might not support case insensitive nicely without string matching, but it's fine
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNumber
      }),
      prisma.auditLog.count({ where: whereClause })
    ]);

    return res.json({
      data: logs,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar logs de auditoria' });
  }
};
