import React, { useState, useRef } from 'react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import {
  X,
  Database,
  Download,
  Upload,
  FileCode,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const isConfigured = api.isConfigured();
  const counts = api.getLocalCounts();

  const handleDownloadJson = () => {
    try {
      api.downloadBackupJson();
      showToast('JSON Backup downloaded successfully!');
    } catch {
      showToast('Failed to download backup', 'error');
    }
  };

  const handleDownloadSql = () => {
    try {
      api.downloadSqlDump();
      showToast('SQL Dump downloaded successfully!');
    } catch {
      showToast('Failed to generate SQL dump', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = api.importData(json);
        onDataChanged();
        showToast(
          `Imported ${res.appCount} applications and ${res.actCount} timeline activities!`
        );
      } catch (err: any) {
        showToast(`Import failed: ${err?.message || 'Invalid JSON file'}`, 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleMigrateToSupabase = async () => {
    setIsMigrating(true);
    setMigrationResult(null);
    try {
      const res = await api.migrateLocalToSupabase();
      if (res.success) {
        setMigrationResult({
          success: true,
          message: `Successfully migrated ${res.appCount} applications and ${res.actCount} timeline activities to Supabase!`,
        });
        showToast('All local data successfully migrated to Supabase!');
        onDataChanged();
      } else {
        setMigrationResult({
          success: false,
          message: res.error || 'Failed to migrate data to Supabase.',
        });
        showToast(res.error || 'Migration failed', 'error');
      }
    } catch (err: any) {
      setMigrationResult({
        success: false,
        message: err?.message || 'Migration error occurred',
      });
      showToast('Error during migration', 'error');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Backup & Database Migration
              </h2>
              <p className="text-xs text-slate-500">
                Safely store and migrate your applications into Supabase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Local Storage Status */}
        <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Local Browser Storage
            </div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">
              {counts.applicationsCount} Applications &bull; {counts.activitiesCount} Activities
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Active in memory
          </div>
        </div>

        {/* Action 1: Instant Local Backup */}
        <div className="space-y-3 mb-5">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Step 1: Download Safe Offline Backup
          </h3>
          <p className="text-xs text-slate-500">
            Never risk losing your records when clearing your browser cookies or cache. Download a copy right now:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={handleDownloadJson}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-xl text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              Download Backup (JSON)
            </button>

            <button
              onClick={handleDownloadSql}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-xl text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-xs"
            >
              <FileCode className="w-4 h-4 text-emerald-600" />
              Download SQL Dump
            </button>
          </div>

          <div className="pt-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Restore / Import data from a backup JSON file
            </button>
          </div>
        </div>

        {/* Action 2: Supabase Migration */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Step 2: Store Permanently in Supabase Database
          </h3>

          {isConfigured ? (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Supabase is connected!</strong> You can now transfer all {counts.applicationsCount} local applications and history directly into your PostgreSQL database.
                </div>
              </div>

              <button
                onClick={handleMigrateToSupabase}
                disabled={isMigrating || counts.applicationsCount === 0}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
              >
                {isMigrating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Migrating {counts.applicationsCount} applications to Supabase...
                  </>
                ) : (
                  <>
                    <span>Migrate All Local Data to Supabase</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {migrationResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                    migrationResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {migrationResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{migrationResult.message}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>Supabase credentials not configured in `.env` yet</span>
              </div>
              <p className="leading-relaxed text-amber-800">
                To link a real database and transfer your {counts.applicationsCount} applications:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-amber-800 pl-1">
                <li>Create a free project on <strong>supabase.com</strong>.</li>
                <li>Run <strong>supabase/schema.sql</strong> in the Supabase SQL Editor.</li>
                <li>Add your credentials to <strong>.env</strong>:
                  <div className="mt-1 font-mono text-[11px] bg-white/80 p-2 rounded border border-amber-200 text-slate-800 select-all">
                    VITE_SUPABASE_URL=https://your-project.supabase.co<br />
                    VITE_SUPABASE_ANON_KEY=your-anon-key
                  </div>
                </li>
                <li>Restart `npm run dev` and click <strong>Migrate All Local Data to Supabase</strong>.</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
