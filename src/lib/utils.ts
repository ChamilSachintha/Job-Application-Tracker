import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString || '—';
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dateString || '—';
  }
}

export function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 30) {
      return formatDate(dateString);
    }
    if (diffDays > 1) {
      return `${diffDays}d ago`;
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffHours >= 1) {
      return `${diffHours}h ago`;
    }
    if (diffMin >= 1) {
      return `${diffMin}m ago`;
    }
    return 'Just now';
  } catch {
    return '—';
  }
}

export function isDateOverdue(dateString?: string | null): boolean {
  if (!dateString) return false;
  try {
    const target = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return target.getTime() < today.getTime();
  } catch {
    return false;
  }
}

export function isDateToday(dateString?: string | null): boolean {
  if (!dateString) return false;
  try {
    const target = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
    const today = new Date();
    return (
      target.getFullYear() === today.getFullYear() &&
      target.getMonth() === today.getMonth() &&
      target.getDate() === today.getDate()
    );
  } catch {
    return false;
  }
}

export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getMonogramColor(name: string): { bg: string; text: string } {
  const colors = [
    { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700' },
    { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700' },
    { bg: 'bg-violet-50 text-violet-700 border-violet-200', text: 'text-violet-700' },
    { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700' },
    { bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700' },
    { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'text-indigo-700' },
    { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', text: 'text-cyan-700' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
