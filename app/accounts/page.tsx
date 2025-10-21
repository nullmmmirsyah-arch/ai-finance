'use client';

import { useState, useEffect } from 'react';
import { getAccounts, deleteAccount } from '@/app/actions/accounts';
import { Account } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import AccountForm from '@/components/AccountForm';
import TransferForm from '@/components/TransferForm';

const AccountsPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const fetchAccounts = async () => {
    setLoading(true);
    const { accounts, error } = await getAccounts();
    if (error) {
      console.error(error);
    } else if (accounts) {
      setAccounts(accounts);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setIsAccountModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      await deleteAccount(id);
      fetchAccounts();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Accounts</h1>
          <div className="flex gap-2">
            <Dialog open={isAccountModalOpen} onOpenChange={setIsAccountModalOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] text-white hover:from-[var(--gradient-start)] hover:via-[var(--gradient-mid)] hover:to-[var(--gradient-end)]"
                >
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle>{selectedAccount ? 'Edit Account' : 'Add Account'}</DialogTitle>
                </DialogHeader>
                <AccountForm
                  account={selectedAccount}
                  onFinished={() => {
                    setIsAccountModalOpen(false);
                    fetchAccounts();
                  }}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] text-white hover:from-[var(--gradient-start)] hover:via-[var(--gradient-mid)] hover:to-[var(--gradient-end)]"
                >
                  Transfer
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle>Transfer</DialogTitle>
                </DialogHeader>
                <TransferForm
                  onFinished={() => {
                    setIsTransferModalOpen(false);
                    fetchAccounts();
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-100/50 dark:border-gray-700/50"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{account.name}</h2>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(account)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(account.id)}>Delete</Button>
                </div>
              </div>
              <p className="text-lg font-bold">Rp. {account.balance.toLocaleString('id-ID')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{account.type}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountsPage;
