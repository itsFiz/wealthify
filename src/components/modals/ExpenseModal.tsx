import React from 'react';
import { ExpenseForm } from '@/components/forms/ExpenseForm';
import type { Expense } from '@/types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: Expense;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
}

export function ExpenseModal({ isOpen, onClose, expense, onSubmit, isSubmitting }: ExpenseModalProps) {
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
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <ExpenseForm
          expense={expense}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
} 