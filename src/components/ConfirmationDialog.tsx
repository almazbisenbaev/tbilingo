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
              size="lg"
              className="flex-1"
            >
              {cancelText}
            </Button>
          )}
          <Button
            onClick={onConfirm}
            size="lg"
            className={cancelText ? "flex-1 text-white bg-black" : "w-full"}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmationDialog;