import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // Find existing tenant
  let tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: { name: 'Clínica Odonto Modelo' }
    });
    console.log('Created new Tenant:', tenant.id);
  } else {
    console.log('Using existing Tenant:', tenant.id);
  }

  // Create Procedures
  const proc1 = await prisma.procedure.create({
    data: { tenantId: tenant.id, name: 'Avaliação Inicial', basePrice: 0 }
  });
  const proc2 = await prisma.procedure.create({
    data: { tenantId: tenant.id, name: 'Limpeza (Profilaxia)', basePrice: 150 }
  });
  const proc3 = await prisma.procedure.create({
    data: { tenantId: tenant.id, name: 'Clareamento Dental', basePrice: 600 }
  });

  // Create Dentists
  const dentist1 = await prisma.dentist.create({
    data: {
      tenantId: tenant.id,
      name: 'João Silva',
      cro: '12345-SP',
      specialties: 'Ortodontia',
      phone: '11999999999',
      gender: 'M'
    }
  });

  // Create Patients
  const patient1 = await prisma.patient.create({
    data: {
      tenantId: tenant.id,
      name: 'Maria Oliveira',
      cpf: '111.111.111-11',
      dateOfBirth: new Date('1990-05-10'),
      phone: '11988888888'
    }
  });
  const patient2 = await prisma.patient.create({
    data: {
      tenantId: tenant.id,
      name: 'Carlos Souza',
      cpf: '222.222.222-22',
      dateOfBirth: new Date('1985-02-20'),
      phone: '11977777777'
    }
  });

  // Create Appointments
  const today = new Date();
  
  // 1. COMPLETED appointment, unpaid (pending)
  await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      patientId: patient1.id,
      dentistId: dentist1.id,
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0),
      durationInMinutes: 30,
      serviceType: 'Limpeza',
      price: 150,
      status: 'COMPLETED'
    }
  });

  // 2. COMPLETED appointment, partially paid
  const appt2 = await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      patientId: patient2.id,
      dentistId: dentist1.id,
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0, 0),
      durationInMinutes: 60,
      serviceType: 'Clareamento',
      price: 600,
      status: 'COMPLETED'
    }
  });
  
  await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      appointmentId: appt2.id,
      amount: 300,
      method: 'PIX',
      status: 'PAID'
    }
  });

  // 3. SCHEDULED appointment (future)
  await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      patientId: patient1.id,
      dentistId: dentist1.id,
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0, 0),
      durationInMinutes: 30,
      serviceType: 'Avaliação Inicial',
      price: 0,
      status: 'SCHEDULED'
    }
  });
  
  // 4. COMPLETED appointment with price 0 (Definir Valor)
  await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      patientId: patient2.id,
      dentistId: dentist1.id,
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0, 0),
      durationInMinutes: 30,
      serviceType: 'Avaliação',
      price: 0,
      status: 'COMPLETED'
    }
  });

  console.log('Seed completed!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
