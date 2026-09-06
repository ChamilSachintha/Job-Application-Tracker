import React, { useState } from 'react';
import { api } from '../lib/api';
import { Database, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface DatabaseStatusBadgeProps {
  onDataReset: () => void;
}

export const DatabaseStatusBadge: React.FC<DatabaseStatusBadgeProps> = ({ onDataReset }) => {
  const isConfigured = api.isConfigured();
  const [testing, setTesting] = useState(false);
  const { showToast } = useToast();

  const handleTest = async () => {
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

  const handleReset = () => {
    if (confirm('Reset to initial sample applications and timeline data?')) {
      api.resetSampleData();
      onDataReset();
      showToast('Sample dataset restored', 'info');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleTest}
        disabled={testing}
        title={
          isConfigured
            ? 'Connected to Supabase. Click to test API.'
            : 'Using local storage mode (Supabase credentials not configured in .env). Click to test.'
        }
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
          isConfigured
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
        }`}
      >
        <Database className="w-3.5 h-3.5" />
        <span>{isConfigured ? 'Supabase Connected' : 'Local Storage Mode'}</span>
        {isConfigured ? (
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        ) : (
          <AlertCircle className="w-3 h-3 text-slate-400" />
        )}
      </button>

      {!isConfigured && (
        <button
          onClick={handleReset}
          title="Reset to initial sample dataset"
          className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
