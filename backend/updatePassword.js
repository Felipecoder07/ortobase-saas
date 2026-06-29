const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const email = 'superadmin@ortobase.com';
  const newPassword = '123456';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });
  console.log('Password updated successfully');
}

main().finally(() => prisma.$disconnect());
