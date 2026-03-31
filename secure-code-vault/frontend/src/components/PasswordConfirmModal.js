import React, { useState } from 'react';
import { Shield, Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function PasswordConfirmModal({ onConfirm, onClose, title = 'Confirm Identity' }) {
  const { verifyPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    try {
      const ok = await verifyPassword(password);
      if (ok) { onConfirm(); }
      else { toast.error('Incorrect password.'); }
    } catch {
      toast.error('Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-vault-900 border border-vault-600 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slide-in">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-white text-sm">{title}</h3>
              <p className="text-slate-500 text-xs">Re-enter your password to reveal</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pr-10"
              autoFocus
            />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading || !password}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <div className="w-4 h-4 border-2 border-vault-950 border-t-transparent rounded-full animate-spin" /> : 'Reveal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
