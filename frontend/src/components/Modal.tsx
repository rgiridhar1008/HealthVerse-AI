import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnBackdropClick?: boolean;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  maxWidth = 'lg',
  children,
  footer,
  closeOnBackdropClick = true,
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
}) => {
  useEffect(() => {
    if (!isOpen) return;

    // Lock scrolling on document.body while modal is open
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    
    // Prevent layout shift from scrollbar disappearing
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] h-[100dvh] w-screen overflow-y-auto overscroll-contain bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 flex justify-center items-start sm:items-center"
          onClick={(e) => {
            if (closeOnBackdropClick && e.target === e.currentTarget) {
              onClose();
            }
          }}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full ${maxWidthMap[maxWidth]} max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-48px)] flex flex-col min-h-0 overflow-hidden text-left my-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header (Never shrinks, stays visible) */}
            {(title || icon) && (
              <div className={`flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex-shrink-0 ${headerClassName}`}>
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  {icon && <div className="shrink-0">{icon}</div>}
                  <div className="min-w-0">
                    {typeof title === 'string' ? (
                      <h2 className="text-lg font-bold text-slate-900 truncate">{title}</h2>
                    ) : (
                      title
                    )}
                    {subtitle && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">{subtitle}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/70 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Independently Scrollable Modal Body */}
            <div className={`flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 overscroll-contain modal-scrollbar ${bodyClassName}`}>
              {children}
            </div>

            {/* Footer (Never shrinks, stays visible with distinct background and border) */}
            {footer && (
              <div className={`flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex-shrink-0 ${footerClassName}`}>
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
