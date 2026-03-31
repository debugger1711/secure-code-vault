import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const strength = (p) => {
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const pw_strength = strength(form.password);
  const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-400', 'bg-success'];
  const strengthLabel = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match.'); return; }
    if (pw_strength < 3) { toast.error('Please use a stronger password.'); return; }
    setLoading(true);
    try {
      await signup(form.username, form.email, form.password);
      toast.success('Vault created! Welcome aboard.');
      navigate('/dashboard');
    } catch (err) {
      const errs = err.response?.data?.errors;
      if (errs?.length) { toast.error(errs[0].msg); }
      else { toast.error(err.response?.data?.error || 'Signup failed.'); }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-vault-950 grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border-2 border-accent/30 flex items-center justify-center mb-4 shadow-glow">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white">Create <span className="glow-text">Vault</span></h1>
          <p className="text-slate-500 text-sm mt-1">Your encrypted code safe starts here</p>
        </div>

        <div className="bg-vault-900 border border-vault-700/50 rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus className="w-4 h-4 text-accent" />
            <h2 className="font-display font-semibold text-white">Create Account</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-mono uppercase tracking-wider mb-1.5">Username</label>
              <input type="text" placeholder="devname" value={form.username} onChange={update('username')}
                className="input-field" required minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+" />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-mono uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={update('email')}
                className="input-field" required />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-mono uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} placeholder="Min 8 chars, uppercase + number"
                  value={form.password} onChange={update('password')} className="input-field pr-10" required minLength={8} />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pw_strength ? strengthColor[pw_strength - 1] : 'bg-vault-700'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{strengthLabel[pw_strength - 1] || ''}</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-mono uppercase tracking-wider mb-1.5">Confirm Password</label>
              <input type="password" placeholder="Repeat password" value={form.confirm} onChange={update('confirm')}
                className={`input-field ${form.confirm && form.password !== form.confirm ? 'border-red-500/60' : ''}`} required />
              {form.confirm && form.password !== form.confirm && (
                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
              )}
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-50 mt-2">
              {loading
                ? <div className="w-5 h-5 border-2 border-vault-950 border-t-transparent rounded-full animate-spin" />
                : <><Shield className="w-4 h-4" /> Create Vault</>}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Have a vault?{' '}
            <Link to="/login" className="text-accent hover:text-accent-dark transition-colors">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
