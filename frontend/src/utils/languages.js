export const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', color: '#f7df1e', bg: 'bg-yellow-900/30', border: 'border-yellow-700/50', text: 'text-yellow-300' },
  { value: 'typescript', label: 'TypeScript', color: '#3178c6', bg: 'bg-blue-900/30', border: 'border-blue-700/50', text: 'text-blue-300' },
  { value: 'python',     label: 'Python',     color: '#3572a5', bg: 'bg-blue-900/30', border: 'border-blue-600/50', text: 'text-blue-200' },
  { value: 'java',       label: 'Java',       color: '#b07219', bg: 'bg-orange-900/30', border: 'border-orange-700/50', text: 'text-orange-300' },
  { value: 'cpp',        label: 'C++',        color: '#f34b7d', bg: 'bg-pink-900/30', border: 'border-pink-700/50', text: 'text-pink-300' },
  { value: 'c',          label: 'C',          color: '#555555', bg: 'bg-gray-800/40', border: 'border-gray-600/50', text: 'text-gray-300' },
  { value: 'csharp',     label: 'C#',         color: '#178600', bg: 'bg-green-900/30', border: 'border-green-700/50', text: 'text-green-300' },
  { value: 'go',         label: 'Go',         color: '#00add8', bg: 'bg-cyan-900/30', border: 'border-cyan-700/50', text: 'text-cyan-300' },
  { value: 'rust',       label: 'Rust',       color: '#dea584', bg: 'bg-amber-900/30', border: 'border-amber-700/50', text: 'text-amber-300' },
  { value: 'ruby',       label: 'Ruby',       color: '#701516', bg: 'bg-red-900/30', border: 'border-red-700/50', text: 'text-red-300' },
  { value: 'php',        label: 'PHP',        color: '#4f5d95', bg: 'bg-indigo-900/30', border: 'border-indigo-700/50', text: 'text-indigo-300' },
  { value: 'swift',      label: 'Swift',      color: '#fa7343', bg: 'bg-orange-900/30', border: 'border-orange-600/50', text: 'text-orange-200' },
  { value: 'kotlin',     label: 'Kotlin',     color: '#a97bff', bg: 'bg-purple-900/30', border: 'border-purple-700/50', text: 'text-purple-300' },
  { value: 'sql',        label: 'SQL',        color: '#e38c00', bg: 'bg-yellow-900/30', border: 'border-yellow-600/50', text: 'text-yellow-200' },
  { value: 'bash',       label: 'Bash',       color: '#89e051', bg: 'bg-green-900/30', border: 'border-green-600/50', text: 'text-green-200' },
  { value: 'html',       label: 'HTML',       color: '#e34c26', bg: 'bg-red-900/30', border: 'border-red-600/50', text: 'text-red-200' },
  { value: 'css',        label: 'CSS',        color: '#563d7c', bg: 'bg-purple-900/30', border: 'border-purple-600/50', text: 'text-purple-200' },
  { value: 'json',       label: 'JSON',       color: '#40d47e', bg: 'bg-emerald-900/30', border: 'border-emerald-700/50', text: 'text-emerald-300' },
  { value: 'yaml',       label: 'YAML',       color: '#cb171e', bg: 'bg-red-900/30', border: 'border-red-800/50', text: 'text-red-300' },
  { value: 'markdown',   label: 'Markdown',   color: '#083fa1', bg: 'bg-blue-900/30', border: 'border-blue-800/50', text: 'text-blue-200' },
  { value: 'other',      label: 'Other',      color: '#888888', bg: 'bg-slate-800/40', border: 'border-slate-600/50', text: 'text-slate-300' },
];

export const getLang = (value) =>
  LANGUAGES.find((l) => l.value === value) || LANGUAGES[LANGUAGES.length - 1];

export const monacoLang = (value) => {
  const map = { cpp: 'cpp', csharp: 'csharp', javascript: 'javascript',
    typescript: 'typescript', python: 'python', java: 'java', go: 'go',
    rust: 'rust', ruby: 'ruby', php: 'php', swift: 'swift', kotlin: 'kotlin',
    sql: 'sql', bash: 'shell', html: 'html', css: 'css', json: 'json',
    yaml: 'yaml', markdown: 'markdown', c: 'c', other: 'plaintext' };
  return map[value] || 'plaintext';
};
