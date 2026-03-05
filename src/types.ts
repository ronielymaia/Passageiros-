export type Day = 'Sexta-feira' | 'Sábado' | 'Domingo';
export type PaymentStatus = 'Pago' | 'Parcialmente Pago' | 'Não Pago';

export interface Passenger {
  id: string;
  name: string;
  cpf: string;
  documentType?: 'CPF' | 'RG';
  congregation: string;
  days: Day[];
  paymentMethod: string;
  status: PaymentStatus;
  amount?: number;
  paidAmount?: number;
}

export const DAYS: Day[] = ['Sexta-feira', 'Sábado', 'Domingo'];
export const PAYMENT_METHODS = ['Pix', 'Dinheiro', 'Cartão'];
