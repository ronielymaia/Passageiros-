export const formatDocument = (value: string, type: 'CPF' | 'RG') => {
  if (type === 'RG') {
    return value.replace(/[^a-zA-Z0-9.-]/g, '').slice(0, 14);
  }
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const calculateStatus = (paid: number, total: number): 'Pago' | 'Parcialmente Pago' | 'Não Pago' => {
  if (total <= 0) return 'Não Pago';
  if (paid >= total) return 'Pago';
  if (paid > 0) return 'Parcialmente Pago';
  return 'Não Pago';
};
