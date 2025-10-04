export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface Record {
  date: string | number | Date;
  id: string;
  text: string;
  amount: number;
  category: string;
  type: TransactionType;
  userId: string;
  createdAt: Date;
}