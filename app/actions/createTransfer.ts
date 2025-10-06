'use server';

import { db } from '@/lib/db';
import { checkUser } from '@/lib/checkUser';
import { revalidatePath } from 'next/cache';

interface TransferData {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
}

interface TransferResult {
  data?: object;
  error?: string;
}

export const createTransfer = async ({
  fromAccountId,
  toAccountId,
  amount,
}: TransferData): Promise<TransferResult> => {
  const user = await checkUser();

  if (!user) {
    return { error: 'User not found' };
  }

  if (fromAccountId === toAccountId) {
    return { error: 'Cannot transfer to the same account' };
  }

  if (amount <= 0) {
    return { error: 'Amount must be greater than zero' };
  }

  try {
    await db.$transaction(async (prisma) => {
      // From Account
      const fromAccount = await prisma.account.findUnique({
        where: { id: fromAccountId },
      });

      if (!fromAccount) {
        throw new Error('From account not found');
      }

      await prisma.record.create({
        data: {
          text: `Transfer to ${toAccountId}`,
          amount,
          category: 'Transfer',
          type: 'EXPENSE',
          userId: user.clerkUserId,
          accountId: fromAccountId,
        },
      });

      await prisma.account.update({
        where: { id: fromAccountId },
        data: { balance: fromAccount.balance - amount },
      });

      // To Account
      const toAccount = await prisma.account.findUnique({
        where: { id: toAccountId },
      });

      if (!toAccount) {
        throw new Error('To account not found');
      }

      await prisma.record.create({
        data: {
          text: `Transfer from ${fromAccountId}`,
          amount,
          category: 'Transfer',
          type: 'INCOME',
          userId: user.clerkUserId,
          accountId: toAccountId,
        },
      });

      await prisma.account.update({
        where: { id: toAccountId },
        data: { balance: toAccount.balance + amount },
      });
    });

    revalidatePath('/');

    return { data: {} };
  } catch (error) {
    console.error(error);
    return {
      error: 'An unexpected error occurred while creating the transfer.',
    };
  }
};
