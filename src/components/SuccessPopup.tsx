import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface SuccessPopupProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({
  isOpen,
  title,
  message,
  onClose,
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="modal-backdrop-enter-active"
          enterFrom="modal-backdrop-enter"
          enterTo=""
          leave="modal-backdrop-exit-active"
          leaveFrom="modal-backdrop-exit"
          leaveTo=""
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="success-popup-enter-active"
              enterFrom="success-popup-enter"
              enterTo=""
              leave="success-popup-exit-active"
              leaveFrom="success-popup-exit"
              leaveTo=""
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="text-center">
                  <div className="text-green-500 text-4xl mb-4" aria-hidden="true">✓</div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold mb-2"
                  >
                    {title}
                  </Dialog.Title>
                  <p className="text-gray-600">{message}</p>
                  <button
                    type="button"
                    className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Got it
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SuccessPopup;