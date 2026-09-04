import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  Layers,
  GraduationCap,
  Users,
  Award,
  FileText,
  ShieldCheck,
  Building,
  Settings,
  History,
  HelpCircle,
  LogOut,
  ExternalLink,
} from 'lucide-react';

interface AdminSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onExitAdmin: () => void;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  onExitAdmin,
  onLogout,
}) => {
  const navSections = [
    {
      heading: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      heading: 'ACADEMICS',
      items: [
        { id: 'studio', label: 'Academic Studio', icon: Sparkles, badge: 'Unified' },
        { id: 'programmes', label: 'Programmes', icon: BookOpen },
        { id: 'assessments', label: 'Assessments', icon: Layers },
        { id: 'question-bank', label: 'Question Bank', icon: HelpCircle },
      ],
    },
    {
      heading: 'PEOPLE',
      items: [
        { id: 'students', label: 'Students & Enrollees', icon: Users },
      ],
    },
    {
      heading: 'CREDENTIALS',
      items: [
        { id: 'certificates', label: 'Certificates Registry', icon: Award },
        { id: 'transcripts', label: 'Transcripts', icon: FileText },
        { id: 'verification', label: 'Verification Records', icon: ShieldCheck },
      ],
    },
    {
      heading: 'INSTITUTION',
      items: [
        { id: 'schools', label: 'Schools & Departments', icon: Building },
        { id: 'audit-logs', label: 'Audit Logs', icon: History },
        { id: 'settings', label: 'Settings & Security', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#0a192f] text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 h-screen sticky top-0">
      {/* Top Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-white text-slate-950 flex items-center justify-center font-serif font-bold text-base">
              N
            </div>
            <div>
              <h1 className="text-sm font-serif font-bold text-white tracking-tight leading-tight">
                Nova International University
              </h1>
              <p className="text-[10px] uppercase font-mono text-amber-400 font-semibold tracking-wider">
                Admin Console
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="py-4 px-3 space-y-6 overflow-y-auto max-h-[calc(100vh-170px)]">
          {navSections.map((sec) => (
            <div key={sec.heading} className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 block mb-1">
                {sec.heading}
              </span>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isSelected = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-800 text-white shadow-xs font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-300' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] uppercase font-semibold bg-blue-700/80 text-blue-100 px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation & Logout */}
      <div className="p-3 border-t border-slate-800 space-y-1 text-xs">
        <button
          onClick={onExitAdmin}
          className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Exit to Public Campus</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-slate-800/80 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out Admin</span>
        </button>
      </div>
    </aside>
  );
};
