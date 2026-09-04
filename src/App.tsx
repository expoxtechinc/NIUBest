import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/authContext';
import { Programme, Certificate, Transcript } from './types';
import { fetchProgrammes } from './lib/academicService';
import { enrollStudent, fetchStudentEnrollments } from './lib/progressService';
import { DisclaimerBanner } from './components/common/DisclaimerBanner';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AuthModal } from './components/common/AuthModal';
import { PublicWebsite } from './components/public/PublicWebsite';
import { ProgrammeDetailModal } from './components/public/ProgrammeDetailModal';
import { PublicVerificationPage } from './components/verify/PublicVerificationPage';
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentLearningPlayer } from './components/student/StudentLearningPlayer';
import { StudentTranscriptView } from './components/student/StudentTranscriptView';
import { CertificateTemplate } from './components/certificate/CertificateTemplate';
import { AdminLayout } from './components/admin/AdminLayout';

function MainApp() {
  const { currentUser, userProfile, isAdmin } = useAuth();

  // Navigation views: 'public' | 'verification' | 'student-dashboard' | 'student-learn' | 'admin'
  const [currentView, setCurrentView] = useState<string>('public');

  // Modals and active objects
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalDefaultTab, setAuthModalDefaultTab] = useState<'login' | 'register'>('login');
  const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(null);
  const [learningProgramme, setLearningProgramme] = useState<Programme | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);

  useEffect(() => {
    // Check if query string has ?code=... for direct verification link
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code')) {
      setCurrentView('verification');
    }
  }, []);

  // Handle Enrollment Action from Programme Modal or Catalog
  const handleEnrollInProgramme = async (prog: Programme) => {
    if (!currentUser) {
      setAuthModalDefaultTab('register');
      setAuthModalOpen(true);
      return;
    }

    try {
      await enrollStudent(
        currentUser.uid,
        currentUser.email || '',
        userProfile?.fullName || currentUser.email || 'Learner',
        prog
      );
      setSelectedProgramme(null);
      setLearningProgramme(prog);
      setCurrentView('student-learn');
    } catch (err) {
      console.error('Enrollment error:', err);
      alert('Could not complete enrollment. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased selection:bg-blue-900 selection:text-white">
      {/* Institutional Legal Disclaimer Banner */}
      {currentView !== 'admin' && <DisclaimerBanner />}

      {/* Primary Navigation Bar (Only for non-admin and non-player views) */}
      {currentView !== 'admin' && currentView !== 'student-learn' && (
        <Navbar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onOpenAuthModal={(tab) => {
            setAuthModalDefaultTab(tab);
            setAuthModalOpen(true);
          }}
        />
      )}

      {/* VIEW ROUTING */}
      <div className="flex-1 flex flex-col">
        {/* 1. Public Facing Website (Catalog, Schools, About, FAQ, Verification teaser) */}
        {currentView === 'public' && (
          <PublicWebsite
            onSelectProgramme={(prog) => setSelectedProgramme(prog)}
            onOpenVerify={() => setCurrentView('verification')}
            onOpenAuthModal={(tab) => {
              setAuthModalDefaultTab(tab);
              setAuthModalOpen(true);
            }}
          />
        )}

        {/* 2. Public Credential Verification Page */}
        {currentView === 'verification' && (
          <PublicVerificationPage onBack={() => setCurrentView('public')} />
        )}

        {/* 3. Student Academic Portal Dashboard */}
        {currentView === 'student-dashboard' && (
          <StudentDashboard
            onSelectProgrammeToLearn={(prog) => {
              setLearningProgramme(prog);
              setCurrentView('student-learn');
            }}
            onExploreCatalog={() => setCurrentView('public')}
            onViewCertificate={(cert) => setSelectedCertificate(cert)}
            onViewTranscript={(trans) => setSelectedTranscript(trans)}
          />
        )}

        {/* 4. Student Learning Player (14 Sections, Quizzes, Course Tree) */}
        {currentView === 'student-learn' && learningProgramme && (
          <StudentLearningPlayer
            programme={learningProgramme}
            onBackToDashboard={() => setCurrentView('student-dashboard')}
            onViewCertificate={(cert) => setSelectedCertificate(cert)}
          />
        )}

        {/* 5. Full Administrative Console */}
        {currentView === 'admin' && (
          <AdminLayout onExitAdmin={() => setCurrentView('public')} />
        )}
      </div>

      {/* Public Footer */}
      {currentView !== 'admin' && currentView !== 'student-learn' && (
        <Footer
          onNavigate={(view) => setCurrentView(view)}
          onOpenAuthModal={() => {
            setAuthModalDefaultTab('login');
            setAuthModalOpen(true);
          }}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalDefaultTab}
      />

      {/* Programme Detail Modal */}
      {selectedProgramme && (
        <ProgrammeDetailModal
          programme={selectedProgramme}
          onClose={() => setSelectedProgramme(null)}
          onEnroll={handleEnrollInProgramme}
        />
      )}

      {/* Certificate Viewer / Printable Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl my-8">
            <CertificateTemplate
              certificate={selectedCertificate}
              onClose={() => setSelectedCertificate(null)}
            />
          </div>
        </div>
      )}

      {/* Transcript Viewer / Printable Modal */}
      {selectedTranscript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl my-8">
            <StudentTranscriptView
              transcript={selectedTranscript}
              onBack={() => setSelectedTranscript(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
