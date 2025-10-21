'use client';

import { useState, useEffect } from 'react';
import { createTransfer } from '@/app/actions/createTransfer';
import { getAccounts } from '@/app/actions/accounts';
import { Account } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TransferFormProps {
  onFinished: () => void;
}

const TransferForm = ({ onFinished }: TransferFormProps) => {
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState(0);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const { accounts, error } = await getAccounts();
      if (error) {
        console.error(error);
      } else if (accounts) {
        setAccounts(accounts);
      }
    };

    fetchAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTransfer({ fromAccountId: fromAccount, toAccountId: toAccount, amount });
    onFinished();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fromAccount">From Account</Label>
        <Select value={fromAccount} onValueChange={setFromAccount}>
          <SelectTrigger>
            <SelectValue placeholder="Select an account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id}>
                {acc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="toAccount">To Account</Label>
        <Select value={toAccount} onValueChange={setToAccount}>
          <SelectTrigger>
            <SelectValue placeholder="Select an account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id}>
                {acc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          required
        />
      </div>
      <Button type="submit" className="bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] text-white hover:from-[var(--gradient-start)] hover:via-[var(--gradient-mid)] hover:to-[var(--gradient-end)]">Transfer</Button>
    </form>
  );
};

export default TransferForm;
