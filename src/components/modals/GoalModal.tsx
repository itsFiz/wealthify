import React from 'react';
import { GoalForm } from '@/components/forms/GoalForm';
import type { Goal } from '@/types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
}

export function GoalModal({ isOpen, onClose, goal, onSubmit, isSubmitting }: GoalModalProps) {
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
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-[101]"
        onClick={(e) => e.stopPropagation()}
      >
        <GoalForm
          goal={goal}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
} 