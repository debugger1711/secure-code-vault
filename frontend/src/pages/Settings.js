import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Lock, User, Info, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, lockVault, logout } = useAuth();
  const [showInfo, setShowInfo] = useState(false);

  const sections = [
    {
      title: 'Account',
      icon: User,
      items: [
        { label: 'Username', value: user?.username, type: 'display' },
        { label: 'Email', value: user?.email, type: 'display' },
        { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—', type: 'display' },
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        { label: 'Encryption Algorithm', value: 'AES-256-CBC', type: 'badge' },
        { label: 'Password Hashing', value: 'bcrypt (12 rounds)', type: 'badge' },
        { label: 'Authentication', value: 'JWT Bearer Token', type: 'badge' },
        { label: 'Auto-lock Timeout', value: '5 minutes of inactivity', type: 'badge' },
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-accent" /> Settings
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Account & security configuration</p>
      </div>

      {sections.map(({ title, icon: Icon, items }) => (
        <div key={title} className="vault-card">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-vault-700/50">
            <Icon className="w-4 h-4 text-accent" />
            <h2 className="font-display font-semibold text-white">{title}</h2>
          </div>
          <div className="space-y-3">
            {items.map(({ label, value, type }) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <span className="text-slate-400 text-sm">{label}</span>
                {type === 'badge' ? (
                  <span className="font-mono text-xs bg-vault-800 border border-vault-600 px-2 py-1 rounded text-accent">{value}</span>
                ) : (
                  <span className="text-slate-200 text-sm font-medium">{value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className="vault-card">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-vault-700/50">
          <Lock className="w-4 h-4 text-accent" />
          <h2 className="font-display font-semibold text-white">Vault Actions</h2>
        </div>
        <div className="space-y-2">
          <button onClick={() => { lockVault(); toast('Vault locked.', { icon: '🔒' }); }}
            className="w-full text-left px-4 py-3 rounded-lg border border-yellow-800/50 bg-yellow-900/10 text-yellow-400 hover:bg-yellow-900/20 transition-colors text-sm flex items-center gap-2">
            <Lock className="w-4 h-4" /> Lock Vault Now
          </button>
          <button onClick={() => { logout(); }}
            className="w-full text-left px-4 py-3 rounded-lg border border-red-800/50 bg-red-900/10 text-red-400 hover:bg-red-900/20 transition-colors text-sm flex items-center gap-2">
            <User className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* About */}
      <div className="vault-card border-accent/20 bg-accent/5">
        <button className="flex items-center justify-between w-full" onClick={() => setShowInfo(!showInfo)}>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-accent" />
            <span className="font-display font-semibold text-white text-sm">About Secure Code Vault</span>
          </div>
          {showInfo ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
        </button>
        {showInfo && (
          <div className="mt-4 space-y-2 text-sm text-slate-400">
            <p>Secure Code Vault encrypts all code snippets and files using AES-256-CBC before storing them in the database. Only authenticated users can decrypt their own data.</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {[
                ['Frontend', 'React + Tailwind CSS'],
                ['Backend', 'Node.js + Express'],
                ['Database', 'MongoDB'],
                ['Auth', 'JWT + bcrypt'],
                ['Encryption', 'AES-256-CBC'],
                ['File handling', 'multer'],
              ].map(([k, v]) => (
                <div key={k} className="bg-vault-800/50 rounded-lg px-3 py-2">
                  <div className="text-slate-500 text-xs">{k}</div>
                  <div className="text-slate-300 text-xs font-mono">{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
