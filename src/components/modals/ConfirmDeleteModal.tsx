import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  isDeleting?: boolean;
  type?: 'goal' | 'income' | 'expense' | 'general';
}

const typeConfig = {
  goal: {
    icon: '🎯',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  income: {
    icon: '💰',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  expense: {
    icon: '💸',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  general: {
    icon: '🗑️',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
};

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isDeleting = false,
  type = 'general'
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  const config = typeConfig[type];

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-[200] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div 
        className="w-full max-w-md bg-white/98 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl metric-card animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Icon and Title */}
          <div className="flex items-center space-x-4 mb-4">
            <div className={`w-12 h-12 rounded-full ${config.bgColor} ${config.borderColor} border-2 flex items-center justify-center`}>
              <AlertTriangle className={`h-6 w-6 ${config.color}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {title}
              </h2>
              {itemName && (
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-lg">{config.icon}</span>
                  <span className="text-sm font-medium text-muted-foreground">
                    "{itemName}"
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Warning Message */}
          <div className={`p-4 rounded-lg ${config.bgColor} ${config.borderColor} border mb-6`}>
            <p className="text-sm text-foreground leading-relaxed">
              {message}
            </p>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              ⚠️ This action cannot be undone.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 bg-gray-50 hover:bg-gray-100 border-gray-200"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 