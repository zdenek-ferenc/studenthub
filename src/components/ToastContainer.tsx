"use client";

import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

// Ikonka pro daný typ notifikace
const icons = {
  success: <CheckCircleIcon className="h-7 w-7 text-green-500" />,
  error: <XCircleIcon className="h-7 w-7 text-red-500" />,
};

export default function ToastContainer() {
  const { toasts, hideToast } = useAuth();

  return (
    // Kontejner, který drží všechny toasty v pravém horním rohu
    <div className="fixed top-5 right-5 z-[100] flex flex-col items-end gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout // Důležité pro plynulé posouvání ostatních toastů
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8, transition: { duration: 0.3 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-sm bg-white p-4 rounded-xl shadow-2xl flex items-center gap-4 border-l-4"
            style={{ borderColor: toast.type === 'success' ? '#22c55e' : '#ef4444' }}
          >
            {/* Ikona */}
            <div className="flex-shrink-0">
              {icons[toast.type]}
            </div>
            {/* Zpráva */}
            <p className="font-semibold text-gray-800 flex-grow">{toast.message}</p>
            {/* Tlačítko pro zavření */}
            <button
              onClick={() => hideToast(toast.id)}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}