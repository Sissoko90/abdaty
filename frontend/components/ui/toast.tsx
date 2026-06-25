'use client';

import { X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

const toastVariants = cva(
  'fixed right-4 bottom-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white',
        success: 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
        error: 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
        warning: 'bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ToastProps extends VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  onClose?: () => void;
}

export function Toast({ variant, title, description, onClose }: ToastProps) {
  return (
    <div className={toastVariants({ variant })}>
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export type ToastVariant = 'default' | 'success' | 'error' | 'warning';

export interface ToastMessage {
  id: string;
  variant?: ToastVariant;
  title?: string;
  description?: string;
  duration?: number;
}
