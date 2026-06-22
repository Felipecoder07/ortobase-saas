const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAppts() {
  const appts = await prisma.appointment.findMany({
    where: {
      date: {
        gte: new Date('2026-06-23T00:00:00.000Z'),
        lte: new Date('2026-06-24T00:00:00.000Z')
      }
    },
    include: {
      patient: true,
      dentist: true
    }
  });

  console.log("Appointments on 23/06:");
  appts.forEach(a => {
    console.log(`- ${a.date.toISOString()} | Duration: ${a.durationInMinutes} | Patient: ${a.patient.name} | Dentist: ${a.dentist.name}`);
  });
}

checkAppts().finally(() => prisma.$disconnect());
