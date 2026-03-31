import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LockScreen() {
  const { unlock, logout, user } = useAuth();
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    try {
      await unlock(password);
      toast.success('Vault unlocked.');
    } catch {
      toast.error('Incorrect password.');
    } finally {
      setLoading(false);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-vault-950 grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-accent/10 border-2 border-accent/30 flex items-center justify-center shadow-glow animate-pulse-glow">
              <Lock className="w-9 h-9 text-accent" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-xs">!</span>
            </div>
          </div>
        </div>

        <h1 className="text-center font-display font-bold text-2xl text-white mb-1">Vault Locked</h1>
        <p className="text-center text-slate-400 text-sm mb-6">
          Session timed out. Enter your password to continue as{' '}
          <span className="text-accent font-mono">{user?.username}</span>.
        </p>

        <div className="vault-card">
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                placeholder="Enter your password"
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
            <button type="submit" disabled={loading || !password}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-50">
              {loading ? <div className="w-4 h-4 border-2 border-vault-950 border-t-transparent rounded-full animate-spin" /> : <Shield className="w-4 h-4" />}
              Unlock Vault
            </button>
          </form>
        </div>

        <button onClick={logout} className="mt-4 w-full text-center text-sm text-slate-500 hover:text-slate-300 transition-colors">
          Sign in as different user
        </button>
      </div>
    </div>
  );
}
