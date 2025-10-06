'use server';

import { db } from '@/lib/db';
import { checkUser } from '@/lib/checkUser';
import { AccountType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export const getAccounts = async () => {
  const user = await checkUser();

  if (!user) {
    return {
      error: 'Unauthorized',
    };
  }

  try {
    const accounts = await db.account.findMany({
      where: {
        userId: user.clerkUserId,
      },
    });

    return { accounts };
  } catch (error) {
    console.error(error);
    return {
      error: 'Failed to fetch accounts.',
    };
  }
};

export const createAccount = async ({
  name,
  type,
  balance,
}: {
  name: string;
  type: AccountType;
  balance: number;
}) => {
  const user = await checkUser();

  if (!user) {
    return {
      error: 'Unauthorized',
    };
  }

  try {
    const account = await db.account.create({
      data: {
        name,
        type,
        balance,
        userId: user.clerkUserId,
      },
    });

    revalidatePath('/');

    return { account };
  } catch (error) {
    console.error(error);
    return {
      error: 'Failed to create account.',
    };
  }
};

export const updateAccount = async (
  id: string,
  { name, type, balance }: { name?: string; type?: AccountType; balance?: number }
) => {
  const user = await checkUser();

  if (!user) {
    return {
      error: "Unauthorized",
    };
  }

  try {
    const updatedAccount = await db.account.update({
      where: {
        id,
        userId: user.clerkUserId,
      },
      data: {
        name,
        type,
        balance,
      },
    });

    revalidatePath("/");

    return { updatedAccount };
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to update account.",
    };
  }
};

export const deleteAccount = async (id: string) => {
  const user = await checkUser();

  if (!user) {
    return {
      error: "Unauthorized",
    };
  }

  try {
    await db.account.delete({
      where: {
        id,
        userId: user.clerkUserId,
      },
    });

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to delete account.",
    };
  }
};
