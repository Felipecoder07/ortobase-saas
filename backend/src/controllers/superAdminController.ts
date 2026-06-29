import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

export const loginSuperAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'SUPER_ADMIN') {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não definido');
    }
    const token = jwt.sign(
      { id: user.id, tenantId: null, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    await prisma.auditLog.create({ data: { action: 'SUPER_ADMIN_LOGIN', userEmail: email, details: `Email: ${email}` } });
    return res.json({ token, role: user.role, name: user.name });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const getGlobalStats = async (req: AuthRequest, res: Response) => {
  try {
    const tenantsCount = await prisma.tenant.count();
    const usersCount = await prisma.user.count({ where: { role: { not: 'SUPER_ADMIN' } } });
    
    // Consultas no mês
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const appointmentsCount = await prisma.appointment.count({
      where: { date: { gte: startOfMonth, lte: endOfMonth } }
    });

    // Receita global no mês
    const payments = await prisma.payment.findMany({
      where: { createdAt: { gte: startOfMonth, lte: endOfMonth }, status: 'PAID' }
    });
    const revenue = payments.reduce((sum, p) => sum + p.amount, 0);

    return res.json({
      totalTenants: tenantsCount,
      totalUsers: usersCount,
      monthlyAppointments: appointmentsCount,
      monthlyRevenue: revenue
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const getAllTenants = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', search = '', status = 'ALL', plan = 'ALL' } = req.query;
    
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    let whereClause: any = {};
    
    if (search) {
      whereClause.name = { contains: search as string };
    }
    if (status !== 'ALL') {
      whereClause.status = status;
    }
    if (plan !== 'ALL') {
      whereClause.plan = plan;
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where: whereClause,
        include: {
          _count: {
            select: { users: true, patients: true, appointments: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNumber
      }),
      prisma.tenant.count({ where: whereClause })
    ]);

    return res.json({
      data: tenants,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber)
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const getTenantById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
        _count: { select: { patients: true, appointments: true, dentists: true } }
      }
    });
    if (!tenant) return res.status(404).json({ error: 'Clínica não encontrada' });
    return res.json(tenant);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const createTenant = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantName, adminName, adminEmail, adminPassword, plan, trialDays } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existingUser) {
      return res.status(400).json({ error: 'E-mail do admin já está em uso' });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    let trialEndsAt = null;
    let planExpiresAt = null;
    let status = 'ACTIVE';
    
    if (trialDays) {
      status = 'TRIAL';
      trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);
    }

    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        plan: plan || 'FREE',
        status,
        trialEndsAt,
        planExpiresAt,
        users: {
          create: {
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: 'ADMIN',
          }
        }
      },
      include: { users: true }
    });

    await prisma.auditLog.create({ data: { action: 'CREATE_TENANT', userEmail: req.user!.email, details: `Tenant: ${tenant.name}` } });
    return res.status(201).json(tenant);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const updateTenantStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // ACTIVE, SUSPENDED, TRIAL
    
    const tenant = await prisma.tenant.update({
      where: { id },
      data: { status }
    });

    await prisma.auditLog.create({ data: { action: 'UPDATE_TENANT_STATUS', userEmail: req.user!.email, details: `Tenant: ${tenant.name} -> ${status}` } });
    return res.json(tenant);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const updateTenantPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { plan, planExpiresAt, trialEndsAt } = req.body;
    
    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        plan,
        planExpiresAt: planExpiresAt ? new Date(planExpiresAt) : null,
        trialEndsAt: trialEndsAt ? new Date(trialEndsAt) : null
      }
    });

    await prisma.auditLog.create({ data: { action: 'UPDATE_TENANT_PLAN', userEmail: req.user!.email, details: `Tenant: ${tenant.name} -> ${plan}` } });
    return res.json(tenant);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const updateTenantName = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const tenant = await prisma.tenant.update({
      where: { id },
      data: { name }
    });

    await prisma.auditLog.create({ data: { action: 'UPDATE_TENANT_NAME', userEmail: req.user!.email, details: `Tenant ID: ${id} -> ${name}` } });
    return res.json(tenant);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const deleteTenant = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // We must delete dependent relations if onDelete: Cascade is not set everywhere.
    // For safety, let's just delete the tenant and let prisma cascade (we might need to ensure schema supports cascade).
    // The safest way is to delete appointments, users, etc. manually if cascade is missing.
    // Let's assume Prisma schema has adequate onDelete: Cascade or we will do a manual cleanup.
    
    // Fetch tenant name for audit log
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) return res.status(404).json({ error: 'Clínica não encontrada' });

    // For SQLite and Prisma, we can just delete the users and tenant. Let's delete users first.
    await prisma.user.deleteMany({ where: { tenantId: id } });
    await prisma.patientAttachment.deleteMany({ where: { tenantId: id } });
    await prisma.odontogramLegend.deleteMany({ where: { tenantId: id } });
    await prisma.payment.deleteMany({ where: { tenantId: id } });
    await prisma.treatmentPlanItem.deleteMany({ where: { treatmentPlan: { tenantId: id } } });
    await prisma.treatmentPlan.deleteMany({ where: { tenantId: id } });
    await prisma.procedure.deleteMany({ where: { tenantId: id } });
    await prisma.anamnesis.deleteMany({ where: { tenantId: id } });
    await prisma.toothCondition.deleteMany({ where: { tenantId: id } });
    await prisma.appointment.deleteMany({ where: { tenantId: id } });
    await prisma.patient.deleteMany({ where: { tenantId: id } });
    await prisma.dentist.deleteMany({ where: { tenantId: id } });
    
    await prisma.tenant.delete({ where: { id } });

    await prisma.auditLog.create({ data: { action: 'DELETE_TENANT', userEmail: req.user!.email, details: `Tenant ID: ${id}, Name: ${tenant.name}` } });
    return res.json({ message: 'Clínica deletada com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.query;
    let whereClause: any = { role: { not: 'SUPER_ADMIN' } };
    if (tenantId) whereClause.tenantId = tenantId;

    const users = await prisma.user.findMany({
      where: whereClause,
      include: { tenant: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const impersonateTenant = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // tenantId
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) return res.status(404).json({ error: 'Clínica não encontrada' });

    // Find the primary admin of the tenant
    const admin = await prisma.user.findFirst({ where: { tenantId: id, role: 'ADMIN' } });
    if (!admin) return res.status(404).json({ error: 'Nenhum administrador encontrado nesta clínica' });

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não definido');
    }
    const token = jwt.sign(
      { id: admin.id, tenantId: admin.tenantId, role: admin.role, email: admin.email, impersonatedBy: req.user!.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await prisma.auditLog.create({ data: { action: 'IMPERSONATE_TENANT', userEmail: req.user!.email, details: `Tenant: ${tenant.name}, SuperAdmin: ${req.user!.email}` } });
    return res.json({ token, role: admin.role, name: admin.name });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const getAuditLog = async (req: AuthRequest, res: Response) => {
  try {
    const { filter = 'ALL', page = '1', limit = '15' } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    let whereClause: any = {};
    if (filter === 'LOGIN') {
      whereClause.action = { contains: 'LOGIN' };
    } else if (filter === 'TENANT') {
      whereClause.action = { contains: 'TENANT', not: { contains: 'IMPERSONATE' } };
    } else if (filter === 'IMPERSONATE') {
      whereClause.action = { contains: 'IMPERSONATE' };
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
      totalPages: Math.ceil(total / limitNumber) || 1
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const updateSuperAdminProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, password } = req.body;
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    let dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: dataToUpdate
    });

    await prisma.auditLog.create({ 
      data: { 
        action: 'UPDATE_PROFILE', 
        userEmail: req.user.email,
        details: `SuperAdmin: ${req.user.email} atualizou seu perfil.` 
      } 
    });

    return res.json({ name: updatedUser.name, email: updatedUser.email });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};
