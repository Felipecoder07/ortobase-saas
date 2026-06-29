import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export interface AuthRequest extends Request {}
export interface TenantRequest extends Request {}

const tenantStatusCache = new Map<string, { status: string, expiresAt: number }>();

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const [, token] = authHeader.split(' ');

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não definido');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    req.user = {
      id: decoded.id,
      tenantId: decoded.tenantId,
      role: decoded.role,
      email: decoded.email,
    };

    if (decoded.role !== 'SUPER_ADMIN' && decoded.tenantId) {
      const now = Date.now();
      const cached = tenantStatusCache.get(decoded.tenantId);
      
      let status = 'ACTIVE';
      if (cached && cached.expiresAt > now) {
        status = cached.status;
      } else {
        const tenant = await prisma.tenant.findUnique({ where: { id: decoded.tenantId } });
        if (!tenant) return res.status(401).json({ error: 'Clínica não encontrada' });
        status = tenant.status;
        tenantStatusCache.set(decoded.tenantId, { status, expiresAt: now + 5 * 60 * 1000 });
      }

      if (status === 'SUSPENDED') {
        return res.status(403).json({ error: 'Sua conta está suspensa. Entre em contato com o suporte.' });
      }
    }

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Acesso negado: Perfil insuficiente' });
  }

  return next();
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado: Perfil insuficiente' });
    }

    return next();
  };
};
