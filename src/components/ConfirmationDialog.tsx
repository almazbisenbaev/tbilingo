'use client';

import * as React from 'react';
import Modal from '@/components/common/Modal';

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
            <button
              onClick={onCancel}
              className="btn btn-secondary flex-1"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`btn btn-black ${cancelText ? "flex-1" : "btn-block"}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmationDialog;