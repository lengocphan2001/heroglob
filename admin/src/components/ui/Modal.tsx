import { LucideX } from 'lucide-react';
import { Button } from './Button';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            if (!dialog.open) dialog.showModal();
        } else {
            if (dialog.open) dialog.close();
        }
    }, [isOpen]);

    // Handle click outside to close
    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === dialogRef.current) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <dialog
            ref={dialogRef}
            className={cn(
                "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-0 w-full max-w-lg backdrop:bg-black/50 backdrop:backdrop-blur-sm open:animate-in open:fade-in open:zoom-in-95 closed:animate-out closed:fade-out closed:zoom-out-95 m-0",
                className
            )}
            onClick={handleBackdropClick}
            onClose={onClose}
        >
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 p-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {title}
                </h3>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                    <LucideX className="h-4 w-4" />
                </Button>
            </div>
            <div className="p-4">{children}</div>
        </dialog>,
        document.body
    );
}
