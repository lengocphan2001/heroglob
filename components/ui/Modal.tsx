'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 text-left shadow-xl transition-all">
                <div className="flex items-center justify-between mb-5">
                    {title && (
                        <h3 className="text-xl font-bold leading-6 text-slate-900">
                            {title}
                        </h3>
                    )}
                    <button
                        onClick={onClose}
                        className="flex size-8 items-center justify-center rounded-full hover:bg-slate-100"
                    >
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
