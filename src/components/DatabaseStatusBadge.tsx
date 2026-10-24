import React, { useState } from 'react';
import { api } from '../lib/api';
import { Database, CheckCircle2, AlertCircle, HardDriveDownload } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface DatabaseStatusBadgeProps {
  onOpenDataManagement: () => void;
}

export const DatabaseStatusBadge: React.FC<DatabaseStatusBadgeProps> = ({
  onOpenDataManagement,
}) => {
  const isConfigured = api.isConfigured();
  const [testing, setTesting] = useState(false);
  const { showToast } = useToast();

  const handleTest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setTesting(true);
    try {
      const res = await api.testConnection();
      showToast(res.message, res.success ? 'success' : 'info');
    } catch {
      showToast('Error checking connection', 'error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onOpenDataManagement}
        title={
          isConfigured
            ? 'Connected to Supabase. Click to manage backups and data.'
            : 'Using local storage mode. Click to backup or migrate to Supabase.'
        }
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
          isConfigured
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
        }`}
      >
        <Database className="w-3.5 h-3.5" />
        <span>{isConfigured ? 'Supabase Connected' : 'Local Storage Mode'}</span>
        {isConfigured ? (
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        ) : (
          <AlertCircle className="w-3 h-3 text-amber-600" />
        )}
      </button>

      <button
        onClick={onOpenDataManagement}
        title="Backup, export, or migrate your applications"
        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 text-slate-700 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
      >
        <HardDriveDownload className="w-3.5 h-3.5 text-indigo-600" />
        <span className="hidden sm:inline">Backup & Migrate</span>
      </button>

      {isConfigured && (
        <button
          onClick={handleTest}
          disabled={testing}
          title="Test live Supabase connection"
          className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
        >
          {testing ? 'Testing...' : 'Test'}
        </button>
      )}
    </div>
  );
};
