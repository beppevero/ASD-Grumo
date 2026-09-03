import React, { useState } from 'react';
import { Athlete, TipoPratica } from '../types';
import { X, UserPlus, Calendar, CreditCard, Sparkles, RefreshCw } from 'lucide-react';

interface AddAthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (athlete: Athlete) => void;
}

const TEAMS = [
  'Minivolley S3',
  'Under 14 Femminile',
  'Under 16 Maschile',
  'Under 18 Maschile',
  'Under 18 Femminile',
  'Prima Squadra Serie D',
];

export const AddAthleteModal: React.FC<AddAthleteModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [tipoPratica, setTipoPratica] = useState<TipoPratica>('RINNOVO_STAGIONALE');
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [codiceFiscale, setCodiceFiscale] = useState('');
  const [squadra, setSquadra] = useState(TEAMS[0]);
  const [ruolo, setRuolo] = useState('Schiacciatore');
  const [numeroMaglia, setNumeroMaglia] = useState('');
  const [dataNascita, setDataNascita] = useState('2010-01-01');
  const [scadenzaCertificato, setScadenzaCertificato] = useState('2027-09-01');
  const [tipoCertificato, setTipoCertificato] = useState<'Agonistico B1' | 'Non Agonistico'>('Agonistico B1');
  const [nomeGenitore, setNomeGenitore] = useState('');
  const [telefonoGenitore, setTelefonoGenitore] = useState('');
  const [emailGenitore, setEmailGenitore] = useState('');
  const [quotaTotale, setQuotaTotale] = useState('320');
  const [quotaVersata, setQuotaVersata] = useState('0');
  const [metodoPagamento, setMetodoPagamento] = useState<'Bonifico Bancario' | 'Contanti' | 'POS / Carta'>('Bonifico Bancario');
  const [password, setPassword] = useState('1234');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !cognome.trim() || !scadenzaCertificato) {
      alert('Compila i campi obbligatori (Nome, Cognome e Data Scadenza Certificato).');
      return;
    }

    const totale = parseFloat(quotaTotale) || 300;
    const versata = parseFloat(quotaVersata) || 0;

    const newAthlete: Athlete = {
      id: `grumo-${Date.now()}`,
      nome: nome.trim(),
      cognome: cognome.trim(),
      codiceFiscale: codiceFiscale.trim().toUpperCase() || 'ND',
      dataNascita,
      squadra,
      ruolo,
      numeroMaglia: numeroMaglia ? parseInt(numeroMaglia, 10) : Math.floor(Math.random() * 20) + 1,
      scadenzaCertificato,
      tipoCertificato,
      certificatoCaricato: false,
      nomeGenitore: nomeGenitore.trim() || `${nome.trim()} ${cognome.trim()}`,
      telefonoGenitore: telefonoGenitore.trim() || '3331234567',
      emailGenitore: emailGenitore.trim() || 'info@famiglia.it',
      password: password.trim() || '1234',
      tipoPratica,
      stagioneSportiva: '2026/2027',
      quotaTotale: totale,
      quotaVersata: versata,
      statoQuota:
        versata >= totale
          ? 'REGOLARE'
          : versata > 0
          ? 'SECONDA_RATA_ATTESA'
          : 'IN_SOSPESO',
      statoPagamento:
        versata >= totale
          ? 'SALDATO'
          : versata > 0
          ? 'ACCONTO_VERSATO'
          : 'DA_SALDARE',
      ricevutaPagamento:
        versata > 0
          ? {
              caricata: true,
              dataCaricamento: new Date().toISOString().split('T')[0],
              importo: versata,
              metodo: metodoPagamento,
              verificata: true,
              note: `Registrato da Segreteria all'inserimento`,
            }
          : undefined,
      messaggiPersonali: [
        {
          id: `msg-${Date.now()}`,
          data: new Date().toLocaleDateString('it-IT'),
          titolo: tipoPratica === 'NUOVA_ISCRIZIONE' ? 'Benvenuto in ASD Grumo Volley!' : 'Rinnovo Tesseramento 2026/2027',
          testo: `Registrazione completata per la squadra ${squadra} - Stagione Sportiva 2026/2027.`,
          letto: false,
          mittente: 'Segreteria ASD Grumo',
        },
      ],
      prossimaConvocazione: {
        id: `conv-${Date.now()}`,
        titolo: `Primo Allenamento di Stagione: ${squadra}`,
        tipo: 'ALLENAMENTO',
        data: '2026-09-07',
        orarioRitrovo: '16:45',
        orarioInizio: '17:00',
        luogo: 'Palasport Comunale di Grumo Appula',
        note: 'Presentarsi con kit da allenamento.',
        risposta: 'IN_ATTESA',
      },
    };

    onAdd(newAthlete);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-100">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Nuova Anagrafica & Tesseramento
              </h2>
              <span className="text-xs text-slate-500">
                Registra nuova iscrizione o rinnovo per la stagione sportiva
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Tipologia Pratica: Rinnovo vs Nuova Iscrizione */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              Tipologia Pratica *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTipoPratica('RINNOVO_STAGIONALE');
                  if (quotaTotale === '350') setQuotaTotale('320');
                }}
                className={`py-2.5 px-3 rounded-xl border text-center font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  tipoPratica === 'RINNOVO_STAGIONALE'
                    ? 'border-blue-900 bg-blue-50 text-blue-900 shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rinnovo Stagionale</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTipoPratica('NUOVA_ISCRIZIONE');
                  if (quotaTotale === '320') setQuotaTotale('350');
                }}
                className={`py-2.5 px-3 rounded-xl border text-center font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  tipoPratica === 'NUOVA_ISCRIZIONE'
                    ? 'border-blue-900 bg-blue-50 text-blue-900 shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                <span>Nuova Iscrizione</span>
              </button>
            </div>
          </div>

          {/* Anagrafica Base */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Nome Atleta *
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Es. Marco"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Cognome Atleta *
              </label>
              <input
                type="text"
                required
                value={cognome}
                onChange={(e) => setCognome(e.target.value)}
                placeholder="Es. Rossi"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Codice Fiscale
              </label>
              <input
                type="text"
                value={codiceFiscale}
                onChange={(e) => setCodiceFiscale(e.target.value)}
                placeholder="RSSMRC08L14A662X"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 uppercase font-mono outline-none focus:border-blue-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Data di Nascita
              </label>
              <input
                type="date"
                value={dataNascita}
                onChange={(e) => setDataNascita(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-900 focus:bg-white font-mono"
              />
            </div>
          </div>

          {/* Dati Sportivi & Squadra */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                Squadra / Categoria *
              </label>
              <select
                value={squadra}
                onChange={(e) => setSquadra(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium outline-none focus:border-blue-900 focus:bg-white"
              >
                {TEAMS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                N° Maglia
              </label>
              <input
                type="number"
                min={1}
                max={99}
                value={numeroMaglia}
                onChange={(e) => setNumeroMaglia(e.target.value)}
                placeholder="Es. 7"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono outline-none focus:border-blue-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Sezione Certificato Medico */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-blue-900 font-bold">
                <Calendar className="w-4 h-4" /> Idoneità e Certificato Medico
              </span>
              <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">
                Controllo FIPAV
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Data Scadenza Certificato *
                </label>
                <input
                  type="date"
                  required
                  value={scadenzaCertificato}
                  onChange={(e) => setScadenzaCertificato(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-900 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tipo Visita
                </label>
                <select
                  value={tipoCertificato}
                  onChange={(e) => setTipoCertificato(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-900"
                >
                  <option value="Agonistico B1">Agonistico B1 (Pallavolo FIPAV)</option>
                  <option value="Non Agonistico">Non Agonistico (Minivolley S3)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Genitore e Contatti WhatsApp */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Nome Genitore / Referente
              </label>
              <input
                type="text"
                value={nomeGenitore}
                onChange={(e) => setNomeGenitore(e.target.value)}
                placeholder="Es. Giovanni Rossi"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Cellulare WhatsApp (senza +39) *
              </label>
              <input
                type="tel"
                required
                value={telefonoGenitore}
                onChange={(e) => setTelefonoGenitore(e.target.value)}
                placeholder="Es. 3331234567"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono outline-none focus:border-blue-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Password / PIN per Accesso Riservato Atleta */}
          <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-center justify-between gap-3">
            <div className="text-xs">
              <label className="font-bold text-blue-950 block">
                Password / PIN Personale Atleta (Privacy & GDPR)
              </label>
              <span className="text-[11px] text-slate-500">
                La famiglia userà questo PIN per accedere alla propria scheda personale.
              </span>
            </div>
            <div className="w-36 shrink-0">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="es. 1234"
                className="w-full bg-white border border-blue-200 rounded-xl px-3 py-1.5 font-mono text-center font-bold text-blue-900 outline-none focus:border-blue-900 text-xs"
              />
            </div>
          </div>

          {/* Quota e Pagamento Iscrizione/Rinnovo */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-800">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Quota {tipoPratica === 'NUOVA_ISCRIZIONE' ? 'Nuova Iscrizione' : 'Rinnovo Stagionale'}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Stagione 2026/2027</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Quota Totale (€)
                </label>
                <input
                  type="number"
                  value={quotaTotale}
                  onChange={(e) => setQuotaTotale(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-900 font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Versato Subito (€)
                </label>
                <input
                  type="number"
                  value={quotaVersata}
                  onChange={(e) => setQuotaVersata(e.target.value)}
                  placeholder="0 se da saldare"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-900 font-bold text-emerald-700"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Metodo di Pagamento
                </label>
                <select
                  value={metodoPagamento}
                  onChange={(e) => setMetodoPagamento(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-900 font-medium"
                >
                  <option value="Bonifico Bancario">Bonifico Bancario</option>
                  <option value="Contanti">Contanti in Segreteria</option>
                  <option value="POS / Carta">POS / Carta di Debito</option>
                </select>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
              <span>
                Residuo da saldare: <strong className={parseFloat(quotaTotale) - parseFloat(quotaVersata || '0') > 0 ? 'text-red-600' : 'text-emerald-700'}>
                  €{Math.max(0, (parseFloat(quotaTotale) || 0) - (parseFloat(quotaVersata) || 0))}
                </strong>
              </span>
              <span className="text-slate-400">
                {parseFloat(quotaVersata) >= parseFloat(quotaTotale) ? 'Saldo Immediato' : parseFloat(quotaVersata) > 0 ? 'Acconto / 1ª Rata' : 'Da Saldare in seguito'}
              </span>
            </div>
          </div>

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
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition shadow-sm cursor-pointer active:scale-95"
            >
              Salva Atleta in Anagrafica
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
