import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'primary';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  variant = 'danger',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
            variant === 'danger' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}
          aria-hidden="true"
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">{message}</p>
        <div className="flex w-full items-center justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
