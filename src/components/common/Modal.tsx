'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    showCloseButton?: boolean;
    className?: string;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    showCloseButton = true,
    className = '',
}: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2, type: 'spring', damping: 25, stiffness: 300 }}
                            className={`
                pointer-events-auto
                relative w-full max-w-md 
                bg-white rounded-3xl shadow-lg
                flex flex-col
                ${className}
              `}
                            role="dialog"
                            aria-modal="true"
                        >
                            {/* Header */}
                            {(title || showCloseButton) && (
                                <div className="flex items-center justify-between p-6 pb-2">
                                    {title && (
                                        <h2 className="text-lg font-semibold leading-none tracking-tight">
                                            {title}
                                        </h2>
                                    )}
                                    {showCloseButton && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 rounded-full ml-auto opacity-70 hover:opacity-100"
                                            onClick={onClose}
                                        >
                                            <X className="h-4 w-4" />
                                            <span className="sr-only">Close</span>
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-6 pt-2">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
