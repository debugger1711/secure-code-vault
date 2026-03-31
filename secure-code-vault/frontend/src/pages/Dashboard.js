import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, FolderOpen, Plus, Upload, TrendingUp, Clock, Shield, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLang } from '../utils/languages';
import { formatDistanceToNow } from 'date-fns';
import api from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [fileCount, setFileCount] = useState(0);

  useEffect(() => {
    api.get('/snippets/stats').then(({ data }) => setStats(data)).catch(() => {});
    api.get('/files').then(({ data }) => setFileCount(data.files?.length || 0)).catch(() => {});
  }, []);

  const topLang = stats?.byLanguage?.[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-accent rounded-xl blur-xl opacity-30"></div>
        <div className="relative bg-gradient-to-r from-vault-900/80 to-vault-800/60 backdrop-blur-sm border border-vault-600/30 rounded-xl p-6">
          <h1 className="font-display font-bold text-2xl text-white">
            Welcome back, <span className="glow-text bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">{user?.username}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            Your encrypted vault is active and secured with AES-256 encryption
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Code2, label: 'Snippets', value: stats?.total ?? '—', color: 'text-blue-400', bg: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30' },
          { icon: FolderOpen, label: 'Files', value: fileCount, color: 'text-purple-400', bg: 'bg-gradient-to-br from-purple-500/20 to-purple-600/10', border: 'border-purple-500/30' },
          { icon: TrendingUp, label: 'Top Language', value: topLang ? getLang(topLang._id).label : '—', color: 'text-emerald-400', bg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30' },
          { icon: Shield, label: 'Encryption', value: 'AES-256', color: 'text-accent', bg: 'bg-gradient-to-br from-accent/20 to-blue-500/10', border: 'border-accent/30' },
        ].map(({ icon: Icon, label, value, color, bg, border }) => (
          <div key={label} className={`vault-card ${border} flex items-center gap-3 hover:scale-105 transition-all duration-300 group`}>
            <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 blue-glow group-hover:animate-pulse`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</div>
              <div className="font-display font-bold text-white text-xl leading-tight">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions + Recent */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-display font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent animate-pulse" /> Quick Actions
          </h2>
          {[
            { icon: Plus, label: 'Add New Snippet', sub: 'Store encrypted code', action: () => navigate('/snippets?new=1'), color: 'text-blue-400', bg: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10' },
            { icon: Upload, label: 'Upload File', sub: 'Encrypt & store a file', action: () => navigate('/files'), color: 'text-purple-400', bg: 'bg-gradient-to-br from-purple-500/20 to-purple-600/10' },
          ].map(({ icon: Icon, label, sub, action, color, bg }) => (
            <button key={label} onClick={action}
              className="vault-card w-full text-left flex items-center gap-4 hover:scale-[1.02] transition-all duration-300 group">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 blue-glow group-hover:animate-float`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <div className="text-white font-medium text-sm">{label}</div>
                <div className="text-slate-400 text-xs">{sub}</div>
              </div>
            </button>
          ))}

          {/* Security info */}
          <div className="vault-card border-accent/30 bg-gradient-accent accent-glow">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-accent animate-pulse" />
              <span className="text-accent text-sm font-mono font-semibold">SECURITY STATUS</span>
            </div>
            <div className="space-y-2">
              {['AES-256-CBC encryption', 'JWT auth tokens', 'bcrypt password hashing', 'Auto-lock after 5 min'].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" /> {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2">
          <h2 className="font-display font-semibold text-white flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-accent animate-pulse" /> Recent Snippets
          </h2>
          <div className="vault-card p-0 overflow-hidden accent-glow">
            {stats?.recent?.length ? (
              <div className="divide-y divide-vault-700/30">
                {stats.recent.map((s) => {
                  const lang = getLang(s.language);
                  return (
                    <div key={s._id}
                      onClick={() => navigate('/snippets')}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gradient-accent cursor-pointer transition-all duration-300 group">
                      <div className={`lang-badge ${lang.bg} ${lang.border} ${lang.text} blue-glow`}>
                        {lang.label}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-200 text-sm font-medium truncate group-hover:text-white transition-colors">{s.title}</div>
                        <div className="text-slate-400 text-xs flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(s.updatedAt), { addSuffix: true })}
                        </div>
                      </div>
                      <div className="encrypt-badge animate-pulse">ENC</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <Code2 className="w-12 h-12 mx-auto mb-3 opacity-30 animate-float" />
                <p className="text-sm mb-2">No snippets yet.</p>
                <button onClick={() => navigate('/snippets?new=1')} className="text-accent text-sm hover:text-blue-400 transition-colors font-medium">
                  Add your first snippet →
                </button>
              </div>
            )}
          </div>

          {/* Language breakdown */}
          {stats?.byLanguage?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">Language Breakdown</h3>
              <div className="flex flex-wrap gap-2">
                {stats.byLanguage.map(({ _id, count }) => {
                  const lang = getLang(_id);
                  return (
                    <div key={_id} className={`lang-badge ${lang.bg} ${lang.border} ${lang.text}`}>
                      {lang.label} <span className="opacity-60 ml-1">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
