'use server';

import { checkUser } from '@/lib/checkUser';
import { db } from '@/lib/db';
import {
  generateFinancialInsights,
  AIInsight,
  FinancialRecord,
} from '@/lib/ai';
import { TransactionType } from '@/types/Record';

export async function getAIInsights(): Promise<AIInsight[]> {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const records = await db.record.findMany({
      where: {
        userId: user.clerkUserId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Increased limit to fetch both incomes and expenses
    });

    if (records.length === 0) {
      return [
        {
          id: 'welcome-1',
          type: 'info',
          title: 'Welcome to Your Financial Dashboard!',
          message:
            'Start by adding your income and expenses to get personalized AI insights.',
          action: 'Add your first record',
          confidence: 1.0,
        },
      ];
    }

    const incomeRecords: FinancialRecord[] = records
      .filter((r) => r.type === TransactionType.INCOME)
      .map((r) => ({
        id: r.id,
        amount: r.amount,
        category: r.category || 'Other',
        description: r.text,
        date: r.createdAt.toISOString(),
      }));

    const expenseRecords: FinancialRecord[] = records
      .filter((r) => r.type === TransactionType.EXPENSE)
      .map((r) => ({
        id: r.id,
        amount: r.amount,
        category: r.category || 'Other',
        description: r.text,
        date: r.createdAt.toISOString(),
      }));

    const insights = await generateFinancialInsights(
      incomeRecords,
      expenseRecords
    );
    return insights;
  } catch (error) {
    console.error('Error getting AI insights:', error);

    return [
      {
        id: 'error-1',
        type: 'warning',
        title: 'Insights Temporarily Unavailable',
        message:
          "We're having trouble analyzing your data right now. Please try again later.",
        action: 'Retry analysis',
        confidence: 0.5,
      },
    ];
  }
}