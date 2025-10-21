'use client';

import { useState, useEffect } from 'react';
import { createAccount, updateAccount } from '@/app/actions/accounts';
import { Account, AccountType } from '@prisma/client';
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

interface AccountFormProps {
  account?: Account | null;
  onFinished: () => void;
}

const AccountForm = ({ account, onFinished }: AccountFormProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('REKENING');
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (account) {
      setName(account.name);
      setType(account.type);
      setBalance(account.balance);
    } else {
      setName('');
      setType('REKENING');
      setBalance(0);
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (account) {
      await updateAccount(account.id, { name, type, balance });
    } else {
      await createAccount({ name, type, balance });
    }
    onFinished();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Account Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Account Type</Label>
        <Select value={type} onValueChange={(value) => setType(value as AccountType)}>
          <SelectTrigger>
            <SelectValue placeholder="Select an account type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="REKENING">Rekening</SelectItem>
            <SelectItem value="DOMPET">Dompet</SelectItem>
            <SelectItem value="KREDIT">Kredit</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="balance">Balance</Label>
        <Input
          id="balance"
          type="number"
          value={balance}
          onChange={(e) => setBalance(parseFloat(e.target.value))}
          required
        />
      </div>
      <Button type="submit" className="bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] text-white hover:from-[var(--gradient-start)] hover:via-[var(--gradient-mid)] hover:to-[var(--gradient-end)]">{account ? 'Update Account' : 'Add Account'}</Button>
    </form>
  );
};

export default AccountForm;
