const appointmentDate = new Date('2026-06-23T10:30:00.000Z');
const appointmentEnd = new Date('2026-06-23T11:00:00.000Z');

const conflictingAppointments = [
  {
    date: new Date('2026-06-23T10:00:00.000Z'),
    durationInMinutes: 30
  }
];

const hasConflict = conflictingAppointments.some(conflicting => {
  const BUFFER = 5 * 60000; // 5 minutos em milissegundos
  const confStart = conflicting.date.getTime();
  const confEnd = confStart + conflicting.durationInMinutes * 60000;
  
  const blockedStart = confStart - BUFFER;
  const blockedEnd = confEnd + BUFFER;

  const reqStart = appointmentDate.getTime();
  const reqEnd = appointmentEnd.getTime();

  return reqStart < blockedEnd && reqEnd > blockedStart;
});

console.log("hasConflict: ", hasConflict);
