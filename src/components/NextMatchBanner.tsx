import React, { useState } from 'react';
import { Match } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Shield,
  Volleyball,
  Award,
  Sparkles,
} from 'lucide-react';

interface NextMatchBannerProps {
  matches: Match[];
}

export const NextMatchBanner: React.FC<NextMatchBannerProps> = ({ matches }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If no matches, display an informative banner with call to action
  if (!matches || matches.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold mb-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>Calendario Gare Ufficiali</span>
        </div>
        <h3 className="text-base font-bold text-slate-800">
          Nessuna partita programmata al momento
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          I prossimi match di campionato e le amichevoli verranno pubblicati a breve. Lo staff societario può inserire il calendario accedendo al pannello riservato.
        </p>
      </div>
    );
  }

  const activeIndex = Math.min(Math.max(0, currentIndex), matches.length - 1);
  const match = matches[activeIndex];

  const isHome = match.isHome;
  const isFinished = match.stato === 'CONCLUSA' || (match.risultato && match.risultato !== 'In programma' && match.risultato !== 'Da disputare');

  // Format date in Italian (e.g. "Domenica 8 Marzo 2026")
  const formatDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      if (!y || !m || !d) return dateStr;
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('it-IT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className={`rounded-2xl shadow-sm border transition-all overflow-hidden ${
        isHome
          ? 'bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 border-blue-800 text-white'
          : 'bg-gradient-to-r from-red-950 via-red-900 to-slate-900 border-red-800 text-white'
      }`}
    >
      {/* Top Tag & Navigation */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-3.5 pb-2.5 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-xs ${
              isHome
                ? 'bg-blue-500 text-white border border-blue-300/30'
                : 'bg-red-500 text-white border border-red-300/30'
            }`}
          >
            <Volleyball className="w-3 h-3 animate-spin-slow" />
            <span>{isHome ? 'Partita in Casa' : 'Fuori Casa'}</span>
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-white/80 bg-white/10 px-2 py-0.5 rounded-md font-medium">
            <Trophy className="w-3 h-3 text-amber-300" />
            <span>{match.categoria}</span>
          </span>
        </div>

        {/* Multiple Matches Slider Controls */}
        {matches.length > 1 && (
          <div className="flex items-center gap-1 text-[11px] text-white/70">
            <span>
              Gara {activeIndex + 1} di {matches.length}
            </span>
            <div className="flex items-center gap-0.5 ml-1">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : matches.length - 1))}
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Partita precedente"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev < matches.length - 1 ? prev + 1 : 0))}
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Partita successiva"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Match Body */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Team Casa */}
          <div className="md:col-span-4 text-center md:text-right">
            <div className="text-[11px] uppercase font-bold tracking-wider text-white/60 mb-0.5">
              Squadra di Casa
            </div>
            <div
              className={`text-lg sm:text-xl font-black tracking-tight ${
                isHome ? 'text-white' : 'text-white/90'
              }`}
            >
              {match.squadraCasa}
            </div>
            {isHome && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/40 text-[10px] font-bold">
                <Shield className="w-2.5 h-2.5" /> ASD Grumo (Casa)
              </span>
            )}
          </div>

          {/* VS & Result Display */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center py-2 px-4 rounded-xl bg-black/25 border border-white/10">
            {isFinished ? (
              <>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 flex items-center gap-1">
                  <Award className="w-3 h-3" /> Risultato Finale
                </span>
                <div className="text-2xl sm:text-3xl font-black tracking-wider text-white my-0.5">
                  {match.risultato}
                </div>
                {match.setScores && (
                  <div className="text-[11px] font-mono text-white/80 max-w-[220px] truncate">
                    Set: {match.setScores}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center font-black text-xs text-white/90 shadow-inner">
                  VS
                </div>
                <div className="mt-1 text-xs font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  <span>Ore {match.orario}</span>
                </div>
                <span className="text-[10px] font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.2 rounded-full mt-1">
                  {match.risultato || 'In programma'}
                </span>
              </>
            )}
          </div>

          {/* Team Ospite */}
          <div className="md:col-span-4 text-center md:text-left">
            <div className="text-[11px] uppercase font-bold tracking-wider text-white/60 mb-0.5">
              Squadra Ospite
            </div>
            <div
              className={`text-lg sm:text-xl font-black tracking-tight ${
                !isHome ? 'text-white' : 'text-white/90'
              }`}
            >
              {match.squadraOspite}
            </div>
            {!isHome && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-red-500/30 text-red-200 border border-red-400/40 text-[10px] font-bold">
                <Shield className="w-2.5 h-2.5" /> ASD Grumo (Fuori Casa)
              </span>
            )}
          </div>
        </div>

        {/* Date, Location & Notes Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-white/80">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-white/60" />
              <span className="font-semibold capitalize">{formatDate(match.data)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-white/60" />
              <span>
                <strong>{match.luogo}</strong>
                {match.indirizzo ? ` (${match.indirizzo})` : ''}
              </span>
            </div>
          </div>

          {match.note && (
            <div className="text-[11px] text-white/70 italic flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{match.note}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
