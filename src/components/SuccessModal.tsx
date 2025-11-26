'use client';

import * as React from 'react';
import Modal from '@/components/common/Modal';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  onClose: () => void;
}

export function SuccessModal({
  isOpen,
  title,
  message,
  onClose,
}: SuccessModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {title}
          </h2>
          {message && (
            <p className="text-muted-foreground">
              {message}
            </p>
          )}
        </div>

        <Button
          onClick={onClose}
          className="w-full bg-green-600 hover:bg-green-700 mt-2"
        >
          Continue
        </Button>
      </div>
    </Modal>
  );
}

export default SuccessModal;