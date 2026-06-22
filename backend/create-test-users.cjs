const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.error('Nenhum tenant encontrado. Crie uma conta ADMIN primeiro.');
    return;
  }

  const password = await bcrypt.hash('123456', 10);

  // 1. Recepcionista
  const receptionist = await prisma.user.upsert({
    where: { email: 'recepcao@teste.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Maria Recepcionista',
      email: 'recepcao@teste.com',
      password,
      role: 'RECEPTIONIST'
    }
  });

  // 2. Dentista (Criando o profissional e o usuário de acesso)
  const dentistUser = await prisma.user.upsert({
    where: { email: 'dentista@teste.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Dr. João Dentista',
      email: 'dentista@teste.com',
      password,
      role: 'DENTIST'
    }
  });

  const dentistProfile = await prisma.dentist.findFirst({
    where: { email: 'dentista@teste.com', tenantId: tenant.id }
  });

  if (!dentistProfile) {
    await prisma.dentist.create({
      data: {
        tenantId: tenant.id,
        name: 'Dr. João Dentista',
        email: 'dentista@teste.com',
        cro: 'CRO-SP 123456',
        phone: '11999999999',
        gender: 'M',
      }
    });
  }

  console.log('Usuários criados com sucesso!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
