import React, { useState } from 'react';
import { useAuth } from '../../lib/authContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminDashboardOverview } from './AdminDashboardOverview';
import { AcademicProductionStudio } from './AcademicProductionStudio';
import { AdminStudentsView } from './AdminStudentsView';
import { AdminCertificatesView } from './AdminCertificatesView';
import { AdminTranscriptsView } from './AdminTranscriptsView';
import { AdminQuestionBankView } from './AdminQuestionBankView';
import { AdminSchoolsView } from './AdminSchoolsView';
import { AdminAuditLogsView } from './AdminAuditLogsView';
import { AdminSettingsView } from './AdminSettingsView';

interface AdminLayoutProps {
  onExitAdmin: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onExitAdmin }) => {
  const { logout, userProfile, currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Admin Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onExitAdmin={onExitAdmin}
        onLogout={() => {
          logout();
          onExitAdmin();
        }}
      />

      {/* Main Administrative Working Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Mini Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Current Operator:{' '}
            <span className="font-mono font-semibold text-slate-900">
              {currentUser?.email}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              Superadmin Access
            </span>
          </div>
        </header>

        {/* Content Pane */}
        <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <AdminDashboardOverview
              onOpenStudio={() => setCurrentTab('studio')}
              onViewProgrammes={() => setCurrentTab('studio')}
              onViewStudents={() => setCurrentTab('students')}
              onViewCertificates={() => setCurrentTab('certificates')}
            />
          )}

          {(currentTab === 'studio' || currentTab === 'programmes') && (
            <AcademicProductionStudio
              onBackToOverview={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'students' && <AdminStudentsView />}

          {(currentTab === 'certificates' || currentTab === 'verification') && (
            <AdminCertificatesView />
          )}

          {currentTab === 'transcripts' && <AdminTranscriptsView />}

          {(currentTab === 'question-bank' || currentTab === 'assessments') && (
            <AdminQuestionBankView />
          )}

          {currentTab === 'schools' && <AdminSchoolsView />}

          {currentTab === 'audit-logs' && <AdminAuditLogsView />}

          {currentTab === 'settings' && <AdminSettingsView />}
        </main>
      </div>
    </div>
  );
};
