const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const appointments = await prisma.appointment.findMany();
  console.log("ALL APPOINTMENTS:");
  appointments.forEach(a => {
    console.log(`ID: ${a.id.substring(0, 8)} | Dentist: ${a.dentistId.substring(0, 8)} | Date: ${a.date.toISOString()} | Duration: ${a.durationInMinutes}`);
  });
}

test().catch(console.error).finally(() => prisma.$disconnect());
