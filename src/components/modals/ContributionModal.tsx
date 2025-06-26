import React from 'react';
import { ContributionForm } from '@/components/forms/ContributionForm';
import type { Goal } from '@/types';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
}

export function ContributionModal({
  isOpen,
  onClose,
  goal,
  onSubmit,
  isSubmitting = false,
}: ContributionModalProps) {
  if (!isOpen || !goal) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-[150] flex items-center justify-center p-4"
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <ContributionForm
          goal={goal}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
} 