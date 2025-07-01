import React from 'react';
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
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <BalanceUpdateForm
          currentBalance={currentBalance}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
} 