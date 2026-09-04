import React, { useState } from 'react';
import { useAuth } from '../../lib/authContext';
import {
  GraduationCap,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [learningDropdownOpen, setLearningDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* NIU Brand Logo */}
          <button
            id="nav-logo-btn"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded bg-[#0a192f] text-white flex items-center justify-center font-serif font-bold text-xl shadow-sm border border-slate-700">
              N
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-slate-900 tracking-tight text-lg leading-tight">
                  Nova International University
                </span>
              </div>
              <p className="text-[11px] uppercase tracking-widest text-slate-500 font-medium">
                NIU • Digital Learning Institution
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium text-slate-700">
            <button
              id="nav-home-btn"
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 rounded-md transition-colors ${
                currentView === 'home' ? 'text-blue-900 font-semibold bg-blue-50/60' : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>

            {/* About Dropdown */}
            <div className="relative">
              <button
                id="nav-about-dropdown-btn"
                onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                onBlur={() => setTimeout(() => setAboutDropdownOpen(false), 200)}
                className="px-3 py-2 rounded-md flex items-center gap-1 hover:text-slate-900 hover:bg-slate-50"
              >
                About <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {aboutDropdownOpen && (
                <div className="absolute left-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 animate-in fade-in">
                  <button
                    onClick={() => { onNavigate('about'); setAboutDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs text-slate-700 block"
                  >
                    About NIU
                  </button>
                  <button
                    onClick={() => { onNavigate('founder'); setAboutDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs text-slate-700 block"
                  >
                    Founder & President
                  </button>
                  <button
                    onClick={() => { onNavigate('mission'); setAboutDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs text-slate-700 block"
                  >
                    Mission, Vision & Values
                  </button>
                  <button
                    onClick={() => { onNavigate('schools'); setAboutDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs text-slate-700 block"
                  >
                    Schools & Departments
                  </button>
                  <button
                    onClick={() => { onNavigate('policies'); setAboutDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs text-slate-700 block"
                  >
                    Institutional Policies & Ethics
                  </button>
                </div>
              )}
            </div>

            <button
              id="nav-programmes-btn"
              onClick={() => onNavigate('programmes')}
              className={`px-3 py-2 rounded-md transition-colors ${
                currentView === 'programmes' ? 'text-blue-900 font-semibold bg-blue-50/60' : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Certificate Programmes
            </button>

            {/* Learning Dropdown */}
            <div className="relative">
              <button
                id="nav-learning-dropdown-btn"
                onClick={() => setLearningDropdownOpen(!learningDropdownOpen)}
                onBlur={() => setTimeout(() => setLearningDropdownOpen(false), 200)}
                className="px-3 py-2 rounded-md flex items-center gap-1 hover:text-slate-900 hover:bg-slate-50"
              >
                Learning <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {learningDropdownOpen && (
                <div className="absolute left-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                  <button
                    onClick={() => { onNavigate('how-it-works'); setLearningDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs text-slate-700 block"
                  >
                    How Online Learning Works
                  </button>
                  <button
                    onClick={() => { onNavigate('digital-library'); setLearningDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs text-slate-700 block"
                  >
                    Digital Library & Curated Texts
                  </button>
                  <button
                    onClick={() => { onNavigate('academic-calendar'); setLearningDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs text-slate-700 block"
                  >
                    Academic Calendar
                  </button>
                  <button
                    onClick={() => { onNavigate('student-resources'); setLearningDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs text-slate-700 block"
                  >
                    Student Support & Resources
                  </button>
                </div>
              )}
            </div>

            <button
              id="nav-verify-btn"
              onClick={() => onNavigate('verify')}
              className={`px-3 py-2 rounded-md flex items-center gap-1.5 transition-colors ${
                currentView === 'verify' ? 'text-blue-900 font-semibold bg-blue-50/60' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verify Certificate
            </button>

            <button
              id="nav-faq-btn"
              onClick={() => onNavigate('faq')}
              className="px-3 py-2 rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-50"
            >
              FAQs
            </button>
          </nav>

          {/* User Auth Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    id="nav-admin-dashboard-btn"
                    onClick={() => onNavigate('admin')}
                    className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 flex items-center gap-1.5 shadow-sm"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-amber-700" />
                    Admin Console
                  </button>
                )}

                <button
                  id="nav-student-dashboard-btn"
                  onClick={() => onNavigate('student-dashboard')}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5 shadow-sm"
                >
                  <GraduationCap className="w-4 h-4 text-blue-300" />
                  My Learning
                </button>

                <div className="h-6 w-px bg-slate-200 mx-1" />

                <div className="flex items-center gap-2 pl-1">
                  <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-semibold text-slate-700 overflow-hidden">
                    {userProfile?.photoURL ? (
                      <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      userProfile?.fullName?.charAt(0) || 'U'
                    )}
                  </div>
                  <button
                    id="nav-logout-btn"
                    onClick={() => logout()}
                    title="Sign Out"
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-signin-btn"
                  onClick={onOpenAuth}
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
                >
                  Sign In
                </button>
                <button
                  id="nav-apply-btn"
                  onClick={onOpenAuth}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0a192f] hover:bg-slate-800 rounded-md transition-colors shadow-sm"
                >
                  Apply & Enroll
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              id="nav-mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded"
          >
            Home
          </button>
          <button
            onClick={() => { onNavigate('programmes'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded"
          >
            Certificate Programmes
          </button>
          <button
            onClick={() => { onNavigate('about'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded"
          >
            About NIU
          </button>
          <button
            onClick={() => { onNavigate('founder'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded"
          >
            Founder & President
          </button>
          <button
            onClick={() => { onNavigate('schools'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded"
          >
            Schools & Departments
          </button>
          <button
            onClick={() => { onNavigate('how-it-works'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded"
          >
            How Online Learning Works
          </button>
          <button
            onClick={() => { onNavigate('digital-library'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded"
          >
            Digital Library
          </button>
          <button
            onClick={() => { onNavigate('verify'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50/50 rounded flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Verify Certificate
          </button>

          <div className="pt-4 border-t border-slate-200">
            {currentUser ? (
              <div className="space-y-2">
                {isAdmin && (
                  <button
                    onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 px-4 text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 rounded text-center block"
                  >
                    Open Admin Console
                  </button>
                )}
                <button
                  onClick={() => { onNavigate('student-dashboard'); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 px-4 text-sm font-semibold bg-slate-900 text-white rounded text-center block"
                >
                  Student Portal
                </button>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full py-2 text-sm text-red-600 text-center font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 text-center text-sm font-medium text-slate-700 border border-slate-300 rounded"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 text-center text-sm font-medium text-white bg-slate-900 rounded shadow-sm"
                >
                  Apply & Enroll
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
