const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const hash = await bcrypt.hash('adm', 10);
  await prisma.user.updateMany({
    where: { email: 'adm' },
    data: { password: hash, failedLoginAttempts: 0, lockedUntil: null }
  });
  console.log('Senha alterada para "adm" no usuario "adm"');
}

run().catch(console.error).finally(() => prisma.$disconnect());
