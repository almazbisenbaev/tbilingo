'use client';

import * as React from 'react';
import Modal from '@/components/common/Modal';
import { Button } from '@/components/ui/button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message?: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      showCloseButton={false}
    >
      <div className="space-y-6">
        {message && (
          <p className="text-muted-foreground text-center">
            {message}
          </p>
        )}

        <div className="flex gap-3 justify-end">
          {cancelText && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              {cancelText}
            </Button>
          )}
          <Button
            onClick={onConfirm}
            className={cancelText ? "flex-1 bg-red-600 hover:bg-red-700" : "w-full"}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmationDialog;