import React from 'react';
import { Certificate } from '../../types';
import { Printer, ShieldCheck, Download, Share2 } from 'lucide-react';

interface CertificateTemplateProps {
  certificate: Certificate;
  onClose?: () => void;
}

export const CertificateTemplate: React.FC<CertificateTemplateProps> = ({ certificate, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-3 px-6 rounded-lg print:hidden">
        <div className="flex items-center gap-2 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Official Verified Credential • {certificate.certificateNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs rounded transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* The Printable Certificate Container */}
      <div
        id="official-niu-certificate-document"
        className="relative bg-white text-slate-900 border-[10px] border-[#0a192f] p-8 sm:p-14 shadow-2xl rounded-sm max-w-4xl mx-auto overflow-hidden print:border-none print:shadow-none print:p-8"
        style={{ minHeight: '580px' }}
      >
        {/* Subtle Inner Academic Border Frame */}
        <div className="border border-slate-300 p-6 sm:p-10 relative flex flex-col justify-between h-full bg-slate-50/20">
          {/* Header & Crest */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-[#0a192f] text-white flex items-center justify-center font-serif text-3xl font-bold mx-auto border-2 border-amber-400/80 shadow-md">
              N
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 uppercase tracking-wider">
              Nova International University
            </h1>
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 font-medium">
              Academic Registry of Certificate Education
            </p>
          </div>

          {/* Certificate Body Text */}
          <div className="text-center my-8 space-y-4">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
              This is to officially certify that
            </p>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-950 underline decoration-slate-300 decoration-1 underline-offset-8">
              {certificate.studentName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed pt-2">
              has satisfactorily completed all academic syllabi, coursework modules, and competency evaluations required for the award of the
            </p>
            <div className="py-2">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-blue-950">
                {certificate.programmeName}
              </h3>
              <p className="text-xs font-mono font-medium text-slate-500 mt-1">
                Programme Code: {certificate.programmeCode} • {certificate.metadata?.totalHours || 40} Guided Study Hours
              </p>
            </div>
          </div>

          {/* Signatures & QR Verification */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-3 items-end gap-4 text-center">
            {/* Founder Signature */}
            <div className="space-y-1">
              <div className="h-10 flex items-center justify-center">
                <span className="font-serif italic font-bold text-xl sm:text-2xl text-slate-800 tracking-wide">
                  {certificate.founderSignature || 'akinssokpah'}
                </span>
              </div>
              <div className="border-t border-slate-400 w-36 mx-auto pt-1">
                <p className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider">akinssokpah</p>
                <p className="text-[9px] uppercase tracking-wider text-slate-500">Founder & President</p>
              </div>
            </div>

            {/* University Seal / Serial */}
            <div className="space-y-1">
              <div className="w-14 h-14 rounded-full border border-amber-600/60 bg-amber-50/50 flex items-center justify-center mx-auto text-[10px] uppercase font-bold text-amber-900 tracking-tighter text-center leading-tight">
                NIU<br />OFFICIAL<br />SEAL
              </div>
              <p className="text-[10px] font-mono text-slate-600 mt-1">
                Serial: {certificate.certificateNumber}
              </p>
              <p className="text-[9px] text-slate-400">
                Date: {new Date(certificate.issueDate).toLocaleDateString()}
              </p>
            </div>

            {/* QR Code */}
            <div className="space-y-1 flex flex-col items-center">
              {certificate.qrCodeDataUrl ? (
                <img
                  src={certificate.qrCodeDataUrl}
                  alt="Verification QR Code"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain border border-slate-200 p-0.5 rounded bg-white shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] text-slate-400">
                  QR Code
                </div>
              )}
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                Scan to Verify Status
              </p>
              <p className="text-[9px] font-mono text-slate-400">
                Code: {certificate.verificationCode}
              </p>
            </div>
          </div>

          {/* Institutional Scope Legal Notice */}
          <div className="mt-6 pt-3 border-t border-slate-200 text-center">
            <p className="text-[9px] text-slate-400 leading-tight">
              «NIU currently offers certificate programmes only. It does not represent degree enrollment, accreditation, or recognition unless independently authorized and published.»
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
