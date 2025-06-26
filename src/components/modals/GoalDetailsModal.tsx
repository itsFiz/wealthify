import React from 'react';
import { GoalDetailsView } from '@/components/goal/GoalDetailsView';
import type { Goal } from '@/types';

interface GoalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal;
  onAddContribution?: () => void;
  onEdit?: () => void;
}

export function GoalDetailsModal({
  isOpen,
  onClose,
  goal,
  onAddContribution,
  onEdit,
}: GoalDetailsModalProps) {
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
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <GoalDetailsView
          goal={goal}
          onAddContribution={onAddContribution}
          onEdit={onEdit}
          onClose={onClose}
        />
      </div>
    </div>
  );
} 