"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, Loader } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  type?: 'success' | 'error' | 'info' | 'loading';
  actionText?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', 
  actionText, 
  onAction,
  children 
}: ModalProps) => {

  // Escape key close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-12 h-12 text-green-400" />,
    error: <AlertCircle className="w-12 h-12 text-red-400" />,
    info: <Info className="w-12 h-12 text-blue-400" />,
    loading: <Loader className="w-12 h-12 text-primary animate-spin" />,
  };

  const colors = {
    success: 'border-green-500/20 bg-green-500/5',
    error: 'border-red-500/20 bg-red-500/5',
    info: 'border-blue-500/20 bg-blue-500/5',
    loading: 'border-primary/20 bg-primary/5',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm clay-card p-10 overflow-hidden"
          >
            <div className="absolute top-4 right-4">
              <button 
                onClick={onClose}
                className="p-2 rounded-full glass hover:bg-white/10 transition-all text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className={`w-24 h-24 rounded-[2rem] border glass flex items-center justify-center mb-8 ${colors[type]}`}>
                 {icons[type]}
              </div>

              {title && (
                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{title}</h3>
              )}

              {message && (
                <p className="text-white/40 text-sm font-medium leading-relaxed mb-10">
                  {message}
                </p>
              )}

              {children && (
                <div className="w-full mb-10">{children}</div>
              )}

              {actionText && (
                <button 
                  onClick={onAction || onClose}
                  className="clay-button w-full py-4 rounded-2xl font-black text-white uppercase tracking-widest text-sm"
                >
                  {actionText}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
