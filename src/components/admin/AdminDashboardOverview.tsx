import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Programme, Certificate, UserProfile } from '../../types';
import {
  Users,
  BookOpen,
  Layers,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  FileCheck,
  ExternalLink,
} from 'lucide-react';

interface AdminDashboardOverviewProps {
  onOpenStudio: () => void;
  onViewProgrammes: () => void;
  onViewStudents: () => void;
  onViewCertificates: () => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  onOpenStudio,
  onViewProgrammes,
  onViewStudents,
  onViewCertificates,
}) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeProgrammes: 0,
    publishedCourses: 0,
    certificatesIssued: 0,
  });
  const [recentCertificates, setRecentCertificates] = useState<Certificate[]>([]);
  const [recentProgrammes, setRecentProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [usersSnap, progSnap, coursesSnap, certsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'programmes')),
          getDocs(collection(db, 'courses')),
          getDocs(collection(db, 'certificates')),
        ]);

        const students = usersSnap.docs
          .map((d) => d.data() as UserProfile)
          .filter((u) => u.role !== 'admin');

        const progs = progSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Programme[];
        const certs = certsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Certificate[];

        setStats({
          totalStudents: students.length,
          activeProgrammes: progs.filter((p) => p.status === 'Published').length,
          publishedCourses: coursesSnap.size,
          certificatesIssued: certsSnap.size,
        });

        setRecentCertificates(certs.slice(0, 5));
        setRecentProgrammes(progs.slice(0, 5));
      } catch (err) {
        console.error('Error fetching admin overview stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Institutional Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            Executive Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="admin-quick-studio-btn"
            onClick={onOpenStudio}
            className="px-4 py-2 bg-[#0a192f] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span>Academic Production Studio</span>
          </button>
        </div>
      </div>

      {/* 4 Core Statistics Cards (Live Firestore calculation) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={onViewStudents}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 cursor-pointer transition-colors space-y-2"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Students</span>
            <Users className="w-4 h-4 text-blue-700" />
          </div>
          <p className="text-3xl font-serif font-bold text-slate-900">{stats.totalStudents}</p>
          <span className="text-[11px] text-slate-400">Enrolled learners in Firestore</span>
        </div>

        <div
          onClick={onViewProgrammes}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 cursor-pointer transition-colors space-y-2"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Active Programmes</span>
            <BookOpen className="w-4 h-4 text-blue-700" />
          </div>
          <p className="text-3xl font-serif font-bold text-slate-900">{stats.activeProgrammes}</p>
          <span className="text-[11px] text-slate-400">Published certificate syllabi</span>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Published Courses</span>
            <Layers className="w-4 h-4 text-blue-700" />
          </div>
          <p className="text-3xl font-serif font-bold text-slate-900">{stats.publishedCourses}</p>
          <span className="text-[11px] text-slate-400">Structured course units</span>
        </div>

        <div
          onClick={onViewCertificates}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 cursor-pointer transition-colors space-y-2"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Certificates Issued</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-serif font-bold text-slate-900">{stats.certificatesIssued}</p>
          <span className="text-[11px] text-slate-400">Verifiable credentials minted</span>
        </div>
      </div>

      {/* Quick Launchpad & Unified Production Studio Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-[#0a192f] text-white p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-mono uppercase tracking-wider text-blue-300 font-semibold">
            Canonically Unified Workflow
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold">
            Academic Production Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Create, assemble, and publish complete certificate programmes through a structured 5-step pipeline: Programme Info → Courses → Modules → Lessons → 14-Section Content → Publication Readiness.
          </p>
        </div>

        <button
          onClick={onOpenStudio}
          className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 shrink-0"
        >
          <span>Launch Production Studio</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Two Column Section: Recent Catalog & Recent Verified Certificates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Programmes */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-serif font-bold text-slate-900">
              Academic Programmes Catalog
            </h3>
            <button
              onClick={onViewProgrammes}
              className="text-xs text-blue-900 font-semibold hover:underline"
            >
              Manage All
            </button>
          </div>

          <div className="space-y-3">
            {recentProgrammes.map((prog) => (
              <div
                key={prog.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs"
              >
                <div>
                  <span className="font-mono text-[10px] text-slate-400 block">{prog.code}</span>
                  <p className="font-semibold text-slate-900">{prog.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      prog.status === 'Published'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {prog.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Certificates Issued */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-serif font-bold text-slate-900">
              Recently Minted Credentials
            </h3>
            <button
              onClick={onViewCertificates}
              className="text-xs text-blue-900 font-semibold hover:underline"
            >
              View Registry
            </button>
          </div>

          {recentCertificates.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No certificates have been issued yet. When learners complete programmes, they appear here.
            </p>
          ) : (
            <div className="space-y-3">
              {recentCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                >
                  <div>
                    <span className="font-mono text-[10px] text-slate-400 block">{cert.certificateNumber}</span>
                    <p className="font-semibold text-slate-900">{cert.studentName}</p>
                    <p className="text-[11px] text-slate-500 truncate max-w-xs">{cert.programmeName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-700 font-medium text-[11px] block">
                      {cert.status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
