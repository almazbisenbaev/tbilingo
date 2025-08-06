import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message?: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full">
        <h3 className="text-lg text-center font-semibold mb-6">{title}</h3>
        {message && (
          <p className="text-center text-gray-600 mb-6">{message}</p>
        )}
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="btn btn-secondary flex-1"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className="btn btn-primary flex-1"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog; 