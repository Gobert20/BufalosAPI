import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer role="contentinfo" className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600/30 text-blue-400 flex items-center justify-center" aria-hidden="true">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-slate-300">
              Búfalos Táctico &copy; {new Date().getFullYear()} &mdash; Sistema de Gestión y Catálogo
            </p>
          </div>
          <div className="text-xs text-slate-400 space-y-1">
            <p>Diseñado bajo estándares de accesibilidad WCAG 2.2 nivel AA</p>
            <p>Seguridad de extremo a extremo &bull; OWASP API Security &amp; Web Top 10</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
