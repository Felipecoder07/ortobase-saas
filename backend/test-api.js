const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testApi() {
  const dentist = await prisma.dentist.findFirst();
  const patient = await prisma.patient.findFirst();
  const tenant = await prisma.tenant.findFirst();

  if (!dentist || !patient || !tenant) {
    console.log("Missing data");
    return;
  }

  // Create an appointment at 10:00-10:30
  const appt1 = await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      patientId: patient.id,
      dentistId: dentist.id,
      date: new Date('2026-06-25T10:00:00.000Z'),
      durationInMinutes: 30,
      serviceType: 'Test 1',
      price: 0
    }
  });

  // Try to create another appointment at 10:30-11:00
  try {
    const res = await axios.post('http://localhost:5000/api/appointments', {
      patientId: patient.id,
      dentistId: dentist.id,
      date: '2026-06-25T10:30:00.000Z',
      durationInMinutes: 30,
      serviceType: 'Test 2',
      price: 0
    }, {
      headers: {
        // Need auth token... wait, this is hard to get without login.
      }
    });
    console.log("SUCCESS! It allowed it.");
  } catch (err) {
    console.log("FAILED as expected:", err.response?.data);
  }

  await prisma.appointment.delete({ where: { id: appt1.id } });
}

testApi().finally(() => prisma.$disconnect());
