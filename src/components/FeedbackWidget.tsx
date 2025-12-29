"use client";

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, X, Send, Loader2, } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function FeedbackWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Pro úplné skrytí
  const [rating, setRating] = useState<'like' | 'dislike' | null>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    // Zkontrolujeme, jestli uživatel feedback už neposlal nebo ho nezavřel
    const isHidden = localStorage.getItem('rh_feedback_hidden');
    if (!isHidden) setIsVisible(true);
  }, []);

  const handleCloseForever = () => {
      setIsVisible(false);
      localStorage.setItem('rh_feedback_hidden', 'true');
  };

  const handleSend = async () => {
    if (!rating && !message) return;
    setIsSending(true);

    try {
        await fetch('/api/submit-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                rating,
                message,
                userId: user?.id,
                userEmail: user?.email // nebo profile?.email
            })
        });

        setSent(true);
        // Skryjeme widget nadobro po odeslání (volitelné, ale dává to smysl)
        localStorage.setItem('rh_feedback_hidden', 'true');
    } catch (error) {
        console.error("Feedback error", error);
    } finally {
        setIsSending(false);
        setTimeout(() => {
            setIsOpen(false);
            setSent(false);
            setRating(null);
            setMessage('');
            setIsVisible(false); // Zmizí po úspěchu
        }, 2500);
    }
  };

  if (!isVisible) return null;

  if (!isOpen) {
    return (
      <div className="fixed z-50 bottom-26 left-4 md:bottom-18 md:left-6 flex items-center gap-2 animate-fade-in-up">
          <button 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all font-bold text-xs"
          >
            <MessageSquare size={16} />
            <span className="hidden sm:inline">Líbí se ti nový design?</span>
            <span className="sm:hidden">Feedback</span>
          </button>
          
          <button 
            onClick={handleCloseForever}
            className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/50 hover:text-white transition-colors backdrop-blur-sm"
            title="Nezobrazovat"
          >
              <X size={14} />
          </button>
      </div>
    );
  }

  return (
    <div className="fixed z-50 bottom-26 left-4 md:bottom-6 md:left-6 w-[calc(100vw-32px)] md:w-80 bg-[#0B1623]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
        <h3 className="text-sm font-bold text-white">Hodnocení Dashboardu 2.0</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {sent ? (
          <div className="text-center py-6">
            <div className="inline-flex p-3 rounded-full bg-green-500/20 text-green-400 mb-2">
                <ThumbsUp size={24} />
            </div>
            <p className="text-white font-bold">Díky moc!</p>
            <p className="text-xs text-gray-400 mt-1">Vážíme si tvého názoru.</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <button 
                onClick={() => setRating('like')}
                className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all border ${rating === 'like' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
              >
                <ThumbsUp size={20} />
              </button>
              <button 
                onClick={() => setRating('dislike')}
                className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all border ${rating === 'dislike' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
              >
                <ThumbsDown size={20} />
              </button>
            </div>

            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Co bychom měli zlepšit? Chybí ti tu něco?"
              className="w-full bg-[#001224] border border-white/10 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 resize-none h-24"
            />

            <button 
              onClick={handleSend}
              disabled={isSending || (!rating && !message)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
            >
              {isSending ? <Loader2 size={16} className="animate-spin"/> : <Send size={16} />}
              Odeslat
            </button>
          </>
        )}
      </div>
    </div>
  );
}