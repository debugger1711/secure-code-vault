import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Code2, FolderOpen, Settings,
  LogOut, Lock, Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/snippets',  icon: Code2,           label: 'My Snippets' },
  { to: '/files',     icon: FolderOpen,      label: 'Upload Files' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
];

export default function Layout() {
  const { user, logout, lockVault } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Vault locked & session ended.');
    navigate('/login');
  };

  const handleLock = () => {
    lockVault();
    toast('Vault locked.', { icon: '🔒' });
  };

  return (
    <div className="flex h-screen bg-vault-950 overflow-hidden grid-bg">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-30 w-64 flex flex-col
        bg-vault-900 border-r border-vault-700/50
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-vault-700/50">
          <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center shadow-glow-sm">
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-sm leading-tight">Secure Code</div>
            <div className="font-mono text-accent text-xs tracking-widest">VAULT</div>
          </div>
          <button className="ml-auto lg:hidden text-slate-500 hover:text-slate-300" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User badge */}
        <div className="mx-4 mt-4 mb-2 p-3 rounded-lg bg-vault-800/60 border border-vault-600/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent/40 to-vault-500 flex items-center justify-center text-white text-xs font-bold font-mono">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-slate-200 text-xs font-semibold truncate">{user?.username}</div>
              <div className="text-slate-500 text-xs truncate">{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <p className="text-slate-600 text-xs font-mono uppercase tracking-widest px-3 py-2 mt-2">Navigation</p>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
              <ChevronRight className="w-3 h-3 ml-auto opacity-40" />
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-vault-700/50 space-y-1">
          <button onClick={handleLock} className="sidebar-link w-full text-yellow-500 hover:text-yellow-400 hover:bg-yellow-900/20">
            <Lock className="w-4 h-4" />
            <span>Lock Vault</span>
          </button>
          <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:text-red-400 hover:bg-red-900/20">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Encryption status */}
        <div className="px-4 pb-4">
          <div className="encrypt-badge w-full justify-center">
            <Shield className="w-3 h-3" /> AES-256 ENCRYPTED
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-vault-900/80 backdrop-blur border-b border-vault-700/50 flex items-center px-4 gap-3 flex-shrink-0">
          <button className="lg:hidden text-slate-400 hover:text-slate-200" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Vault Active
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
