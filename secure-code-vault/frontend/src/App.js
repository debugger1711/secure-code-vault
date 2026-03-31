import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Snippets from './pages/Snippets';
import FileManager from './pages/FileManager';
import Settings from './pages/Settings';
import LockScreen from './components/LockScreen';

function ProtectedRoute({ children }) {
  const { user, loading, locked } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-vault-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-mono">Initializing vault...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (locked) return <LockScreen />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#0a1f35', color: '#e2e8f0', border: '1px solid #1a4a70', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
            success: { iconTheme: { primary: '#00cc88', secondary: '#040d14' } },
            error: { iconTheme: { primary: '#ff4444', secondary: '#040d14' } },
          }}
        />
        <Routes>
          <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"    element={<Dashboard />} />
            <Route path="snippets"     element={<Snippets />} />
            <Route path="files"        element={<FileManager />} />
            <Route path="settings"     element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
