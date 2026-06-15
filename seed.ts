import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Clínica Odonto Teste',
    },
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const user = await prisma.user.create({
    data: {
      email: 'admin@clinica.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  console.log('Usuário criado com sucesso!');
  console.log('Login:', user.email);
  console.log('Senha: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
