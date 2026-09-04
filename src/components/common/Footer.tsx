import React from 'react';
import { ShieldCheck, Mail, MapPin, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Institutional Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-white text-slate-950 flex items-center justify-center font-serif font-bold text-lg">
                N
              </div>
              <span className="font-serif font-bold text-white text-lg tracking-tight">
                Nova International University
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Nova International University (NIU) is a dedicated digital learning institution committed to structured, competency-aligned certificate education.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>academics@niu.ac.digital</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Global Cryptographic Verification Registry</span>
              </div>
            </div>
          </div>

          {/* Col 2: Academic Catalog */}
          <div>
            <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider mb-4">
              Academic Catalog
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('programmes')} className="hover:text-white transition-colors">
                  All Certificate Programmes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('schools')} className="hover:text-white transition-colors">
                  Schools & Academic Departments
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-white transition-colors">
                  How Online Learning Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('digital-library')} className="hover:text-white transition-colors">
                  Digital Library & Course Texts
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('academic-calendar')} className="hover:text-white transition-colors">
                  Academic Calendar & Term Dates
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Institutional Governance */}
          <div>
            <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider mb-4">
              Governance & Credibility
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  About the University
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('founder')} className="hover:text-white transition-colors">
                  Founder & President
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('mission')} className="hover:text-white transition-colors">
                  Mission, Vision & Core Values
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policies')} className="hover:text-white transition-colors">
                  Academic Honesty & Ethics Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('verify')} className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Public Certificate Verification
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Admissions & Support */}
          <div>
            <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider mb-4">
              Admissions & Support
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('admissions')} className="hover:text-white transition-colors">
                  Certificate Admission Guidelines
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('student-resources')} className="hover:text-white transition-colors">
                  Student Learning Resources
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  Contact Academic Registry
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Scope Legal Disclaimer Box */}
        <div className="mt-12 pt-8 border-t border-slate-800 text-center">
          <div className="max-w-4xl mx-auto p-4 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <p className="font-semibold text-amber-300 mb-1">
              Institutional Scope & Transparency Notice
            </p>
            <p>
              «NIU currently offers certificate programmes only. It does not represent degree enrollment, accreditation, or recognition unless independently authorized and published.»
            </p>
          </div>

          <p className="mt-6 text-[11px] text-slate-500">
            © {new Date().getFullYear()} Nova International University (NIU). All institutional rights reserved. Built with Firebase infrastructure and Google AI.
          </p>
        </div>
      </div>
    </footer>
  );
};
