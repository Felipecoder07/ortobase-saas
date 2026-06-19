import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('adm', 10);

  // Procure o usuário atual
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: 'admin@clinica.com' }, { email: 'adm' }] },
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: 'adm',
        password: hashedPassword,
      },
    });
    console.log('Credenciais atualizadas com sucesso para adm / adm');
  } else {
    console.log('Usuário não encontrado.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
