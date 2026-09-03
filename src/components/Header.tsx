import React from 'react';
import { LogoGrumo } from './LogoGrumo';
import { PWAInstallButton } from './PWAInstallButton';
import { LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import { StaffUser } from '../types';

interface HeaderProps {
  currentRole: 'ATHLETE' | 'STAFF' | null;
  athleteName?: string;
  staffUser?: StaffUser | null;
  onLogout: () => void;
  onOpenExportModal?: () => void;
  onResetData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  athleteName,
  staffUser,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm text-slate-900 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Brand Clickable */}
        <div
          onClick={onLogout}
          className="flex items-center gap-3 cursor-pointer group select-none"
          title="Torna alla schermata principale ASD Grumo"
        >
          <div className="relative shrink-0 transition-transform group-hover:scale-105">
            <LogoGrumo size={42} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xl sm:text-2xl tracking-tight leading-none text-blue-900">
                ASD GRUMO
              </span>
              <span className="hidden xs:inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-red-600 text-white tracking-widest">
                VOLLEY
              </span>
            </div>
            {currentRole && (
              <div className="text-xs font-medium text-slate-500 tracking-normal mt-0.5">
                {currentRole === 'STAFF' ? (
                  <span className="inline-flex items-center gap-1 text-red-600 font-bold truncate max-w-[280px] sm:max-w-md">
                    <ShieldCheck className="w-3.5 h-3.5 inline shrink-0" />
                    {staffUser ? (
                      <span className="truncate">
                        {staffUser.nome} {staffUser.cognome} • <span className="font-medium text-slate-600">({staffUser.ruolo})</span>
                      </span>
                    ) : (
                      'Dirigenza & Staff ASD Grumo'
                    )}
                  </span>
                ) : athleteName ? (
                  <span className="inline-flex items-center gap-1 text-blue-900 font-bold">
                    <UserCheck className="w-3.5 h-3.5 inline text-emerald-600 shrink-0" /> Scheda: {athleteName}
                  </span>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Logout / Switch User */}
          {currentRole && (
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Cambia Accesso</span>
              <span className="xs:hidden">Esci</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
