import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Vault unlocked. Welcome back.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-vault-950 grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border-2 border-accent/30 flex items-center justify-center mb-4 shadow-glow">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white">Secure Code <span className="glow-text">Vault</span></h1>
          <p className="text-slate-500 text-sm mt-1">AES-256 encrypted code storage</p>
        </div>

        {/* Card */}
        <div className="bg-vault-900 border border-vault-700/50 rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-accent" />
            <h2 className="font-display font-semibold text-white">Sign In</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-mono uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={update('email')} className="input-field" required />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-mono uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={update('password')} className="input-field pr-10" required />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-50 mt-2">
              {loading
                ? <div className="w-5 h-5 border-2 border-vault-950 border-t-transparent rounded-full animate-spin" />
                : <><Shield className="w-4 h-4" /> Unlock Vault</>}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            No account?{' '}
            <Link to="/signup" className="text-accent hover:text-accent-dark transition-colors">Create one →</Link>
          </p>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6 font-mono">
          All data encrypted with AES-256-CBC before storage
        </p>
      </div>
    </div>
  );
}
