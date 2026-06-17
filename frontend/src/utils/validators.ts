export const isValidCPF = (cpf: string) => {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
};

export const isValidDate = (dateStr: string) => {
  if (dateStr.length !== 10) return false;
  const [day, month, year] = dateStr.split('/').map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
};

export const isFutureDate = (dateStr: string) => {
  const [day, month, year] = dateStr.split('/').map(Number);
  const d = new Date(year, month - 1, day);
  return d > new Date();
};

export const isValidCRO = (cro: string) => {
  const regex = /^CRO[- ]?[A-Z]{2}[- ]?\d{4,6}$/i;
  return regex.test(cro.trim());
};
