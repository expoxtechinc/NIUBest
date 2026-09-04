import React, { useState, useEffect } from 'react';
import { Programme, School, Department } from '../../types';
import { fetchProgrammes, fetchSchools, fetchDepartments } from '../../lib/academicService';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  ArrowRight,
  GraduationCap,
  Award,
  Layers,
  ChevronRight,
  Compass,
  FileCheck,
  Library,
  Calendar,
  Sparkles,
  ExternalLink,
  HelpCircle,
  FileText,
  Mail,
  Building,
} from 'lucide-react';

interface PublicWebsiteProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: () => void;
  onSelectProgramme: (prog: Programme) => void;
}

export const PublicWebsite: React.FC<PublicWebsiteProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onSelectProgramme,
}) => {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [verifyInput, setVerifyInput] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [progData, schoolData, deptData] = await Promise.all([
          fetchProgrammes('Published'),
          fetchSchools(),
          fetchDepartments(),
        ]);
        setProgrammes(progData);
        setSchools(schoolData);
        setDepartments(deptData);
      } catch (err) {
        console.error('Error loading public catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProgrammes = programmes.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.departmentName && p.departmentName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
    return matchesSearch && matchesDiff;
  });

  // Render Sub-Views based on currentView
  if (currentView === 'about') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
        <div className="border-b border-slate-200 pb-8 mb-10">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Institutional Overview</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mt-2">About Nova International University</h1>
          <p className="text-base text-slate-600 mt-3 max-w-3xl">
            Nova International University (NIU) was established as a focused digital learning institution providing structured, verifiable certificate education.
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-slate-700 space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            Operating in an era of rapid technological and industrial transformation, NIU is dedicated to addressing specialized professional competencies. Unlike traditional legacy universities with prolonged multi-year residency models, NIU focuses strictly on rigorous, asynchronous, structured certificate programmes.
          </p>
          <div className="p-5 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-950">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Institutional Transparency Notice</h3>
            <p className="text-xs text-blue-800">
              NIU currently offers certificate programmes only. It does not represent degree enrollment, accreditation, or recognition unless independently authorized and published.
            </p>
          </div>
          <h2 className="text-xl font-serif font-bold text-slate-900 pt-4">Our Pedagogical Architecture</h2>
          <p>
            Every certificate curriculum at NIU adheres to an exhaustive hierarchy: from institutional schools down through departments, courses, structured modules, and individual learning content across 14 academic dimensions. Learners receive continuous formative evaluation, ensuring demonstrated mastery before any certificate is issued.
          </p>
        </div>
      </div>
    );
  }

  if (currentView === 'founder') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        <div className="border-b border-slate-200 pb-6 mb-8">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Leadership & Governance</span>
          <h1 className="text-3xl font-serif font-bold text-slate-900 mt-2">Founder & President</h1>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center font-serif text-2xl font-bold border-4 border-slate-100 shadow-sm shrink-0">
              AS
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-serif font-bold text-slate-900">akinssokpah</h2>
              <p className="text-xs uppercase tracking-wider text-blue-800 font-semibold">
                Founder & President • Nova International University
              </p>
              <p className="text-sm text-slate-600 leading-relaxed pt-2">
                Under the foundational leadership of akinssokpah, Nova International University was architected to eliminate administrative friction in professional education while enforcing rigorous academic standards. Every certificate issued by NIU bears the verifiable institutional signature of the Founder, backed by tamper-evident cryptographic verification records.
              </p>
              <div className="pt-4 border-t border-slate-100 flex items-center gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 block uppercase tracking-wider">Authorized Signature</span>
                  <span className="font-serif italic text-lg text-slate-800 tracking-wide font-semibold">
                    akinssokpah
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'mission') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 space-y-10">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Institutional Principles</span>
          <h1 className="text-3xl font-serif font-bold text-slate-900 mt-2">Mission, Vision & Core Values</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-serif font-bold text-slate-900">Our Mission</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To provide accessible, academically structured, and verifiable certificate education that bridges the gap between theoretical knowledge and real-world professional competency.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-serif font-bold text-slate-900">Our Vision</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To become a globally recognized digital model for modular higher learning, prioritizing absolute transparency, rigorous academic integrity, and digital credential validation.
            </p>
          </div>
        </div>

        <div className="p-8 rounded-xl border border-slate-200 bg-white shadow-sm space-y-4">
          <h2 className="text-lg font-serif font-bold text-slate-900">Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Academic Rigor</h3>
              <p className="text-xs text-slate-600 mt-1">
                Zero compromise on curriculum completeness and evaluated mastery.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Absolute Honesty</h3>
              <p className="text-xs text-slate-600 mt-1">
                Transparent claims regarding certificates, scope, and accreditation status.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Verifiable Trust</h3>
              <p className="text-xs text-slate-600 mt-1">
                Every credential is cryptographically verifiable online by employers worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'schools') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 space-y-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Academic Governance</span>
          <h1 className="text-3xl font-serif font-bold text-slate-900 mt-2">Schools & Departments</h1>
          <p className="text-sm text-slate-600 mt-2">
            NIU organizes all curricula through authorized schools and academic departments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schools.map((s) => (
            <div key={s.id} className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded">
                  {s.code}
                </span>
                <span className="text-xs text-slate-500">{s.dean}</span>
              </div>
              <h2 className="text-lg font-serif font-bold text-slate-900">{s.name}</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{s.description}</p>

              <div>
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Academic Departments
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {departments
                    .filter((d) => d.schoolId === s.id)
                    .map((dept) => (
                      <li key={dept.id} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                        <span className="font-medium text-slate-900">{dept.name}</span>
                        <span className="text-slate-400">({dept.code})</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentView === 'how-it-works') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 space-y-10">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Learner Journey</span>
          <h1 className="text-3xl font-serif font-bold text-slate-900 mt-2">How Online Learning Works</h1>
          <p className="text-sm text-slate-600 mt-2">
            Structured, asynchronous learning designed for deep conceptual retention and measurable outcomes.
          </p>
        </div>

        <div className="space-y-6">
          {[
            {
              step: '01',
              title: 'Choose a Certificate Programme',
              desc: 'Review published curriculum details, prerequisite knowledge, and learning outcomes in our catalog.',
            },
            {
              step: '02',
              title: 'Enroll & Access Structured Lessons',
              desc: 'Learn through our 14-section academic content framework, including key concepts, case studies, and activities.',
            },
            {
              step: '03',
              title: 'Complete Rigorous Assessments',
              desc: 'Verify understanding with timed quizzes and examinations pulled from vetted academic question banks.',
            },
            {
              step: '04',
              title: 'Earn & Verify Your Certificate',
              desc: 'Once all requirements are satisfied, our system automatically generates your digital credential with a secure QR code.',
            },
          ].map((item) => (
            <div key={item.step} className="p-6 rounded-xl border border-slate-200 bg-white flex items-start gap-5 shadow-sm">
              <span className="font-serif text-3xl font-bold text-slate-300 shrink-0">{item.step}</span>
              <div>
                <h2 className="text-base font-serif font-bold text-slate-900">{item.title}</h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentView === 'digital-library') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 space-y-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Academic Repositories</span>
          <h1 className="text-3xl font-serif font-bold text-slate-900 mt-2">NIU Digital Library</h1>
          <p className="text-sm text-slate-600 mt-2">
            Open-access curated monographs, research briefs, and core readings accompanying our certificate syllabi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="p-5 rounded-lg border border-slate-200 bg-white space-y-2">
            <span className="text-[11px] font-mono font-semibold text-blue-700 uppercase">Computing & Cyber</span>
            <h2 className="text-sm font-bold text-slate-900">NIST SP 800-207: Zero Trust Architecture Compendium</h2>
            <p className="text-xs text-slate-600">Standard guidance on perimeterless network defense and PDP/PEP governance.</p>
          </div>
          <div className="p-5 rounded-lg border border-slate-200 bg-white space-y-2">
            <span className="text-[11px] font-mono font-semibold text-blue-700 uppercase">Energy Systems</span>
            <h2 className="text-sm font-bold text-slate-900">Modern Power Electronics in Decarbonized Grids</h2>
            <p className="text-xs text-slate-600">Technical formulations for distributed battery energy storage systems.</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'academic-calendar') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 space-y-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Academic Schedule</span>
          <h1 className="text-3xl font-serif font-bold text-slate-900 mt-2">Academic Calendar</h1>
          <p className="text-sm text-slate-600 mt-2">
            Because NIU operates on asynchronous digital modules, certificate admissions are rolling with continuous assessment cycles.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="py-3 px-4 font-semibold">Session / Event</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Schedule Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="py-3 px-4 font-medium text-slate-900">Rolling Certificate Enrollment</td>
                <td className="py-3 px-4 text-emerald-700 font-medium">Open Year-Round</td>
                <td className="py-3 px-4">Instant enrollment upon registration</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-900">Academic Production Studio Refresh</td>
                <td className="py-3 px-4 text-blue-700 font-medium">Quarterly</td>
                <td className="py-3 px-4">New modules published following human review</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-900">Credential Verification Sync</td>
                <td className="py-3 px-4 text-slate-700 font-medium">Continuous Real-Time</td>
                <td className="py-3 px-4">Automated Firebase Firestore syncing</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (currentView === 'faq') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 space-y-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Student Inquiries</span>
          <h1 className="text-3xl font-serif font-bold text-slate-900 mt-2">Frequently Asked Questions</h1>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Does NIU offer degree programmes like Bachelors or Masters?',
              a: 'No. NIU currently offers certificate programmes only. It does not represent degree enrollment, accreditation, or recognition unless independently authorized and published.',
            },
            {
              q: 'How are certificates verified by third parties or employers?',
              a: 'Every completed certificate generates a unique certificate number, verification code, and cryptographically linked QR code directing to our public /verify registry.',
            },
            {
              q: 'What are the completion requirements for a certificate?',
              a: 'Students must complete 100% of required lessons, complete all associated course assessments, and attain or exceed the stated minimum score (typically 70% or 75%).',
            },
            {
              q: 'Is there a deadline to complete enrolled courses?',
              a: 'Programmes are self-paced, allowing students to balance professional responsibilities with continuous academic progress.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-lg border border-slate-200 bg-white space-y-1.5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">{item.q}</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentView === 'policies') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 space-y-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Institutional Governance</span>
          <h1 className="text-3xl font-serif font-bold text-slate-900 mt-2">Academic Policies & Code of Conduct</h1>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="p-5 rounded-lg border border-slate-200 bg-white space-y-2">
            <h2 className="text-sm font-bold text-slate-900">1. Academic Integrity & Honest Submission</h2>
            <p>
              Students must independently complete all assessment questions and practical tasks. Any evidence of automated proxy submission or collaborative collusion on individual examinations results in immediate forfeiture of certificate eligibility.
            </p>
          </div>
          <div className="p-5 rounded-lg border border-slate-200 bg-white space-y-2">
            <h2 className="text-sm font-bold text-slate-900">2. Certificate Validity & Revocation Policy</h2>
            <p>
              NIU reserves the right to revoke issued certificates if fraudulent submissions or unauthorized grade manipulation are discovered during post-issuance audits. Revoked certificates immediately display status: Revoked in the public verification ledger.
            </p>
          </div>
          <div className="p-5 rounded-lg border border-slate-200 bg-white space-y-2">
            <h2 className="text-sm font-bold text-slate-900">3. Non-Degree and Scope Clarification</h2>
            <p>
              «NIU currently offers certificate programmes only. It does not represent degree enrollment, accreditation, or recognition unless independently authorized and published.»
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'contact') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 space-y-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Support & Registry</span>
          <h1 className="text-3xl font-serif font-bold text-slate-900 mt-2">Contact Academic Registry</h1>
          <p className="text-sm text-slate-600 mt-2">
            For academic inquiries, verification assistance, or learner support.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm space-y-4 text-xs sm:text-sm">
          <div className="flex items-center gap-3 text-slate-800">
            <Mail className="w-4 h-4 text-blue-800" />
            <span className="font-semibold">Email:</span> academics@niu.ac.digital
          </div>
          <div className="flex items-center gap-3 text-slate-800">
            <Building className="w-4 h-4 text-blue-800" />
            <span className="font-semibold">Academic Registry:</span> Nova International University Digital Campus
          </div>
          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
            Official responses are typically provided within 1-2 business days.
          </div>
        </div>
      </div>
    );
  }

  // Certificate Programmes Catalog View
  if (currentView === 'programmes') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8 mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Academic Catalog</span>
            <h1 className="text-3xl font-serif font-bold text-slate-900 mt-1">Certificate Programmes</h1>
            <p className="text-sm text-slate-600 mt-1">
              Explore structured, competency-oriented curricula available for immediate enrollment.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search programmes..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              aria-label="Filter programmes by difficulty"
              className="w-full sm:w-auto py-2 px-3 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-900"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-slate-500">Loading catalog from Firestore...</div>
        ) : filteredProgrammes.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-xl border border-slate-200 p-8">
            <GraduationCap className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No matching programmes found</h3>
            <p className="text-xs text-slate-500 mt-1">Try refining your search terms or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProgrammes.map((prog) => (
              <div
                key={prog.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="h-44 bg-slate-100 relative overflow-hidden">
                  <img
                    src={prog.imageUrl}
                    alt={prog.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-[#0a192f]/90 text-white text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                    {prog.code}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 text-slate-800 text-[11px] font-medium px-2 py-0.5 rounded shadow-xs">
                    {prog.difficulty}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-blue-800 font-semibold block mb-1">
                      {prog.departmentName || 'Academic Department'}
                    </span>
                    <h2 className="text-base font-serif font-bold text-slate-900 leading-snug">
                      {prog.name}
                    </h2>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {prog.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{prog.learningHours} Study Hours</span>
                    </div>

                    <button
                      id={`view-prog-${prog.id}`}
                      onClick={() => onSelectProgramme(prog)}
                      className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1"
                    >
                      View Programme <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // DEFAULT VIEW: Professional University Homepage
  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-b from-slate-100/70 to-slate-50 border-b border-slate-200 pt-12 pb-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-700" />
              <span>Structured Certificate Higher Education</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-slate-950 tracking-tight leading-[1.1]">
              Structured Learning. <br className="hidden sm:inline" />
              <span className="text-blue-950">Verifiable Achievement.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
              NIU provides accessible certificate education through structured online learning.
              Master specialized professional competencies and earn tamper-evident digital credentials.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-explore-btn"
                onClick={() => onNavigate('programmes')}
                className="px-6 py-3 bg-[#0a192f] hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <span>Explore Programmes</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-verify-btn"
                onClick={() => onNavigate('verify')}
                className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-lg border border-slate-300 shadow-xs transition-colors flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verify Certificate</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 pt-1">
              Certificate programmes only • Asynchronous study • 100% online
            </p>
          </div>
        </div>
      </section>

      {/* 2. WHAT NIU OFFERS (3 Simple Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
            The NIU Academic Model
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Built from the ground up for measurable competency, pedagogical clarity, and verified achievement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-900">Structured Learning</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Learn through organized programmes built across 14 academic dimensions, ensuring theory seamlessly integrates with practical case studies.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-900">Flexible Access</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Learn from anywhere. Enjoy complete asynchronous pacing with persistent cloud progress synchronization across your desktop and mobile devices.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-900">Verifiable Credentials</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Verify completed certificates online instantly. Every certificate includes tamper-evident QR codes and unique serial codes stored in Firestore.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROGRAMMES (3-6 items) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Featured Curricula</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
              Active Certificate Programmes
            </h2>
          </div>
          <button
            onClick={() => onNavigate('programmes')}
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1"
          >
            View All ({programmes.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programmes.slice(0, 3).map((prog) => (
            <div
              key={prog.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="h-44 bg-slate-100 relative overflow-hidden">
                <img
                  src={prog.imageUrl}
                  alt={prog.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-[#0a192f]/90 text-white text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                  {prog.code}
                </div>
                <div className="absolute top-3 right-3 bg-white/95 text-slate-800 text-[11px] font-medium px-2 py-0.5 rounded shadow-xs">
                  {prog.difficulty}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-blue-800 font-semibold block mb-1">
                    {prog.departmentName || 'Academic Department'}
                  </span>
                  <h3 className="text-base font-serif font-bold text-slate-900 leading-snug">
                    {prog.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {prog.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{prog.learningHours} Hours</span>
                  </div>

                  <button
                    onClick={() => onSelectProgramme(prog)}
                    className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1"
                  >
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HOW LEARNING WORKS (Four Steps) */}
      <section className="bg-slate-100/60 border-y border-slate-200 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Structured Progress</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
              How Learning Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Four clear steps from enrollment to verifiable certificate issuance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: '01',
                title: 'Choose a Programme',
                desc: 'Select from specialized certificates in computing, cybersecurity, energy, and infrastructure.',
              },
              {
                num: '02',
                title: 'Enroll and Learn',
                desc: 'Engage with structured modules, comprehensive readings, and practical application notes.',
              },
              {
                num: '03',
                title: 'Complete Assessments',
                desc: 'Demonstrate subject-matter mastery through timed quizzes, examinations, and projects.',
              },
              {
                num: '04',
                title: 'Earn a Verifiable Certificate',
                desc: 'Receive an institutional credential authenticated by Founder akinssokpah with QR verification.',
              },
            ].map((step) => (
              <div key={step.num} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <span className="font-serif text-3xl font-bold text-slate-300 block">{step.num}</span>
                <h3 className="text-base font-serif font-bold text-slate-900">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CERTIFICATE VERIFICATION CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-[#0a192f] text-white rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-md border border-slate-800">
          <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
              Certificate Verification
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Already have a certificate? Verify its authenticity instantly against the official Nova International University registry.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <input
              type="text"
              value={verifyInput}
              onChange={(e) => setVerifyInput(e.target.value)}
              placeholder="Enter Certificate ID or Code"
              className="w-full px-4 py-2.5 rounded-lg text-xs bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              id="cta-verify-btn"
              onClick={() => onNavigate('verify', { lookupId: verifyInput })}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              Verify Certificate
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
