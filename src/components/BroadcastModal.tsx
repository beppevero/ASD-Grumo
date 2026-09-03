import React, { useState } from 'react';
import { Athlete } from '../types';
import { X, Send, MessageCircle, Users } from 'lucide-react';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  athletes: Athlete[];
  onSendMessage: (targetType: 'ALL' | 'TEAM' | 'SINGLE', targetId: string, title: string, text: string, isUrgent: boolean) => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  athletes,
  onSendMessage,
}) => {
  const [targetType, setTargetType] = useState<'ALL' | 'TEAM' | 'SINGLE'>('TEAM');
  const [selectedTeam, setSelectedTeam] = useState<string>('Under 14 Femminile');
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(athletes[0]?.id || '');
  const [titolo, setTitolo] = useState<string>('Avviso Variazione Allenamento');
  const [testo, setTesto] = useState<string>('Gentili atleti e famiglie, l\'allenamento di questo venerdì è anticipato alle ore 16:30 al Palazzetto.');
  const [urgente, setUrgente] = useState<boolean>(false);

  if (!isOpen) return null;

  const teams = Array.from(new Set(athletes.map((a) => a.squadra)));

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titolo.trim() || !testo.trim()) {
      alert('Inserisci titolo e testo del messaggio.');
      return;
    }

    const targetId = targetType === 'TEAM' ? selectedTeam : targetType === 'SINGLE' ? selectedAthleteId : 'ALL';
    onSendMessage(targetType, targetId, titolo.trim(), testo.trim(), urgente);
    onClose();
  };

  const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-100">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Invia Comunicazione / Avviso
              </h2>
              <span className="text-xs text-slate-500">
                Invia una notifica in-app ad un singolo atleta o a tutta una squadra
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

        <form onSubmit={handleSend} className="space-y-3.5 text-xs">
          {/* Target Selector */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              Destinatari Comunicazione:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetType('TEAM')}
                className={`py-2 px-3 rounded-xl border text-center font-bold transition cursor-pointer ${
                  targetType === 'TEAM'
                    ? 'border-blue-900 bg-blue-50 text-blue-900 shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Tutta la Squadra
              </button>
              <button
                type="button"
                onClick={() => setTargetType('SINGLE')}
                className={`py-2 px-3 rounded-xl border text-center font-bold transition cursor-pointer ${
                  targetType === 'SINGLE'
                    ? 'border-blue-900 bg-blue-50 text-blue-900 shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Singolo Atleta
              </button>
              <button
                type="button"
                onClick={() => setTargetType('ALL')}
                className={`py-2 px-3 rounded-xl border text-center font-bold transition cursor-pointer ${
                  targetType === 'ALL'
                    ? 'border-blue-900 bg-blue-50 text-blue-900 shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Tutti gli Atleti
              </button>
            </div>
          </div>

          {targetType === 'TEAM' && (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Seleziona Squadra:
              </label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-900 focus:bg-white"
              >
                {teams.map((t) => (
                  <option key={t} value={t}>
                    {t} ({athletes.filter((a) => a.squadra === t).length} atleti)
                  </option>
                ))}
              </select>
            </div>
          )}

          {targetType === 'SINGLE' && (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Seleziona Atleta:
              </label>
              <select
                value={selectedAthleteId}
                onChange={(e) => setSelectedAthleteId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-900 focus:bg-white"
              >
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.cognome} {a.nome} ({a.squadra})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Templates */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Modelli Rapidi Precompilati:
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setTitolo('Promemoria Quota Iscrizione / Rinnovo');
                  setTesto(
                    'Gentile famiglia, vi ricordiamo il perfezionamento del pagamento della quota stagionale 2026/2027 per ASD Grumo. È possibile effettuare bonifico su IT60X0542811101000000123456 con causale "Quota Volley [Nome Atleta]". Potete caricare la distinta direttamente dalla vostra scheda atleta nell\'app.'
                  );
                  setUrgente(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold text-[11px] border border-blue-200 transition cursor-pointer"
              >
                💰 Quota / Rinnovo
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitolo('Sollecito Visita Medica Agonistica');
                  setTesto(
                    'Gentile genitore, il certificato medico agonistico per la pratica della pallavolo è in scadenza o scaduto. Senza certificato valido l\'atleta non può accedere agli allenamenti né alle gare per normative FIPAV/CONI. Vi invitiamo a rinnovarlo con urgenza.'
                  );
                  setUrgente(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-[11px] border border-red-200 transition cursor-pointer"
              >
                🩺 Certificato Medico
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitolo('Convocazione Ufficiale Prossima Partita');
                  setTesto(
                    'Convocazione gara ufficiale: ritrovo al Palazzetto 45 minuti prima del fischio di inizio muniti di divisa ufficiale da gioco e documento.'
                  );
                  setUrgente(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] border border-slate-200 transition cursor-pointer"
              >
                🏐 Convocazione Partita
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitolo('Variazione Orario Allenamento');
                  setTesto(
                    'Gentili atleti e famiglie, vi comunichiamo una variazione d\'orario per la seduta di allenamento di questa settimana.'
                  );
                  setUrgente(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] border border-slate-200 transition cursor-pointer"
              >
                ⏱️ Orario Allenamento
              </button>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Oggetto / Titolo Avviso:
            </label>
            <input
              type="text"
              required
              value={titolo}
              onChange={(e) => setTitolo(e.target.value)}
              placeholder="Es. Convocazione amichevole o Promemoria visita"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Testo del Messaggio:
            </label>
            <textarea
              rows={3}
              required
              value={testo}
              onChange={(e) => setTesto(e.target.value)}
              placeholder="Scrivi qui la comunicazione per le famiglie..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-900 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="urgente"
              checked={urgente}
              onChange={(e) => setUrgente(e.target.checked)}
              className="rounded text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <label htmlFor="urgente" className="font-semibold text-red-700 cursor-pointer">
              Contrassegna come URGENTE (evidenziato in rosso nell'app dell'atleta)
            </label>
          </div>

          {targetType === 'SINGLE' && selectedAthlete && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <span className="text-[11px] text-emerald-800">
                Vuoi inviarlo anche direttamente sul WhatsApp del genitore ({selectedAthlete.telefonoGenitore})?
              </span>
              <a
                href={`https://wa.me/39${selectedAthlete.telefonoGenitore.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `🏐 *ASD GRUMO VOLLEY - ${titolo.toUpperCase()}*\n\nGentile genitore di *${selectedAthlete.nome} ${selectedAthlete.cognome}*,\n\n${testo}\n\n*ASD Grumo*`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] transition shrink-0"
              >
                Invia WhatsApp
              </a>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Invia Notifica</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
