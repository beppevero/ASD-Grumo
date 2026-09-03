import React, { useState } from 'react';
import { Download, Share, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-[#C8102E] hover:bg-[#A50A22] text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        title="Installa l'app ASD Grumo sul tuo smartphone o PC"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Installa App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/30 text-white px-2.5 py-1.5 text-xs font-medium transition cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Installa su iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-slate-800 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-[#0B4FBA]">
                    <Share className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Installa su iPhone / iPad
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0B4FBA] text-white font-bold text-[10px]">
                    1
                  </span>
                  <p>
                    Tocca il pulsante <strong className="text-slate-900">Condividi</strong> (icona quadrato con freccia in alto) nella barra inferiore di Safari.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0B4FBA] text-white font-bold text-[10px]">
                    2
                  </span>
                  <p>
                    Scorri le opzioni e tocca <strong className="text-slate-900">Aggiungi alla schermata Home</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0B4FBA] text-white font-bold text-[10px]">
                    3
                  </span>
                  <p>
                    Premi <strong>Aggiungi</strong> in alto a destra. L'icona ASD Grumo comparirà tra le tue app!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#0B4FBA] py-2.5 text-xs font-semibold text-white hover:bg-blue-800 transition"
              >
                Ho capito
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
