import React from 'react';
import { AlertCircle } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div id="niu-institutional-disclaimer-banner" className="bg-slate-900 text-slate-200 text-xs px-4 py-2 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <p className="font-normal text-slate-300">
          <strong className="text-amber-300 font-semibold uppercase tracking-wider text-[11px] mr-1.5">Official Academic Notice:</strong>
          NIU currently offers certificate programmes only. It does not represent degree enrollment, accreditation, or recognition unless independently authorized and published.
        </p>
      </div>
    </div>
  );
};
