import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  Application,
  ApplicationActivity,
  ApplicationFormData,
  ActivityFormData,
  FilterState,
  ApplicationStatus,
} from './types/database';
import { api } from './lib/api';
import { useToast } from './context/ToastContext';
import { SummaryCard } from './components/SummaryCard';
import { FollowUpCard } from './components/FollowUpCard';
import { FilterBar } from './components/FilterBar';
import { ApplicationTable } from './components/ApplicationTable';
import { ApplicationForm } from './components/ApplicationForm';
import { ApplicationDetails } from './components/ApplicationDetails';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { DatabaseStatusBadge } from './components/DatabaseStatusBadge';
import { DataManagementModal } from './components/DataManagementModal';
import {
  Plus,
  Briefcase,
  Send,
  CalendarCheck,
  Trophy,
  XCircle,
} from 'lucide-react';

export const AppContent: React.FC = () => {
  const { showToast } = useToast();

  // Data states
  const [applications, setApplications] = useState<Application[]>([]);
  const [activities, setActivities] = useState<ApplicationActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals & panels state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [selectedAppForEdit, setSelectedAppForEdit] = useState<Application | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAppForDetails, setSelectedAppForDetails] = useState<Application | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<Application | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Filters and Sorting
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    source: '',
    appliedDate: '',
    interviewDate: '',
    sortBy: 'updated_at',
    sortOrder: 'desc',
  });

  // Fetch applications
  const loadApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      const apps = await api.getApplications();
      setApplications(apps);
    } catch (err) {
      console.error(err);
      showToast('Failed to load applications', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // Fetch activities when details panel is opened for an application
  const loadActivities = useCallback(async (appId: string) => {
    try {
      const acts = await api.getActivities(appId);
      setActivities(acts);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (selectedAppForDetails?.id) {
      loadActivities(selectedAppForDetails.id);
    } else {
      setActivities([]);
    }
  }, [selectedAppForDetails?.id, loadActivities]);

  // Dynamic Summary Metric Calculations
  const stats = useMemo(() => {
    const total = applications.length;

    // Applied: status is 'Applied' or related early stages
    const applied = applications.filter(
      (a) =>
        a.status === 'Applied' ||
        a.status === 'Application Viewed' ||
        a.status === 'Interested'
    ).length;

    // Interviews: includes HR Call, Interview Scheduled, Interview Completed, Final Interview
    const interviews = applications.filter(
      (a) =>
        a.status === 'HR Call' ||
        a.status === 'Interview Scheduled' ||
        a.status === 'Interview Completed' ||
        a.status === 'Final Interview'
    ).length;

    // Offers
    const offers = applications.filter((a) => a.status === 'Offer Received').length;

    // Rejected
    const rejected = applications.filter((a) => a.status === 'Rejected').length;

    return { total, applied, interviews, offers, rejected };
  }, [applications]);

  // Filter & Sort Applications
  const filteredApplications = useMemo(() => {
    let result = [...applications];

    // Search: company_name, position, applied_email
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (app) =>
          app.company_name.toLowerCase().includes(query) ||
          app.position.toLowerCase().includes(query) ||
          (app.applied_email && app.applied_email.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (filters.status) {
      result = result.filter((app) => app.status === filters.status);
    }

    // Source filter
    if (filters.source) {
      result = result.filter((app) => app.application_source === filters.source);
    }

    // Applied Date filter
    if (filters.appliedDate) {
      result = result.filter((app) => app.applied_date === filters.appliedDate);
    }

    // Interview Date filter
    if (filters.interviewDate) {
      result = result.filter((app) => app.interview_date === filters.interviewDate);
    }

    // Sorting
    result.sort((a, b) => {
      let valA: any = a[filters.sortBy] || '';
      let valB: any = b[filters.sortBy] || '';

      if (filters.sortBy === 'company_name' || filters.sortBy === 'status') {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return filters.sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [applications, filters]);

  // Filter Bar Handlers
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      source: '',
      appliedDate: '',
      interviewDate: '',
      sortBy: 'updated_at',
      sortOrder: 'desc',
    });
  };

  const handleSort = (column: FilterState['sortBy']) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Card click to quick filter
  const handleCardFilter = (statusType: string) => {
    if (statusType === 'all') {
      handleClearFilters();
    } else if (filters.status === statusType) {
      setFilters((prev) => ({ ...prev, status: '' }));
    } else {
      setFilters((prev) => ({ ...prev, status: statusType }));
    }
  };

  // CRUD Handlers
  const handleOpenAddForm = () => {
    setSelectedAppForEdit(null);
    setFormMode('add');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (app: Application) => {
    setSelectedAppForEdit(app);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: ApplicationFormData) => {
    try {
      if (formMode === 'add') {
        const created = await api.createApplication(formData);
        setApplications((prev) => [created, ...prev]);
        showToast(`Added application for ${created.company_name}`);
      } else if (formMode === 'edit' && selectedAppForEdit) {
        const updated = await api.updateApplication(
          selectedAppForEdit.id,
          formData,
          selectedAppForEdit.status
        );
        setApplications((prev) =>
          prev.map((app) => (app.id === updated.id ? updated : app))
        );
        if (selectedAppForDetails?.id === updated.id) {
          setSelectedAppForDetails(updated);
          loadActivities(updated.id);
        }
        showToast(`Updated ${updated.company_name}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving application', 'error');
      throw err;
    }
  };

  const handleStatusChange = async (
    app: Application,
    newStatus: ApplicationStatus
  ) => {
    if (app.status === newStatus) return;
    try {
      const updated = await api.updateApplication(
        app.id,
        { status: newStatus },
        app.status
      );
      setApplications((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setSelectedAppForDetails(updated);
      await loadActivities(updated.id);
      showToast(`Status updated to "${newStatus}"`);
    } catch (err) {
      console.error(err);
      showToast('Failed to update status', 'error');
    }
  };

  const handleOpenDelete = (app: Application) => {
    setAppToDelete(app);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!appToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteApplication(appToDelete.id);
      setApplications((prev) => prev.filter((a) => a.id !== appToDelete.id));
      if (selectedAppForDetails?.id === appToDelete.id) {
        setIsDetailsOpen(false);
        setSelectedAppForDetails(null);
      }
      showToast(`Deleted application for ${appToDelete.company_name}`);
      setIsDeleteOpen(false);
      setAppToDelete(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete application', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetails = (app: Application) => {
    setSelectedAppForDetails(app);
    setIsDetailsOpen(true);
  };

  // Timeline Activity Handlers
  const handleAddActivity = async (data: ActivityFormData) => {
    if (!selectedAppForDetails) return;
    try {
      const newAct = await api.createActivity(selectedAppForDetails.id, data);
      setActivities((prev) => [newAct, ...prev]);
      showToast('Activity logged to timeline');
    } catch (err) {
      console.error(err);
      showToast('Failed to log activity', 'error');
    }
  };

  const handleDeleteActivity = async (actId: string) => {
    try {
      await api.deleteActivity(actId);
      setActivities((prev) => prev.filter((a) => a.id !== actId));
      showToast('Timeline activity removed', 'info');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete activity', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-indigo-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                Job Application Tracker
              </h1>
              <p className="text-xs text-slate-500 mt-1 hidden sm:block">
                Keep track of every opportunity, application, and interview in one place.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DatabaseStatusBadge onOpenDataManagement={() => setIsDataModalOpen(true)} />

            <button
              onClick={handleOpenAddForm}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm shadow-indigo-100 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Application</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Summary Metrics */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          <SummaryCard
            title="Total Applications"
            value={stats.total}
            icon={Briefcase}
            iconColor="text-indigo-600"
            bgColor="bg-indigo-50"
            subtext="All tracked"
            onClick={() => handleCardFilter('all')}
            isActive={filters.status === ''}
          />
          <SummaryCard
            title="Applied"
            value={stats.applied}
            icon={Send}
            iconColor="text-blue-600"
            bgColor="bg-blue-50"
            subtext="In review"
            onClick={() => handleCardFilter('Applied')}
            isActive={filters.status === 'Applied'}
          />
          <SummaryCard
            title="Interviews"
            value={stats.interviews}
            icon={CalendarCheck}
            iconColor="text-amber-600"
            bgColor="bg-amber-50"
            subtext="Scheduled/done"
            onClick={() => handleCardFilter('Interview Scheduled')}
            isActive={
              filters.status === 'Interview Scheduled' ||
              filters.status === 'HR Call' ||
              filters.status === 'Interview Completed'
            }
          />
          <SummaryCard
            title="Offers"
            value={stats.offers}
            icon={Trophy}
            iconColor="text-emerald-600"
            bgColor="bg-emerald-50"
            subtext="Received"
            onClick={() => handleCardFilter('Offer Received')}
            isActive={filters.status === 'Offer Received'}
          />
          <SummaryCard
            title="Rejected"
            value={stats.rejected}
            icon={XCircle}
            iconColor="text-rose-600"
            bgColor="bg-rose-50"
            subtext="Closed"
            onClick={() => handleCardFilter('Rejected')}
            isActive={filters.status === 'Rejected'}
          />
        </section>

        {/* Upcoming Follow-ups Section */}
        <section>
          <FollowUpCard
            applications={applications}
            onSelectApplication={handleViewDetails}
          />
        </section>

        {/* Search, Filter & Table Area */}
        <section className="space-y-4">
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            totalResults={filteredApplications.length}
          />

          <ApplicationTable
            applications={filteredApplications}
            filters={filters}
            onSort={handleSort}
            onView={handleViewDetails}
            onEdit={handleOpenEditForm}
            onDelete={handleOpenDelete}
            isLoading={isLoading}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          Job Application Tracker &bull; Personal career CRM &bull; Built with React, Tailwind CSS, and Supabase
        </div>
      </footer>

      {/* Modals and Drawers */}
      <ApplicationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedAppForEdit}
        mode={formMode}
      />

      <ApplicationDetails
        application={selectedAppForDetails}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedAppForDetails(null);
        }}
        onEdit={(app) => {
          setIsDetailsOpen(false);
          handleOpenEditForm(app);
        }}
        onStatusChange={handleStatusChange}
        activities={activities}
        onAddActivity={handleAddActivity}
        onDeleteActivity={handleDeleteActivity}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        application={appToDelete}
        onClose={() => {
          setIsDeleteOpen(false);
          setAppToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        onDataChanged={loadApplications}
      />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
