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

  if (
    !textValue ||
    !amountValue ||
    !categoryValue ||
    !dateValue ||
    !typeValue
  ) {
    return { error: 'Text, amount, category, date, or type is missing' };
  }

  const text: string = textValue.toString();
  const amount: number = parseFloat(amountValue.toString());
  const category: string = categoryValue.toString();
  const type: TransactionType = typeValue;

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
    const createdRecord = await db.record.create({
      data: {
        text,
        amount,
        category,
        date,
        type,
        userId,
      },
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
    return {
      error: 'An unexpected error occurred while adding the record.',
    };
  }
}

export default addRecord;