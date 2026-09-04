import React, { useState } from 'react';
import { Athlete } from '../types';
import {
  getCertificateStatus,
  ASD_GRUMO_IBAN,
  ASD_GRUMO_BENEFICIARIO,
  generateAthleteToStaffWhatsAppUrl,
} from '../utils/storage';
import {
  Calendar,
  Clock,
  MapPin,
  Check,
  X,
  AlertTriangle,
  Upload,
  MessageCircle,
  FileCheck,
  CheckCircle2,
  XCircle,
  CreditCard,
  Bell,
  Send,
  ChevronLeft,
  Info,
  ShieldAlert,
  Copy,
  Receipt,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface AthleteViewProps {
  athlete: Athlete;
  onUpdateAthlete: (updated: Athlete) => void;
  onBack: () => void;
}

export const AthleteView: React.FC<AthleteViewProps> = ({
  athlete,
  onUpdateAthlete,
  onBack,
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [absenceReason, setAbsenceReason] = useState('');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState(false);

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(
    Math.max(0, athlete.quotaTotale - athlete.quotaVersata) > 0
      ? (athlete.quotaTotale - athlete.quotaVersata).toString()
      : athlete.quotaTotale.toString()
  );
  const [paymentMethod, setPaymentMethod] = useState<'Bonifico Bancario' | 'Contanti' | 'POS / Carta'>('Bonifico Bancario');
  const [paymentCro, setPaymentCro] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [copiedIban, setCopiedIban] = useState(false);
  const [copiedCausale, setCopiedCausale] = useState(false);

  const certStatus = getCertificateStatus(athlete.scadenzaCertificato);

  const defaultCausale = `Quota ${athlete.tipoPratica === 'NUOVA_ISCRIZIONE' ? 'Iscrizione' : 'Rinnovo'} ${athlete.nome} ${athlete.cognome} ${athlete.squadra}`;

  const handleCopyIban = () => {
    navigator.clipboard.writeText(ASD_GRUMO_IBAN);
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2500);
  };

  const handleCopyCausale = () => {
    navigator.clipboard.writeText(defaultCausale);
    setCopiedCausale(true);
    setTimeout(() => setCopiedCausale(false), 2500);
  };

  const handleSimulatedPaymentUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(paymentAmount) || Math.max(0, athlete.quotaTotale - athlete.quotaVersata);
    const nuovaQuotaVersata = Math.min(athlete.quotaTotale, athlete.quotaVersata + amountNum);
    const saldoCompletato = nuovaQuotaVersata >= athlete.quotaTotale;

    const updatedAthlete: Athlete = {
      ...athlete,
      quotaVersata: nuovaQuotaVersata,
      statoQuota: saldoCompletato ? 'REGOLARE' : 'SECONDA_RATA_ATTESA',
      statoPagamento: saldoCompletato ? 'SALDATO' : 'ACCONTO_VERSATO',
      ricevutaPagamento: {
        caricata: true,
        dataCaricamento: new Date().toISOString().split('T')[0],
        importo: amountNum,
        metodo: paymentMethod,
        croTrn: paymentCro.trim() || undefined,
        note: paymentNotes.trim() || undefined,
        nomeFile: `ricevuta_${paymentMethod.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`,
        verificata: false,
      },
      messaggiPersonali: [
        {
          id: `msg-${Date.now()}`,
          data: new Date().toLocaleDateString('it-IT'),
          titolo: 'Ricevuta Pagamento Inviata',
          testo: `Abbiamo registrato l'invio della ricevuta per €${amountNum} (${paymentMethod}). La segreteria ASD Grumo effettuerà la verifica contabile a breve.`,
          letto: false,
          mittente: 'Segreteria Amministrativa ASD Grumo',
        },
        ...athlete.messaggiPersonali,
      ],
    };

    onUpdateAthlete(updatedAthlete);
    setShowPaymentModal(false);
    setPaymentSuccessMessage(true);
    setTimeout(() => setPaymentSuccessMessage(false), 6000);
  };

  const handleResponseConvocazione = (
    risposta: 'CONFERMATO' | 'ASSENTE',
    motivo?: string
  ) => {
    if (!athlete.prossimaConvocazione) return;

    const updatedAthlete: Athlete = {
      ...athlete,
      prossimaConvocazione: {
        ...athlete.prossimaConvocazione,
        risposta,
        motivoAssenza: motivo,
        dataRisposta: new Date().toISOString().split('T')[0],
      },
    };
    onUpdateAthlete(updatedAthlete);
    setShowAbsenceModal(false);
  };

  const handleSimulatedUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedAthlete: Athlete = {
      ...athlete,
      certificatoCaricato: true,
      certificatoFileName: `certificato_${athlete.cognome.toLowerCase()}_rinnovo_2026.pdf`,
      messaggiPersonali: [
        {
          id: `msg-${Date.now()}`,
          data: new Date().toLocaleDateString('it-IT'),
          titolo: 'Ricevuta copia certificato medico',
          testo: `Hai caricato una nuova copia del certificato medico. La segreteria verificherà il timbro e la validità a breve.`,
          letto: false,
          mittente: 'Sistema ASD Grumo',
        },
        ...athlete.messaggiPersonali,
      ],
    };
    onUpdateAthlete(updatedAthlete);
    setShowUploadModal(false);
    setUploadSuccessMessage(true);
    setTimeout(() => setUploadSuccessMessage(false), 5000);
  };

  const markMessageAsRead = (messageId: string) => {
    const updatedAthlete: Athlete = {
      ...athlete,
      messaggiPersonali: athlete.messaggiPersonali.map((m) =>
        m.id === messageId ? { ...m, letto: true } : m
      ),
    };
    onUpdateAthlete(updatedAthlete);
  };

  const formattedCertDate = new Date(athlete.scadenzaCertificato).toLocaleDateString(
    'it-IT',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs rounded-xl px-3 py-2.5 min-h-[44px] transition cursor-pointer active:scale-95"
        >
          <ChevronLeft className="w-4 h-4 text-blue-900" />
          <span>Torna alla Selezione Atleti</span>
        </button>

        <span className="text-[11px] text-slate-500 font-medium">
          Ultimo aggiornamento: oggi
        </span>
      </div>

      {/* Hero Profile Card */}
      <div className="bg-blue-900 rounded-2xl p-5 sm:p-6 text-white shadow-sm border border-blue-950 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />

        <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xs flex items-center justify-center font-display font-bold text-2xl sm:text-3xl text-white shadow-inner">
              #{athlete.numeroMaglia || '🏐'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                  {athlete.squadra}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-800/80 border border-blue-600/50 text-blue-100 text-[10px] font-bold">
                  {athlete.tipoPratica === 'NUOVA_ISCRIZIONE' ? (
                    <>
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Nuova Iscrizione 26/27</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 text-blue-200" />
                      <span>Rinnovo Tesseramento 26/27</span>
                    </>
                  )}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
                {athlete.nome} {athlete.cognome}
              </h1>
              <div className="text-xs text-blue-100 flex flex-wrap items-center gap-y-1 gap-x-3 mt-1">
                <span>Ruolo: <strong>{athlete.ruolo || 'Atleta'}</strong></span>
                <span>•</span>
                <span>CF: <strong className="font-mono">{athlete.codiceFiscale}</strong></span>
              </div>
            </div>
          </div>

          <div className="text-right sm:self-center">
            <div className="text-[11px] text-blue-200">Referente / Genitore:</div>
            <div className="text-xs sm:text-sm font-semibold text-white">
              {athlete.nomeGenitore}
            </div>
            <div className="text-[11px] text-blue-200 font-mono">
              Tel: {athlete.telefonoGenitore}
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {uploadSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            Nuovo certificato caricato con successo! La segreteria ASD Grumo provvederà alla convalida.
          </div>
        </div>
      )}

      {/* Payment Success Alert */}
      {paymentSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              Ricevuta di pagamento registrata con successo! Inviata alla segreteria ASD Grumo per la convalida.
            </div>
          </div>
          <a
            href={generateAthleteToStaffWhatsAppUrl(athlete, 'RICEVUTA_PAGAMENTO', {
              importo: athlete.ricevutaPagamento?.importo,
              metodo: athlete.ricevutaPagamento?.metodo,
              croTrn: athlete.ricevutaPagamento?.croTrn,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Invia anche su WhatsApp Segreteria</span>
          </a>
        </div>
      )}

      {/* ========================================================= */}
      {/* SEZIONE 1: CERTIFICATO MEDICO AGONISTICO */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-100">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Certificato Medico Sportivo
              </h2>
              <span className="text-xs text-slate-500">
                Tipologia: {athlete.tipoCertificato || 'Agonistico B1 - Pallavolo'}
              </span>
            </div>
          </div>

          {/* BADGE DI STATO DINAMICO */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${certStatus.badgeBg} ${certStatus.badgeText} ${certStatus.badgeBorder}`}
          >
            {certStatus.status === 'VALID' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : certStatus.status === 'EXPIRING' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600 animate-pulse" />
            )}
            <span>{certStatus.label}</span>
          </div>
        </div>

        {/* STATUS BANNER & ATTENZIONE BLOCCO */}
        {certStatus.status === 'EXPIRED' ? (
          <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 text-red-900 mb-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-red-600 text-white shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="font-extrabold text-sm sm:text-base text-red-800">
                  ATTIVITÀ SPORTIVA BLOCCATA
                </div>
                <p className="text-xs text-red-700 leading-relaxed">
                  Il certificato medico per {athlete.nome} è <strong>SCADUTO</strong> il <strong>{formattedCertDate}</strong>.
                  In base alle disposizioni FIPAV e alle normative di legge sulla tutela sanitaria,
                  <strong> l'atleta non è autorizzato a disputare partite né ad allenarsi</strong> fino alla consegna del rinnovo.
                </p>
              </div>
            </div>
          </div>
        ) : certStatus.status === 'EXPIRING' ? (
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-amber-900 mb-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-sm text-amber-900">
                  Certificato in Scadenza tra {certStatus.daysRemaining} {certStatus.daysRemaining === 1 ? 'giorno' : 'giorni'}
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Scadenza fissata al <strong>{formattedCertDate}</strong>. Consigliamo di prenotare subito la visita di rinnovo
                  per non rischiare il blocco della partecipazione alle gare ufficiali.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-emerald-900 mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div className="text-xs text-emerald-800">
                Idoneità agonistica in regola. Scadenza: <strong>{formattedCertDate}</strong> (rimangono ancora <strong>{certStatus.daysRemaining} giorni</strong>).
              </div>
            </div>
          </div>
        )}

        {/* GUIDA AL RINNOVO E CONSEGNA */}
        <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-900" />
            <span>Istruzioni Consegna & Rinnovo</span>
          </h3>

          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              Per rinnovare l'idoneità, prenota la visita medico-sportiva con prova sotto sforzo (specificate: <em>"Pallavolo B1 Agonistico"</em>)
              presso un centro medico dello sport accreditato o ASL.
            </p>
            <p className="font-medium text-slate-700">
              Una volta ottenuto il certificato originale, puoi consegnarlo in uno dei seguenti modi:
            </p>
            <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
                <span className="font-bold text-blue-900 block mb-1">1. Consegna Digitale Immediata</span>
                Scatta una foto chiara o carica il PDF direttamente qui sotto, oppure inviala via WhatsApp alla segreteria.
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
                <span className="font-bold text-red-600 block mb-1">2. Consegna a Mano in Palestra</span>
                Consegna la copia cartacea al dirigente di squadra o al Palazzetto Comunale prima degli allenamenti.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Carica Foto / PDF Certificato</span>
            </button>

            <a
              href={`https://wa.me/393331234567?text=${encodeURIComponent(
                `Buongiorno ASD Grumo, invio aggiornamento/foto per il certificato medico di ${athlete.nome} ${athlete.cognome} (${athlete.squadra}).`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Invia alla Segreteria via WhatsApp</span>
            </a>
          </div>

          {athlete.certificatoCaricato && (
            <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>File presente in archivio: <em>{athlete.certificatoFileName || 'certificato.pdf'}</em></span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SEZIONE 2: MESSAGGI E AVVISI PERSONALI */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Messaggi & Avvisi Personali
              </h2>
              <span className="text-xs text-slate-500">
                Comunicazioni individuali inviate dalla società ad {athlete.nome}
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {athlete.messaggiPersonali.length} {athlete.messaggiPersonali.length === 1 ? 'messaggio' : 'messaggi'}
          </span>
        </div>

        {athlete.messaggiPersonali.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
            Nessuna nuova comunicazione da parte della società.
          </div>
        ) : (
          <div className="space-y-3">
            {athlete.messaggiPersonali.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-xl border transition ${
                  msg.urgente
                    ? 'border-red-200 bg-red-50/40'
                    : msg.letto
                    ? 'border-slate-200 bg-white'
                    : 'border-blue-200 bg-blue-50/30'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-2">
                    {msg.urgente && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-red-600 text-white">
                        Urgente
                      </span>
                    )}
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {msg.titolo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{msg.data}</span>
                    <span>• {msg.mittente || 'ASD Grumo'}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-2">
                  {msg.testo}
                </p>

                <div className="flex items-center justify-end">
                  {!msg.letto ? (
                    <button
                      onClick={() => markMessageAsRead(msg.id)}
                      className="text-[11px] font-semibold text-blue-900 hover:underline cursor-pointer"
                    >
                      Segna come letto ✓
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">Letto ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SEZIONE 3: CONVOCAZIONI E PROSSIMI EVENTI */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Prossima Convocazione
              </h2>
              <span className="text-xs text-slate-500">
                Partita o allenamento programmato per la squadra
              </span>
            </div>
          </div>
        </div>

        {!athlete.prossimaConvocazione ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
            Nessuna convocazione attiva al momento. Controlla nei prossimi giorni.
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-blue-900 text-white tracking-wider">
                {athlete.prossimaConvocazione.tipo}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Squadra: {athlete.squadra}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {athlete.prossimaConvocazione.titolo}
            </h3>

            {/* Event Details Grid */}
            <div className="grid sm:grid-cols-3 gap-3 text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-900 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400">Data Evento</div>
                  <div className="font-semibold">{athlete.prossimaConvocazione.data}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400">Orari</div>
                  <div className="font-semibold">
                    Ritrovo: {athlete.prossimaConvocazione.orarioRitrovo} (Inizio: {athlete.prossimaConvocazione.orarioInizio})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:col-span-1">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400">Impianto</div>
                  <div className="font-semibold truncate" title={athlete.prossimaConvocazione.luogo}>
                    {athlete.prossimaConvocazione.luogo}
                  </div>
                </div>
              </div>
            </div>

            {athlete.prossimaConvocazione.note && (
              <div className="text-xs text-slate-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <strong>Note Tecniche:</strong> {athlete.prossimaConvocazione.note}
              </div>
            )}

            {/* Interactive Response Controls */}
            <div className="pt-2 border-t border-slate-200">
              <div className="text-xs font-bold text-slate-800 mb-2.5">
                Conferma Presenza Atleta:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleResponseConvocazione('CONFERMATO')}
                  className={`w-full min-h-[48px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 ${
                    athlete.prossimaConvocazione.risposta === 'CONFERMATO'
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-600 ring-offset-1'
                      : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300'
                  }`}
                >
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Confermo Presenza</span>
                </button>

                <button
                  onClick={() => setShowAbsenceModal(true)}
                  className={`w-full min-h-[48px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 ${
                    athlete.prossimaConvocazione.risposta === 'ASSENTE'
                      ? 'bg-red-600 text-white ring-2 ring-red-600 ring-offset-1'
                      : 'bg-white hover:bg-red-50 text-red-700 border border-red-300'
                  }`}
                >
                  <X className="w-4 h-4 shrink-0" />
                  <span>Segnala Assenza</span>
                </button>
              </div>

              {athlete.prossimaConvocazione.risposta && (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-100 text-xs text-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Stato risposta attuale:</span>
                    <span
                      className={`font-bold ${
                        athlete.prossimaConvocazione.risposta === 'CONFERMATO'
                          ? 'text-emerald-700'
                          : 'text-red-600'
                      }`}
                    >
                      {athlete.prossimaConvocazione.risposta === 'CONFERMATO'
                        ? '✓ Presente'
                        : '✗ Assente'}
                    </span>
                    {athlete.prossimaConvocazione.motivoAssenza && (
                      <span className="text-slate-500 italic">
                        ("{athlete.prossimaConvocazione.motivoAssenza}")
                      </span>
                    )}
                  </div>
                  {athlete.prossimaConvocazione.dataRisposta && (
                    <span className="text-[10px] text-slate-400">
                      Confermato il {athlete.prossimaConvocazione.dataRisposta}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SEZIONE 4: ISCRIZIONE / RINNOVO & STATO PAGAMENTI */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  {athlete.tipoPratica === 'NUOVA_ISCRIZIONE' ? 'Nuova Iscrizione' : 'Rinnovo Stagionale'} & Quota
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200">
                  2026/2027
                </span>
              </div>
              <span className="text-xs text-slate-500">
                Gestione versamenti, scadenze rate e ricevute contabili ASD Grumo
              </span>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
              athlete.statoQuota === 'REGOLARE'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : athlete.ricevutaPagamento?.caricata && !athlete.ricevutaPagamento.verificata
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : athlete.statoQuota === 'SECONDA_RATA_ATTESA'
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-red-50 text-red-800 border-red-300'
            }`}
          >
            {athlete.statoQuota === 'REGOLARE' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Saldo Quota Regolare</span>
              </>
            ) : athlete.ricevutaPagamento?.caricata && !athlete.ricevutaPagamento.verificata ? (
              <>
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Ricevuta in Verifica</span>
              </>
            ) : athlete.statoQuota === 'SECONDA_RATA_ATTESA' ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Seconda Rata in Attesa</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Quota da Saldare</span>
              </>
            )}
          </span>
        </div>

        {/* 3 Metric cards for Quota */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Quota Complessiva
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              €{athlete.quotaTotale}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Include kit e assicurazione FIPAV
            </div>
          </div>

          <div className="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-200">
            <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
              Versato Registrato
            </div>
            <div className="text-xl font-bold text-emerald-700 mt-1">
              €{athlete.quotaVersata}
            </div>
            <div className="text-[10px] text-emerald-600 mt-0.5">
              Incassato da Segreteria
            </div>
          </div>

          <div className={`rounded-xl p-3.5 border ${
            athlete.quotaTotale - athlete.quotaVersata > 0
              ? 'bg-red-50/40 border-red-200 text-red-900'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className="text-[11px] font-semibold uppercase tracking-wider">
              Residuo da Saldare
            </div>
            <div className={`text-xl font-bold mt-1 ${
              athlete.quotaTotale - athlete.quotaVersata > 0 ? 'text-red-600' : 'text-emerald-700'
            }`}>
              €{Math.max(0, athlete.quotaTotale - athlete.quotaVersata)}
            </div>
            <div className="text-[10px] opacity-75 mt-0.5">
              {athlete.quotaTotale - athlete.quotaVersata > 0 ? 'Pagamento aperto' : 'Tesseramento a saldo zero'}
            </div>
          </div>
        </div>

        {/* Ricevuta di Pagamento Caricata Alert */}
        {athlete.ricevutaPagamento?.caricata && (
          <div className={`p-4 rounded-xl border mb-4 text-xs ${
            athlete.ricevutaPagamento.verificata
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-blue-50/70 border-blue-200 text-blue-900'
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <Receipt className="w-5 h-5 shrink-0 mt-0.5 text-blue-900" />
                <div>
                  <div className="font-bold text-sm">
                    {athlete.ricevutaPagamento.verificata
                      ? '✓ Pagamento Confermato e Registrato'
                      : 'Distinta di Pagamento Trasmessa (In Verifica)'}
                  </div>
                  <div className="text-xs opacity-90 mt-0.5">
                    Importo versato: <strong>€{athlete.ricevutaPagamento.importo}</strong> via {athlete.ricevutaPagamento.metodo} il {athlete.ricevutaPagamento.dataCaricamento}
                  </div>
                  {athlete.ricevutaPagamento.croTrn && (
                    <div className="font-mono text-[11px] mt-1 text-slate-700">
                      Rif. CRO/TRN: {athlete.ricevutaPagamento.croTrn}
                    </div>
                  )}
                  {athlete.ricevutaPagamento.note && (
                    <div className="text-[11px] italic text-slate-600 mt-1">
                      Note: "{athlete.ricevutaPagamento.note}"
                    </div>
                  )}
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                athlete.ricevutaPagamento.verificata
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}>
                {athlete.ricevutaPagamento.verificata ? 'CONVALIDATO' : 'IN ATTESA SEGRETERIA'}
              </span>
            </div>
          </div>
        )}

        {/* Coordinate Bancarie ASD Grumo */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-700 space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>Coordinate Bancarie ASD Grumo Volley</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Bonifico Bancario SEPA</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-semibold mb-1">BENEFICIARIO</div>
              <div className="font-bold text-slate-900 text-xs">{ASD_GRUMO_BENEFICIARIO}</div>
              <div className="text-[10px] text-slate-400 font-semibold mt-2 mb-1">IBAN UFFICIALE</div>
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono font-bold text-slate-900 text-xs tracking-wider select-all">
                  {ASD_GRUMO_IBAN}
                </span>
                <button
                  type="button"
                  onClick={handleCopyIban}
                  className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-900 transition cursor-pointer"
                  title="Copia IBAN"
                >
                  {copiedIban ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-semibold mb-1">CAUSALE BONIFICO CONSIGLIATA</div>
              <div className="text-xs text-slate-800 font-medium leading-relaxed select-all">
                {defaultCausale}
              </div>
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={handleCopyCausale}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-900 hover:text-blue-700 cursor-pointer"
                >
                  {copiedCausale ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Causale Copiata!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copia Causale</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons for Payments */}
        <div className="flex flex-wrap gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => {
              setPaymentAmount(
                Math.max(0, athlete.quotaTotale - athlete.quotaVersata) > 0
                  ? (athlete.quotaTotale - athlete.quotaVersata).toString()
                  : athlete.quotaTotale.toString()
              );
              setShowPaymentModal(true);
            }}
            className="flex-1 min-w-[200px] py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Carica Ricevuta / Distinta di Pagamento</span>
          </button>

          <a
            href={generateAthleteToStaffWhatsAppUrl(athlete, 'RICEVUTA_PAGAMENTO', {
              importo: Math.max(0, athlete.quotaTotale - athlete.quotaVersata),
              metodo: 'Bonifico Bancario',
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[200px] py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Notifica Bonifico via WhatsApp alla Segreteria</span>
          </a>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODALE 1: SIMULAZIONE CARICAMENTO FILE CERTIFICATO */}
      {/* ========================================================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Carica Certificato Medico
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Seleziona la scansione o una foto nitida del certificato medico per <strong>{athlete.nome} {athlete.cognome}</strong>.
            </p>

            <form onSubmit={handleSimulatedUpload} className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-900 transition cursor-pointer bg-slate-50">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-700">
                  Trascina qui il file o clicca per sfogliare
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Formati accettati: PDF, JPG, PNG (Max 5MB)
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="opacity-0 absolute inset-0 cursor-pointer"
                  onChange={() => {}}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition shadow-sm cursor-pointer"
                >
                  Invia alla Segreteria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALE 2: CARICAMENTO RICEVUTA PAGAMENTO / RINNOVO */}
      {/* ========================================================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Carica Ricevuta Pagamento
                  </h3>
                  <span className="text-xs text-slate-500">
                    {athlete.tipoPratica === 'NUOVA_ISCRIZIONE' ? 'Nuova Iscrizione' : 'Rinnovo'} - {athlete.nome} {athlete.cognome}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimulatedPaymentUpload} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Importo Versato (€) *
                  </label>
                  <input
                    type="number"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 outline-none focus:border-blue-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Metodo di Pagamento *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium outline-none focus:border-blue-900 focus:bg-white"
                  >
                    <option value="Bonifico Bancario">Bonifico Bancario</option>
                    <option value="Contanti">Contanti in Segreteria</option>
                    <option value="POS / Carta">POS / Carta di Debito</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Codice Riferimento CRO / TRN (facoltativo per bonifico)
                </label>
                <input
                  type="text"
                  value={paymentCro}
                  onChange={(e) => setPaymentCro(e.target.value)}
                  placeholder="Es. TRN 0101010101010101"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono uppercase outline-none focus:border-blue-900 focus:bg-white"
                />
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Allega Scansione o Screenshot Contabile
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-emerald-600 transition cursor-pointer bg-slate-50">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <div className="text-xs font-bold text-slate-700">
                    Trascina qui la contabile PDF o immagine
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Ricevute supportate: PDF, JPG, PNG
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Note per la Segreteria
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Es. Saldo quota intera effettuato da conto intestato al padre"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-900 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm cursor-pointer active:scale-95"
                >
                  Invia Ricevuta alla Segreteria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALE 3: MOTIVO ASSENZA */}
      {/* ========================================================= */}
      {showAbsenceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Segnala Assenza Convocazione
              </h3>
              <button
                onClick={() => setShowAbsenceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Indica la motivazione dell'assenza per lo staff tecnico di <strong>{athlete.squadra}</strong>:
            </p>

            <div className="space-y-2">
              {[
                'Impegno scolastico / Studio',
                'Malattia o febbre',
                'Infortunio muscolare/articolare',
                'Impegno familiare o lavoro',
                'Certificato medico in attesa di rinnovo',
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setAbsenceReason(reason)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                    absenceReason === reason
                      ? 'border-red-500 bg-red-50 text-red-800 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {reason}
                </button>
              ))}

              <input
                type="text"
                placeholder="Altra motivazione specifica..."
                value={absenceReason}
                onChange={(e) => setAbsenceReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-red-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAbsenceModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => handleResponseConvocazione('ASSENTE', absenceReason || 'Non specificato')}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-sm cursor-pointer"
              >
                Conferma Assenza
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
