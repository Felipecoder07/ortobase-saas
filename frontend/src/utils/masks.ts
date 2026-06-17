export const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const maskPhone = (value: string) => {
  let v = value.replace(/\D/g, '');
  if (v.length <= 10) {
    v = v.replace(/(\d{2})(\d)/, '($1) $2');
    v = v.replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    v = v.replace(/(\d{2})(\d)/, '($1) $2');
    v = v.replace(/(\d{5})(\d)/, '$1-$2');
  }
  return v.substring(0, 15);
};

export const maskCurrency = (value: string | number) => {
  let v = value.toString().replace(/\D/g, '');
  if (v === '') return '';
  v = (Number(v) / 100).toFixed(2);
  v = v.replace('.', ',');
  v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  return v;
};

export const parseCurrency = (value: string) => {
  if (!value) return 0;
  return Number(value.replace(/\./g, '').replace(',', '.'));
};

export const maskDate = (value: string) => {
  let val = value.replace(/\D/g, '');
  if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
  if (val.length > 5) val = val.slice(0, 5) + '/' + val.slice(5);
  return val.slice(0, 10);
};

export const maskName = (value: string) => {
  return value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');
};

export const maskNumber = (value: string) => {
  return value.replace(/\D/g, '');
};

export const maskCRO = (value: string) => {
  let v = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  let letters = v.replace(/[^A-Z]/g, '').slice(0, 5);
  let numbers = v.replace(/[^0-9]/g, '').slice(0, 6);
  
  let res = letters;
  if (letters.length > 3) {
    res = letters.slice(0, 3) + '-' + letters.slice(3);
  }
  
  if (letters.length === 5 && numbers.length > 0) {
    res += ' ' + numbers;
  } else if (numbers.length > 0) {
    res += numbers;
  }
  
  return res;
};
