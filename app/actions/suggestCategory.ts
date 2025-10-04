'use server';

import { categorizeExpense, categorizeIncome } from '@/lib/ai';
import { TransactionType } from '@/types/Record';

export async function suggestCategory(
  description: string,
  type: TransactionType
): Promise<{ category: string; error?: string }> {
  try {
    if (!description || description.trim().length < 2) {
      return {
        category: 'Other',
        error: 'Description too short for AI analysis',
      };
    }

    let category: string;
    if (type === TransactionType.INCOME) {
      category = await categorizeIncome(description.trim());
    } else {
      category = await categorizeExpense(description.trim());
    }

    return { category };
  } catch (error) {
    console.error('❌ Error in suggestCategory server action:', error);
    return {
      category: 'Other',
      error: 'Unable to suggest category at this time',
    };
  }
}