import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    throw new Error('Tenant não encontrado. Crie um usuário primeiro.');
  }

  // Criar Dentistas
  const dentist1 = await prisma.dentist.create({
    data: {
      tenantId: tenant.id,
      name: 'Dr. Roberto Almeida',
      cro: '12345-SP',
      specialties: 'Ortodontia, Implantodontia',
      phone: '11999998888',
      email: 'roberto@clinica.com'
    }
  });

  const dentist2 = await prisma.dentist.create({
    data: {
      tenantId: tenant.id,
      name: 'Dra. Carla Souza',
      cro: '54321-SP',
      specialties: 'Odontopediatria',
      phone: '11977776666',
      email: 'carla@clinica.com'
    }
  });

  // Criar Pacientes
  const patient1 = await prisma.patient.create({
    data: {
      tenantId: tenant.id,
      name: 'João Pedro da Silva',
      cpf: '11122233344',
      dateOfBirth: new Date('1990-05-15T00:00:00Z'),
      phone: '11955554444',
      email: 'joao.pedro@email.com',
      address: 'Rua das Flores, 123',
      clinicalNotes: 'Paciente tem alergia a penicilina. Reclama de sensibilidade nos molares inferiores.'
    }
  });

  const patient2 = await prisma.patient.create({
    data: {
      tenantId: tenant.id,
      name: 'Maria Oliveira',
      cpf: '55566677788',
      dateOfBirth: new Date('1985-10-20T00:00:00Z'),
      phone: '11933332222',
      email: 'maria.oliveira@email.com',
      clinicalNotes: 'Iniciou tratamento ortodôntico em fev/2024.'
    }
  });

  // Criar Consultas e Pagamentos
  const today = new Date();
  
  // 1. Consulta Concluída e Paga (do passado)
  const pastApptDate = new Date(today);
  pastApptDate.setDate(today.getDate() - 5);
  pastApptDate.setHours(10, 0, 0, 0);

  const appt1 = await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      patientId: patient1.id,
      dentistId: dentist1.id,
      date: pastApptDate,
      durationInMinutes: 60,
      serviceType: 'Avaliação Inicial',
      price: 150.0,
      status: 'COMPLETED'
    }
  });

  await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      appointmentId: appt1.id,
      amount: 150.0,
      method: 'PIX',
      status: 'PAID'
    }
  });

  // 2. Consulta Agendada e Pendente (hoje)
  const todayApptDate = new Date(today);
  todayApptDate.setHours(14, 30, 0, 0);

  const appt2 = await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      patientId: patient2.id,
      dentistId: dentist2.id,
      date: todayApptDate,
      durationInMinutes: 45,
      serviceType: 'Manutenção Aparelho',
      price: 120.0,
      status: 'SCHEDULED'
    }
  });

  await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      appointmentId: appt2.id,
      amount: 120.0,
      method: 'CREDIT_CARD',
      status: 'PENDING'
    }
  });

  // 3. Consulta Faltou e Pendente (ontem) com desconto
  const missedApptDate = new Date(today);
  missedApptDate.setDate(today.getDate() - 1);
  missedApptDate.setHours(9, 0, 0, 0);

  const appt3 = await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      patientId: patient1.id,
      dentistId: dentist1.id,
      date: missedApptDate,
      durationInMinutes: 90,
      serviceType: 'Clareamento',
      price: 400.0,
      status: 'NO_SHOW'
    }
  });

  await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      appointmentId: appt3.id,
      amount: 350.0,
      discount: 50.0,
      method: 'PIX',
      status: 'PENDING'
    }
  });

  console.log('Dados de teste criados com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
