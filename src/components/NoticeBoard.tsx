import React, { useState } from 'react';
import { Notice } from '../types';
import {
  Bell,
  Pin,
  Calendar,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Sparkles,
  Volleyball,
  Clock,
} from 'lucide-react';

interface NoticeBoardProps {
  notices: Notice[];
  onOpenStaff?: () => void;
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({ notices, onOpenStaff }) => {
  const [expanded, setExpanded] = useState(false);

  if (!notices || notices.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2">
          <Bell className="w-3.5 h-3.5 text-slate-500" />
          <span>Bacheca Avvisi & Comunicazioni</span>
        </div>
        <h3 className="text-sm font-bold text-slate-800">
          Nessuna nuova comunicazione pubblicata
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Gli avvisi della dirigenza e dello staff tecnico verranno visualizzati in questa sezione.
        </p>
      </div>
    );
  }

  // Sort notices: pinned first, then by date descending
  const sortedNotices = [...notices].sort((a, b) => {
    if (a.pin && !b.pin) return -1;
    if (!a.pin && b.pin) return 1;
    return new Date(b.data).getTime() - new Date(a.data).getTime();
  });

  const displayNotices = expanded ? sortedNotices : sortedNotices.slice(0, 2);

  const getCategoryStyle = (categoria: Notice['categoria']) => {
    switch (categoria) {
      case 'IMPORTANTE':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          icon: <AlertTriangle className="w-3 h-3 text-red-600" />,
          label: 'Importante',
        };
      case 'GARE':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <Volleyball className="w-3 h-3 text-amber-600" />,
          label: 'Gare & Partite',
        };
      case 'ALLENAMENTI':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          icon: <Clock className="w-3 h-3 text-blue-600" />,
          label: 'Allenamenti',
        };
      case 'EVENTI':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          icon: <Sparkles className="w-3 h-3 text-purple-600" />,
          label: 'Eventi Societari',
        };
      case 'COMUNICAZIONE':
      default:
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: <Info className="w-3 h-3 text-slate-600" />,
          label: 'Comunicazione',
        };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      if (!y || !m || !d) return dateStr;
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-4 sm:px-6 py-3 border-b border-slate-800 text-white flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-amber-300">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight text-white uppercase">
                Bacheca Avvisi & News
              </h3>
              <span className="bg-blue-600/60 text-blue-100 border border-blue-400/30 text-[10px] font-bold px-2 py-0.2 rounded-full">
                {notices.length} {notices.length === 1 ? 'comunicazione' : 'comunicazioni'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Comunicazioni e aggiornamenti ufficiali a cura di Dirigenza e Staff
            </p>
          </div>
        </div>

        {onOpenStaff && (
          <button
            type="button"
            onClick={onOpenStaff}
            className="text-[11px] font-semibold text-blue-200 hover:text-white bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded-lg border border-white/15 transition cursor-pointer flex items-center gap-1.5"
            title="Accedi come Dirigenza/Staff per inserire un avviso"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gestione Staff</span>
          </button>
        )}
      </div>

      {/* Notices List */}
      <div className="p-4 sm:p-5 divide-y divide-slate-100 space-y-4 sm:space-y-0">
        {displayNotices.map((notice, idx) => {
          const categoryStyle = getCategoryStyle(notice.categoria);
          return (
            <div
              key={notice.id}
              className={`${
                idx > 0 ? 'sm:pt-4' : ''
              } pb-4 last:pb-0 transition-all rounded-xl ${
                notice.pin ? 'bg-amber-50/40 sm:p-3 sm:mb-2 border border-amber-200/60' : ''
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {notice.pin && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider">
                      <Pin className="w-3 h-3 text-amber-700 fill-amber-700" />
                      In Evidenza
                    </span>
                  )}

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${categoryStyle.bg}`}
                  >
                    {categoryStyle.icon}
                    <span>{categoryStyle.label}</span>
                  </span>

                  {notice.autore && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      Da: <strong className="text-slate-700">{notice.autore}</strong>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{formatDate(notice.data)}</span>
                  {notice.orario && <span>• {notice.orario}</span>}
                </div>
              </div>

              {/* Title & Body */}
              <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight mb-1">
                {notice.titolo}
              </h4>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed whitespace-pre-line">
                {notice.contenuto}
              </p>
            </div>
          );
        })}
      </div>

      {/* Expand/Collapse footer if more than 2 notices */}
      {sortedNotices.length > 2 && (
        <div className="bg-slate-50 border-t border-slate-100 px-4 py-2.5 text-center">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-bold text-blue-900 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer transition"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Mostra meno comunicazioni</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Mostra tutte le comunicazioni ({sortedNotices.length})</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
