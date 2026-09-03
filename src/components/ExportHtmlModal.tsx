import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode, ExternalLink } from 'lucide-react';

interface ExportHtmlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportHtmlModal: React.FC<ExportHtmlModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await fetch('/asd-grumo-standalone.html');
      const htmlText = await res.text();

      const blob = new Blob([htmlText], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'asd-grumo-volley.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading HTML file:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      const res = await fetch('/asd-grumo-standalone.html');
      const htmlText = await res.text();
      await navigator.clipboard.writeText(htmlText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Error copying HTML:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-100">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Esporta Prototipo Singolo File (.html)
              </h2>
              <span className="text-xs text-slate-500">
                HTML + Tailwind CSS CDN + JavaScript Vanilla autonomo
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            Come richiesto, abbiamo generato il <strong>file HTML singolo standalone</strong> al 100% funzionante:
          </p>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Nessuna dipendenza o installazione richiesta</span>
            </div>
            <p className="text-slate-600">
              Funziona facendo doppio click sul file salvato su qualsiasi PC, tablet o smartphone.
              Include logo SVG incorporato, Tailwind CSS via CDN, persistenza locale via <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-blue-900 font-mono text-[11px]">localStorage</code> e link WhatsApp automatici.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 bg-blue-900 hover:bg-blue-800 text-white py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Scaricamento...' : 'Scarica File .HTML (1 click)'}</span>
            </button>

            <button
              onClick={handleCopyCode}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer border border-slate-200 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copiato negli Appunti!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copia Codice HTML</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-1 text-center">
            <a
              href="/asd-grumo-standalone.html"
              target="_blank"
              rel="noreferrer"
              className="text-blue-900 hover:underline font-semibold inline-flex items-center gap-1 text-[11px]"
            >
              <span>Apri direttamente in una nuova scheda</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
