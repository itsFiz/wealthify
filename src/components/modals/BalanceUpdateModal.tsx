import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BalanceUpdateForm } from '@/components/forms/BalanceUpdateForm';

interface BalanceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onSubmit: (data: { balance: number; notes?: string }) => Promise<void>;
  isSubmitting?: boolean;
}

export function BalanceUpdateModal({
  isOpen,
  onClose,
  currentBalance,
  onSubmit,
  isSubmitting = false,
}: BalanceUpdateModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Current Balance</DialogTitle>
        </DialogHeader>
        <BalanceUpdateForm
          currentBalance={currentBalance}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
} 