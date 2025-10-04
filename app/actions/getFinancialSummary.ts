'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { TransactionType } from '@/types/Record';

export async function getFinancialSummary() {
  const { userId } = await auth();

  if (!userId) {
    return { error: 'User not found' };
  }

  try {
    const records = await db.record.findMany({
      where: { userId },
    });

    const totalIncome = records
      .filter((record) => record.type === TransactionType.INCOME)
      .reduce((sum, record) => sum + record.amount, 0);

    const totalExpense = records
      .filter((record) => record.type === TransactionType.EXPENSE)
      .reduce((sum, record) => sum + record.amount, 0);

    const netFlow = totalIncome - totalExpense;

    return { totalIncome, totalExpense, netFlow };
  } catch {
    return { error: 'Failed to fetch financial summary' };
  }
}
