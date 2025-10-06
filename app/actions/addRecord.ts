'use server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { TransactionType } from '@/types/Record';

interface RecordData {
  text: string;
  amount: number;
  category: string;
  date: string;
  type: TransactionType;
}

interface RecordResult {
  data?: RecordData;
  error?: string;
}

async function addRecord(formData: FormData): Promise<RecordResult> {
  const textValue = formData.get('text');
  const amountValue = formData.get('amount');
  const categoryValue = formData.get('category');
  const dateValue = formData.get('date');
  const typeValue = formData.get('type') as TransactionType;
  const accountIdValue = formData.get('accountId');

  if (
    !textValue ||
    !amountValue ||
    !categoryValue ||
    !dateValue ||
    !typeValue ||
    !accountIdValue
  ) {
    return { error: 'Text, amount, category, date, type, or accountId is missing' };
  }

  const text: string = textValue.toString();
  const amount: number = parseFloat(amountValue.toString());
  const category: string = categoryValue.toString();
  const type: TransactionType = typeValue;
  const accountId: string = accountIdValue.toString();

  let date: string;
  try {
    const inputDate = dateValue.toString();
    const [year, month, day] = inputDate.split('-');
    const dateObj = new Date(
      Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0)
    );
    date = dateObj.toISOString();
  } catch {
    return { error: 'Invalid date format' };
  }

  const { userId } = await auth();

  if (!userId) {
    return { error: 'User not found' };
  }

  try {
    const createdRecord = await db.$transaction(async (prisma) => {
      const record = await prisma.record.create({
        data: {
          text,
          amount,
          category,
          date,
          type,
          userId,
          accountId,
        },
      });

      const account = await prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw new Error('Account not found');
      }

      const newBalance =
        type === 'INCOME'
          ? account.balance + amount
          : account.balance - amount;

      await prisma.account.update({
        where: { id: accountId },
        data: { balance: newBalance },
      });

      return record;
    });

    const recordData: RecordData = {
      text: createdRecord.text,
      amount: createdRecord.amount,
      category: createdRecord.category,
      date: createdRecord.date?.toISOString() || date,
      type: createdRecord.type,
    };

    revalidatePath('/');

    return { data: recordData };
  } catch (error) {
    console.error(error);
    return {
      error: 'An unexpected error occurred while adding the record.',
    };
  }
}

export default addRecord;