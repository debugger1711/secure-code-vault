import React, { useState, useEffect, useRef } from 'react';
import {
  Upload, FolderOpen, Download, Trash2, File, FileText,
  FileCode, Archive, Shield, Grid, List, X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileIcon = ({ ext, className = 'w-6 h-6' }) => {
  if (['.pdf'].includes(ext)) return <FileText className={`${className} text-red-400`} />;
  if (['.js', '.ts', '.jsx', '.tsx', '.py', '.sh'].includes(ext)) return <FileCode className={`${className} text-yellow-400`} />;
  if (['.zip'].includes(ext)) return <Archive className={`${className} text-purple-400`} />;
  return <File className={`${className} text-blue-400`} />;
};

const ALLOWED = '.txt,.pdf,.js,.ts,.zip,.py,.html,.css,.json,.md,.jsx,.tsx,.sh,.yaml,.yml';

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState('list');
  const [dragging, setDragging] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const fileInput = useRef();

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/files');
      setFiles(data.files);
    } catch { toast.error('Failed to load files.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFiles(); }, []);

  const doUpload = async (file) => {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) { toast.error('File too large. Max 10MB.'); return; }
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await api.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`"${file.name}" encrypted & uploaded.`);
      fetchFiles();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed.');
    } finally { setUploading(false); }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) doUpload(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) doUpload(file);
  };

  const handleDownload = async (file) => {
    try {
      const response = await api.get(`/files/${file._id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Decrypted & downloading "${file.originalName}"`);
    } catch { toast.error('Download failed.'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/files/${id}`);
      setFiles(prev => prev.filter(f => f._id !== id));
      toast.success('File deleted.');
    } catch { toast.error('Delete failed.'); }
    finally { setDeleting(null); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-accent" /> File Manager
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{files.length} encrypted file{files.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView(v => v === 'list' ? 'grid' : 'list')}
            className="btn-ghost p-2">
            {view === 'list' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </button>
          <button onClick={() => fileInput.current?.click()} disabled={uploading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50">
            {uploading ? <div className="w-4 h-4 border-2 border-vault-950 border-t-transparent rounded-full animate-spin" />
              : <Upload className="w-4 h-4" />}
            Upload File
          </button>
          <input ref={fileInput} type="file" accept={ALLOWED} onChange={handleFileSelect} className="hidden" />
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInput.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${dragging ? 'border-accent bg-accent/5 shadow-glow' : 'border-vault-600 hover:border-accent/50 hover:bg-vault-800/30'}`}>
        <Upload className={`w-8 h-8 mx-auto mb-2 ${dragging ? 'text-accent' : 'text-slate-500'}`} />
        <p className="text-slate-400 text-sm font-medium">{dragging ? 'Drop to encrypt & upload' : 'Drag & drop files here'}</p>
        <p className="text-slate-600 text-xs mt-1">or click to browse · {ALLOWED.replace(/\./g, '').replace(/,/g, ', ')} · Max 10MB</p>
        <div className="encrypt-badge mt-3 inline-flex">
          <Shield className="w-3 h-3" /> Files encrypted with AES-256 before storage
        </div>
      </div>

      {/* File list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin mr-3" />
          Loading files...
        </div>
      ) : files.length === 0 ? (
        <div className="vault-card text-center py-16">
          <FolderOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No files uploaded yet</p>
          <p className="text-slate-600 text-sm mt-1">Upload files to encrypt and store them securely.</p>
        </div>
      ) : view === 'list' ? (
        <div className="vault-card p-0 overflow-hidden">
          <div className="divide-y divide-vault-700/30">
            {files.map(file => (
              <div key={file._id} className="flex items-center gap-3 px-4 py-3 hover:bg-vault-800/40 transition-colors">
                <FileIcon ext={file.extension} />
                <div className="flex-1 min-w-0">
                  <div className="text-slate-200 text-sm font-medium truncate">{file.originalName}</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-slate-500 text-xs">{formatBytes(file.size)}</span>
                    <span className="text-slate-600 text-xs">{formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}</span>
                    <div className="encrypt-badge">ENC</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleDownload(file)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-accent hover:bg-accent/10 transition-colors"
                    title="Decrypt & Download">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(file._id, file.originalName)} disabled={deleting === file._id}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-colors">
                    {deleting === file._id
                      ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {files.map(file => (
            <div key={file._id} className="vault-card flex flex-col items-center gap-2 text-center relative group">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                <button onClick={() => handleDownload(file)}
                  className="w-7 h-7 bg-vault-700 rounded-lg flex items-center justify-center text-accent hover:bg-vault-600">
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(file._id, file.originalName)}
                  className="w-7 h-7 bg-vault-700 rounded-lg flex items-center justify-center text-red-400 hover:bg-vault-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <FileIcon ext={file.extension} className="w-10 h-10" />
              <div className="w-full">
                <div className="text-slate-200 text-xs font-medium truncate">{file.originalName}</div>
                <div className="text-slate-500 text-xs">{formatBytes(file.size)}</div>
              </div>
              <div className="encrypt-badge text-xs">ENC</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
