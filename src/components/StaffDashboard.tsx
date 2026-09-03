import React, { useState } from 'react';
import { Athlete, StaffUser, StaffRole, Match } from '../types';
import {
  getCertificateStatus,
  generateWhatsAppUrl,
  getStoredStaffUsers,
  registerStaffUser,
} from '../utils/storage';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  UserPlus,
  MessageCircle,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Filter,
  Check,
  X,
  Phone,
  ArrowUpDown,
  CreditCard,
  Receipt,
  Sparkles,
  RefreshCw,
  Banknote,
  CheckCheck,
  Clock,
  KeyRound,
  Mail,
  ShieldCheck,
  Lock,
  Copy,
  Trophy,
  MapPin,
  Volleyball,
  Award,
} from 'lucide-react';

interface StaffDashboardProps {
  athletes: Athlete[];
  matches: Match[];
  onAddMatch: (match: Omit<Match, 'id'>) => void;
  onUpdateMatch: (match: Match) => void;
  onDeleteMatch: (id: string) => void;
  onUpdateAthlete: (updated: Athlete) => void;
  onDeleteAthlete: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenBroadcastModal: () => void;
  onSelectAthleteForView: (athleteId: string) => void;
  currentStaffUser?: StaffUser | null;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  athletes,
  matches,
  onAddMatch,
  onUpdateMatch,
  onDeleteMatch,
  onUpdateAthlete,
  onDeleteAthlete,
  onOpenAddModal,
  onOpenBroadcastModal,
  onSelectAthleteForView,
  currentStaffUser,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'EXPIRED' | 'EXPIRING' | 'VALID'>('ALL');
  const [teamFilter, setTeamFilter] = useState<string>('ALL');
  const [tipoPraticaFilter, setTipoPraticaFilter] = useState<'ALL' | 'NUOVA_ISCRIZIONE' | 'RINNOVO'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'DA_SALDARE' | 'RICEVUTE_ATTESA' | 'SALDATO'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingCertAthleteId, setEditingCertAthleteId] = useState<string | null>(null);
  const [newCertDate, setNewCertDate] = useState<string>('');
  const [editingQuotaAthleteId, setEditingQuotaAthleteId] = useState<string | null>(null);
  const [newQuotaVersata, setNewQuotaVersata] = useState<string>('');

  // Staff Account Management
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(() => getStoredStaffUsers());
  const [showStaffModal, setShowStaffModal] = useState<boolean>(false);
  const [showAddStaffForm, setShowAddStaffForm] = useState<boolean>(false);
  const [newStaffNome, setNewStaffNome] = useState('');
  const [newStaffCognome, setNewStaffCognome] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRuolo, setNewStaffRuolo] = useState<StaffRole>('Dirigente');
  const [newStaffTelefono, setNewStaffTelefono] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [staffModalError, setStaffModalError] = useState('');
  const [staffModalSuccess, setStaffModalSuccess] = useState('');

  // Athlete PIN Management
  const [editingPinAthleteId, setEditingPinAthleteId] = useState<string | null>(null);
  const [newAthletePin, setNewAthletePin] = useState<string>('');
  const [copiedPinAthleteId, setCopiedPinAthleteId] = useState<string | null>(null);

  const handleSaveAthletePin = (athlete: Athlete) => {
    if (!newAthletePin.trim()) return;
    const updated: Athlete = {
      ...athlete,
      password: newAthletePin.trim(),
    };
    onUpdateAthlete(updated);
    setEditingPinAthleteId(null);
    setNewAthletePin('');
  };

  const handleCreateStaffFromModal = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffModalError('');
    setStaffModalSuccess('');

    if (!newStaffNome.trim() || !newStaffCognome.trim()) {
      setStaffModalError('Inserisci nome e cognome del dirigente/staff.');
      return;
    }
    if (!newStaffEmail.trim() || !newStaffEmail.includes('@')) {
      setStaffModalError('Inserisci un indirizzo email valido.');
      return;
    }
    if (newStaffPassword.length < 4) {
      setStaffModalError('La password deve avere almeno 4 caratteri.');
      return;
    }

    const res = registerStaffUser({
      nome: newStaffNome,
      cognome: newStaffCognome,
      email: newStaffEmail,
      ruolo: newStaffRuolo,
      telefono: newStaffTelefono,
      password: newStaffPassword,
    });

    if (!res.success) {
      setStaffModalError(res.error || 'Errore durante la registrazione dello staff.');
      return;
    }

    setStaffUsers(getStoredStaffUsers());
    setStaffModalSuccess(`Account registrato per ${newStaffNome} ${newStaffCognome}!`);
    setNewStaffNome('');
    setNewStaffCognome('');
    setNewStaffEmail('');
    setNewStaffTelefono('');
    setNewStaffPassword('');
    setShowAddStaffForm(false);
  };

  // Match Management State
  const [showMatchesModal, setShowMatchesModal] = useState(false);
  const [showAddMatchForm, setShowAddMatchForm] = useState(false);
  const [newMatchIsHome, setNewMatchIsHome] = useState(true);
  const [newMatchSquadraCasa, setNewMatchSquadraCasa] = useState('ASD Grumo Volley');
  const [newMatchSquadraOspite, setNewMatchSquadraOspite] = useState('');
  const [newMatchCategoria, setNewMatchCategoria] = useState('Serie D Femminile');
  const [newMatchData, setNewMatchData] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [newMatchOrario, setNewMatchOrario] = useState('18:30');
  const [newMatchLuogo, setNewMatchLuogo] = useState('PalaSport Comunale - Grumo Appula');
  const [newMatchIndirizzo, setNewMatchIndirizzo] = useState('Via Sannicandro, Grumo Appula (BA)');
  const [newMatchRisultato, setNewMatchRisultato] = useState('In programma');
  const [newMatchNote, setNewMatchNote] = useState('');
  const [matchFormError, setMatchFormError] = useState('');
  const [matchFormSuccess, setMatchFormSuccess] = useState('');

  // Quick Score Edit State
  const [editingScoreMatchId, setEditingScoreMatchId] = useState<string | null>(null);
  const [editScoreValue, setEditScoreValue] = useState('');
  const [editSetScoresValue, setEditSetScoresValue] = useState('');
  const [editMatchStato, setEditMatchStato] = useState<'PROGRAMMATA' | 'IN_CORSO' | 'CONCLUSA'>('CONCLUSA');

  const handleToggleMatchLocationType = (isHome: boolean) => {
    setNewMatchIsHome(isHome);
    if (isHome) {
      setNewMatchSquadraCasa('ASD Grumo Volley');
      if (newMatchSquadraOspite === 'ASD Grumo Volley') setNewMatchSquadraOspite('');
      setNewMatchLuogo('PalaSport Comunale - Grumo Appula');
      setNewMatchIndirizzo('Via Sannicandro, Grumo Appula (BA)');
    } else {
      setNewMatchSquadraOspite('ASD Grumo Volley');
      if (newMatchSquadraCasa === 'ASD Grumo Volley') setNewMatchSquadraCasa('');
      setNewMatchLuogo('');
      setNewMatchIndirizzo('');
    }
  };

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    setMatchFormError('');
    setMatchFormSuccess('');

    if (!newMatchSquadraCasa.trim() || !newMatchSquadraOspite.trim()) {
      setMatchFormError('Indica entrambe le squadre (Casa e Ospite).');
      return;
    }
    if (!newMatchData.trim() || !newMatchOrario.trim()) {
      setMatchFormError('Indica data e orario della partita.');
      return;
    }
    if (!newMatchLuogo.trim()) {
      setMatchFormError('Specifica il palazzetto o palestra di gioco.');
      return;
    }

    onAddMatch({
      squadraCasa: newMatchSquadraCasa.trim(),
      squadraOspite: newMatchSquadraOspite.trim(),
      isHome: newMatchIsHome,
      data: newMatchData,
      orario: newMatchOrario,
      luogo: newMatchLuogo.trim(),
      indirizzo: newMatchIndirizzo.trim() || undefined,
      categoria: newMatchCategoria.trim() || 'Serie D',
      risultato: newMatchRisultato.trim() || 'In programma',
      stato: newMatchRisultato.trim() && newMatchRisultato !== 'In programma' ? 'CONCLUSA' : 'PROGRAMMATA',
      note: newMatchNote.trim() || undefined,
    });

    setMatchFormSuccess('Partita registrata con successo e pubblicata nel banner!');
    setShowAddMatchForm(false);
    if (newMatchIsHome) {
      setNewMatchSquadraOspite('');
    } else {
      setNewMatchSquadraCasa('');
    }
    setNewMatchNote('');
    setTimeout(() => setMatchFormSuccess(''), 3000);
  };

  const handleSaveScore = (match: Match) => {
    if (!editScoreValue.trim()) return;
    const isFinished = editMatchStato === 'CONCLUSA' || editScoreValue.trim() !== 'In programma';
    const updated: Match = {
      ...match,
      risultato: editScoreValue.trim(),
      setScores: editSetScoresValue.trim() || undefined,
      stato: isFinished ? 'CONCLUSA' : editMatchStato,
    };
    onUpdateMatch(updated);
    setEditingScoreMatchId(null);
    setEditScoreValue('');
    setEditSetScoresValue('');
  };


  // Stats - Medico
  const total = athletes.length;
  const expiredCount = athletes.filter(
    (a) => getCertificateStatus(a.scadenzaCertificato).status === 'EXPIRED'
  ).length;
  const expiringCount = athletes.filter(
    (a) => getCertificateStatus(a.scadenzaCertificato).status === 'EXPIRING'
  ).length;
  const validCount = athletes.filter(
    (a) => getCertificateStatus(a.scadenzaCertificato).status === 'VALID'
  ).length;

  // Stats - Quote & Pratiche
  const totalQuotas = athletes.reduce((sum, a) => sum + (a.quotaTotale || 0), 0);
  const totalCollected = athletes.reduce((sum, a) => sum + (a.quotaVersata || 0), 0);
  const totalPending = Math.max(0, totalQuotas - totalCollected);
  const pendingReceiptsCount = athletes.filter(
    (a) => a.ricevutaPagamento?.caricata && !a.ricevutaPagamento.verificata
  ).length;
  const nuoveIscrizioniCount = athletes.filter(
    (a) => a.tipoPratica === 'NUOVA_ISCRIZIONE'
  ).length;
  const rinnoviCount = athletes.filter(
    (a) => a.tipoPratica === 'RINNOVO'
  ).length;

  const teams = Array.from(new Set(athletes.map((a) => a.squadra)));

  // Filtered & Sorted Athletes
  const filteredAthletes = athletes
    .filter((a) => {
      const status = getCertificateStatus(a.scadenzaCertificato);
      if (statusFilter !== 'ALL' && status.status !== statusFilter) {
        return false;
      }
      if (teamFilter !== 'ALL' && a.squadra !== teamFilter) {
        return false;
      }
      if (tipoPraticaFilter !== 'ALL' && a.tipoPratica !== tipoPraticaFilter) {
        return false;
      }
      if (paymentFilter === 'DA_SALDARE' && a.quotaTotale - a.quotaVersata <= 0) {
        return false;
      }
      if (paymentFilter === 'RICEVUTE_ATTESA' && (!a.ricevutaPagamento?.caricata || a.ricevutaPagamento.verificata)) {
        return false;
      }
      if (paymentFilter === 'SALDATO' && a.quotaTotale - a.quotaVersata > 0) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          a.nome.toLowerCase().includes(q) ||
          a.cognome.toLowerCase().includes(q) ||
          a.codiceFiscale.toLowerCase().includes(q)
        );
      }
      return true;
    })
    // Sort so expired are on top, then expiring, then valid
    .sort((a, b) => {
      const dateA = new Date(a.scadenzaCertificato).getTime();
      const dateB = new Date(b.scadenzaCertificato).getTime();
      return dateA - dateB;
    });

  const handleSaveCertDate = (athlete: Athlete) => {
    if (!newCertDate) return;
    const updated: Athlete = {
      ...athlete,
      scadenzaCertificato: newCertDate,
      certificatoCaricato: true,
      messaggiPersonali: [
        {
          id: `msg-${Date.now()}`,
          data: new Date().toLocaleDateString('it-IT'),
          titolo: 'Certificato Medico Rinnovato',
          testo: `La segreteria ha registrato la nuova scadenza del certificato medico al ${newCertDate
            .split('-')
            .reverse()
            .join('/')}. Idoneità agonistica confermata!`,
          letto: false,
          mittente: 'Segreteria ASD Grumo',
        },
        ...athlete.messaggiPersonali,
      ],
    };
    onUpdateAthlete(updated);
    setEditingCertAthleteId(null);
    setNewCertDate('');
  };

  const handleSaveQuota = (athlete: Athlete) => {
    const val = parseFloat(newQuotaVersata);
    if (isNaN(val) || val < 0) return;
    const nuovaVersata = Math.min(athlete.quotaTotale, val);
    const saldoCompletato = nuovaVersata >= athlete.quotaTotale;
    const updated: Athlete = {
      ...athlete,
      quotaVersata: nuovaVersata,
      statoQuota: saldoCompletato ? 'REGOLARE' : 'SECONDA_RATA_ATTESA',
      statoPagamento: saldoCompletato ? 'SALDATO' : nuovaVersata > 0 ? 'ACCONTO_VERSATO' : 'DA_SALDARE',
      messaggiPersonali: [
        {
          id: `msg-${Date.now()}`,
          data: new Date().toLocaleDateString('it-IT'),
          titolo: 'Aggiornamento Quota / Pagamento',
          testo: `La segreteria ASD Grumo ha registrato un versamento per la stagione 2026/2027. Totale versato aggiornato: €${nuovaVersata} su €${athlete.quotaTotale}.`,
          letto: false,
          mittente: 'Segreteria Amministrativa ASD Grumo',
        },
        ...athlete.messaggiPersonali,
      ],
    };
    onUpdateAthlete(updated);
    setEditingQuotaAthleteId(null);
    setNewQuotaVersata('');
  };

  const handleVerifyReceipt = (athlete: Athlete) => {
    if (!athlete.ricevutaPagamento) return;
    const nuovaVersata = Math.min(
      athlete.quotaTotale,
      athlete.quotaVersata + (athlete.ricevutaPagamento.importo || (athlete.quotaTotale - athlete.quotaVersata))
    );
    const saldoCompletato = nuovaVersata >= athlete.quotaTotale;

    const updated: Athlete = {
      ...athlete,
      quotaVersata: nuovaVersata,
      statoQuota: saldoCompletato ? 'REGOLARE' : 'SECONDA_RATA_ATTESA',
      statoPagamento: saldoCompletato ? 'SALDATO' : 'ACCONTO_VERSATO',
      ricevutaPagamento: {
        ...athlete.ricevutaPagamento,
        verificata: true,
      },
      messaggiPersonali: [
        {
          id: `msg-${Date.now()}`,
          data: new Date().toLocaleDateString('it-IT'),
          titolo: 'Ricevuta di Pagamento Convalidata',
          testo: `La tua ricevuta di pagamento per €${athlete.ricevutaPagamento.importo} (${athlete.ricevutaPagamento.metodo}) è stata verificata e registrata con successo dalla Segreteria ASD Grumo.`,
          letto: false,
          mittente: 'Segreteria Amministrativa ASD Grumo',
        },
        ...athlete.messaggiPersonali,
      ],
    };
    onUpdateAthlete(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Quick Actions */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-widest mb-1">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>Pannello di Controllo Staff & Dirigenza</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gestione Certificati, Iscrizioni / Rinnovi & Quote
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoraggio idoneità medica, quote associative, gestione distinte di pagamento e avvisi WhatsApp mirati.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setShowMatchesModal(true);
              setShowAddMatchForm(false);
            }}
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-blue-200 cursor-pointer active:scale-95"
            title="Gestisci prossimi match, sedi, orari e aggiorna risultati"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Gare & Risultati ({matches.length})</span>
          </button>

          <button
            onClick={() => {
              setStaffUsers(getStoredStaffUsers());
              setShowStaffModal(true);
            }}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-slate-300 cursor-pointer active:scale-95"
            title="Gestisci account email e ruoli dello staff societario"
          >
            <ShieldCheck className="w-4 h-4 text-red-600" />
            <span>Membri Staff ({staffUsers.length})</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuovo Atleta / Iscrizione</span>
          </button>

          <button
            onClick={onOpenBroadcastModal}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Invia Avviso / WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Quick Match Bar for Staff */}
      {matches.length > 0 && (
        <div
          className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 transition-all ${
            matches[0].isHome
              ? 'bg-blue-50/70 border-blue-200 text-blue-950'
              : 'bg-red-50/70 border-red-200 text-red-950'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                matches[0].isHome ? 'bg-blue-900 text-white' : 'bg-red-600 text-white'
              }`}
            >
              {matches[0].isHome ? 'IN CASA • BLU' : 'FUORI CASA • ROSSO'}
            </span>
            <div>
              <div className="text-xs font-bold flex items-center gap-2 flex-wrap">
                <span className={matches[0].isHome ? 'font-black text-blue-900' : ''}>
                  {matches[0].squadraCasa}
                </span>
                <span className="text-slate-400 font-normal">vs</span>
                <span className={!matches[0].isHome ? 'font-black text-red-600' : ''}>
                  {matches[0].squadraOspite}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 shadow-2xs">
                  {matches[0].risultato || 'In programma'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 flex-wrap">
                <span>{matches[0].data} ore {matches[0].orario}</span>
                <span>•</span>
                <span>{matches[0].luogo}</span>
                <span>•</span>
                <span className="font-semibold">{matches[0].categoria}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowMatchesModal(true);
                setEditingScoreMatchId(matches[0].id);
                setEditScoreValue(matches[0].risultato || '');
                setEditSetScoresValue(matches[0].setScores || '');
              }}
              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95"
            >
              Aggiorna Risultato
            </button>
            <button
              onClick={() => {
                setShowMatchesModal(true);
                setShowAddMatchForm(true);
              }}
              className="bg-blue-900 hover:bg-blue-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              + Inserisci Match
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats: Certificati Sanitari */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          Monitoraggio Idoneità Sanitaria Agonistica
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Total */}
          <div
            onClick={() => setStatusFilter('ALL')}
            className={`p-4 rounded-2xl bg-white border transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'border-blue-900 ring-2 ring-blue-100 shadow-sm'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Tesserati Totali</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5">
              {total}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-medium">Tutte le squadre</div>
          </div>

          {/* Expired / Blocked */}
          <div
            onClick={() => setStatusFilter('EXPIRED')}
            className={`p-4 rounded-2xl bg-red-50/60 border transition cursor-pointer ${
              statusFilter === 'EXPIRED'
                ? 'border-red-600 ring-2 ring-red-100 shadow-sm'
                : 'border-red-200 hover:border-red-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-700">Scaduti (Bloccati)</span>
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-red-700 mt-1.5">
              {expiredCount}
            </div>
            <div className="text-[10px] text-red-600/80 font-semibold mt-1">
              Attività agonistica sospesa
            </div>
          </div>

          {/* Expiring (≤ 30 days) */}
          <div
            onClick={() => setStatusFilter('EXPIRING')}
            className={`p-4 rounded-2xl bg-amber-50/60 border transition cursor-pointer ${
              statusFilter === 'EXPIRING'
                ? 'border-amber-500 ring-2 ring-amber-100 shadow-sm'
                : 'border-amber-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800">In Scadenza (≤30gg)</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-800 mt-1.5">
              {expiringCount}
            </div>
            <div className="text-[10px] text-amber-700 font-semibold mt-1">
              Sollecito rinnovo
            </div>
          </div>

          {/* Valid */}
          <div
            onClick={() => setStatusFilter('VALID')}
            className={`p-4 rounded-2xl bg-emerald-50/60 border transition cursor-pointer ${
              statusFilter === 'VALID'
                ? 'border-emerald-600 ring-2 ring-emerald-100 shadow-sm'
                : 'border-emerald-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800">Regolari (Validi)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1.5">
              {validCount}
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-1">
              Idoneità attiva
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats: Finanziario / Quote & Iscrizioni */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          Riepilogo Finanziario & Pratiche 2026/2027
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Incassato */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800">Totale Incassato</span>
              <Banknote className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1.5">
              €{totalCollected}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium mt-1">
              Su totale di €{totalQuotas}
            </div>
          </div>

          {/* Da Saldare */}
          <div
            onClick={() => setPaymentFilter(paymentFilter === 'DA_SALDARE' ? 'ALL' : 'DA_SALDARE')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              paymentFilter === 'DA_SALDARE'
                ? 'bg-red-50 border-red-500 ring-2 ring-red-100'
                : 'bg-red-50/30 border-red-200 hover:border-red-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-700">Residuo da Incassare</span>
              <CreditCard className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-red-600 mt-1.5">
              €{totalPending}
            </div>
            <div className="text-[10px] text-red-600/80 font-medium mt-1">
              Clicca per filtrare atleti debitori
            </div>
          </div>

          {/* Ricevute in Attesa di Verifica */}
          <div
            onClick={() => setPaymentFilter(paymentFilter === 'RICEVUTE_ATTESA' ? 'ALL' : 'RICEVUTE_ATTESA')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              paymentFilter === 'RICEVUTE_ATTESA'
                ? 'bg-blue-50 border-blue-900 ring-2 ring-blue-100'
                : 'bg-blue-50/40 border-blue-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900">Ricevute in Attesa</span>
              <Receipt className="w-4 h-4 text-blue-800" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-900 mt-1.5">
              {pendingReceiptsCount}
            </div>
            <div className="text-[10px] text-blue-700 font-medium mt-1">
              {pendingReceiptsCount > 0 ? 'Da convalidare in segreteria' : 'Nessuna ricevuta pendente'}
            </div>
          </div>

          {/* Tipologia Pratiche */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Composizione Iscritti</span>
              <RefreshCw className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-black text-blue-900">{rinnoviCount}</span>
              <span className="text-xs text-slate-500 font-bold">Rinnovi</span>
              <span className="text-slate-300">/</span>
              <span className="text-2xl font-black text-emerald-700">{nuoveIscrizioniCount}</span>
              <span className="text-xs text-slate-500 font-bold">Nuovi</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-medium">
              Stagione Agonistica 2026/2027
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca atleta per nome, cognome o Codice Fiscale..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-blue-900 focus:bg-white"
            />
          </div>

          {/* Team Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-900"
            >
              <option value="ALL">Tutte le Squadre</option>
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Practice Type Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={tipoPraticaFilter}
              onChange={(e) => setTipoPraticaFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-900"
            >
              <option value="ALL">Tutte le Pratiche</option>
              <option value="RINNOVO">Solo Rinnovi</option>
              <option value="NUOVA_ISCRIZIONE">Solo Nuove Iscrizioni</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-900"
            >
              <option value="ALL">Tutti gli Stati Pagamento</option>
              <option value="DA_SALDARE">Da Saldare (Debito Aperto)</option>
              <option value="RICEVUTE_ATTESA">Ricevuta in Attesa Verifica</option>
              <option value="SALDATO">Saldo Completo</option>
            </select>
          </div>
        </div>

        {/* Status Quick Pills for Certificato */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-semibold mr-1">Stato Medico:</span>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer text-xs ${
              statusFilter === 'ALL'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tutti ({total})
          </button>
          <button
            onClick={() => setStatusFilter('EXPIRED')}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer text-xs ${
              statusFilter === 'EXPIRED'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
          >
            Scaduti ({expiredCount})
          </button>
          <button
            onClick={() => setStatusFilter('EXPIRING')}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer text-xs ${
              statusFilter === 'EXPIRING'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            In Scadenza ({expiringCount})
          </button>
          <button
            onClick={() => setStatusFilter('VALID')}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer text-xs ${
              statusFilter === 'VALID'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Validi ({validCount})
          </button>
        </div>
      </div>

      {/* Main Table: Certificate & Payment Status & Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Elenco Atleti & Pratiche ({filteredAthletes.length})
            </h2>
            <span className="text-xs text-slate-400">
              Visualizzazione integrata idoneità, iscrizione/rinnovo e contabilità
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Atleta</th>
                <th className="py-3.5 px-4">Squadra & Pratica</th>
                <th className="py-3.5 px-4">Quota & Pagamento</th>
                <th className="py-3.5 px-4">Scadenza Medico</th>
                <th className="py-3.5 px-4">Idoneità</th>
                <th className="py-3.5 px-4">Genitore</th>
                <th className="py-3.5 px-4 text-right">Azioni & WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAthletes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nessun atleta corrispondente ai filtri selezionati.
                  </td>
                </tr>
              ) : (
                filteredAthletes.map((athlete) => {
                  const status = getCertificateStatus(athlete.scadenzaCertificato);
                  const waCertUrl = generateWhatsAppUrl(athlete, 'CERTIFICATO');
                  const waQuotaUrl = generateWhatsAppUrl(athlete, 'QUOTA');
                  const isEditingCert = editingCertAthleteId === athlete.id;
                  const isEditingQuota = editingQuotaAthleteId === athlete.id;
                  const residuo = athlete.quotaTotale - athlete.quotaVersata;

                  return (
                    <tr
                      key={athlete.id}
                      className={`hover:bg-slate-50/80 transition ${
                        status.status === 'EXPIRED'
                          ? 'bg-red-50/20'
                          : status.status === 'EXPIRING'
                          ? 'bg-amber-50/20'
                          : ''
                      }`}
                    >
                      {/* Atleta Info & PIN */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {athlete.cognome} {athlete.nome}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          CF: {athlete.codiceFiscale}
                        </div>

                        {/* PIN Personale Atleta */}
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                          {editingPinAthleteId === athlete.id ? (
                            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-blue-400 shadow-xs">
                              <input
                                type="text"
                                value={newAthletePin}
                                onChange={(e) => setNewAthletePin(e.target.value)}
                                placeholder="Nuovo PIN"
                                className="w-18 px-1.5 py-0.5 text-[11px] font-mono font-bold text-blue-900 border border-slate-200 rounded outline-none"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveAthletePin(athlete)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                                title="Salva PIN"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPinAthleteId(null);
                                  setNewAthletePin('');
                                }}
                                className="p-1 text-slate-400 hover:bg-slate-100 rounded cursor-pointer"
                                title="Annulla"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                                <KeyRound className="w-2.5 h-2.5 text-blue-700 shrink-0" />
                                <span>PIN: {athlete.password || '1234'}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(athlete.password || '1234');
                                  setCopiedPinAthleteId(athlete.id);
                                  setTimeout(() => setCopiedPinAthleteId(null), 1500);
                                }}
                                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                                title="Copia PIN per comunicarlo alla famiglia"
                              >
                                {copiedPinAthleteId === athlete.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPinAthleteId(athlete.id);
                                  setNewAthletePin(athlete.password || '1234');
                                }}
                                className="text-[10px] text-blue-700 hover:underline cursor-pointer ml-0.5"
                                title="Modifica PIN atleta"
                              >
                                Modifica
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Squadra & Pratica */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-700">
                          {athlete.squadra}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span
                            className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              athlete.tipoPratica === 'NUOVA_ISCRIZIONE'
                                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                : 'bg-blue-50 text-blue-900 border border-blue-200'
                            }`}
                          >
                            {athlete.tipoPratica === 'NUOVA_ISCRIZIONE' ? (
                              <>
                                <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                                <span>Iscrizione</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-2.5 h-2.5 text-blue-600" />
                                <span>Rinnovo</span>
                              </>
                            )}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            • #{athlete.numeroMaglia || '-'}
                          </span>
                        </div>
                      </td>

                      {/* Quota & Pagamento */}
                      <td className="py-3.5 px-4">
                        {isEditingQuota ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-500">€</span>
                            <input
                              type="number"
                              value={newQuotaVersata}
                              onChange={(e) => setNewQuotaVersata(e.target.value)}
                              className="w-16 bg-white border border-blue-400 rounded-lg px-2 py-1 text-xs font-mono font-bold"
                            />
                            <button
                              onClick={() => handleSaveQuota(athlete)}
                              className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                              title="Salva importo versato"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingQuotaAthleteId(null)}
                              className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer"
                              title="Annulla"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">
                                €{athlete.quotaVersata}
                              </span>
                              <span className="text-slate-400 text-[11px]">
                                / €{athlete.quotaTotale}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingQuotaAthleteId(athlete.id);
                                  setNewQuotaVersata(athlete.quotaVersata.toString());
                                }}
                                className="p-0.5 text-slate-400 hover:text-blue-900 transition cursor-pointer"
                                title="Modifica versamento registrato"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              {residuo <= 0 ? (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                  ✓ Saldato
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-50 text-red-700 border border-red-200">
                                  Residuo: €{residuo}
                                </span>
                              )}

                              {/* Ricevuta badge */}
                              {athlete.ricevutaPagamento?.caricata && (
                                <span
                                  className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                                    athlete.ricevutaPagamento.verificata
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : 'bg-blue-50 text-blue-800 border-blue-300 animate-pulse'
                                  }`}
                                  title={
                                    athlete.ricevutaPagamento.verificata
                                      ? `Ricevuta verificata (€${athlete.ricevutaPagamento.importo} - ${athlete.ricevutaPagamento.metodo})`
                                      : `Ricevuta trasmessa da verificare (€${athlete.ricevutaPagamento.importo} - ${athlete.ricevutaPagamento.metodo})`
                                  }
                                >
                                  <Receipt className="w-2.5 h-2.5" />
                                  <span>{athlete.ricevutaPagamento.verificata ? 'Verificata' : 'Ricevuta da Verificare'}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Scadenza Certificato con inline editor */}
                      <td className="py-3.5 px-4">
                        {isEditingCert ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="date"
                              value={newCertDate}
                              onChange={(e) => setNewCertDate(e.target.value)}
                              className="bg-white border border-blue-400 rounded-lg px-2 py-1 text-xs font-mono"
                            />
                            <button
                              onClick={() => handleSaveCertDate(athlete)}
                              className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                              title="Salva nuova data"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingCertAthleteId(null)}
                              className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer"
                              title="Annulla"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="font-mono font-bold text-slate-800 flex items-center gap-1">
                              <span>{athlete.scadenzaCertificato.split('-').reverse().join('/')}</span>
                              <button
                                onClick={() => {
                                  setEditingCertAthleteId(athlete.id);
                                  setNewCertDate(athlete.scadenzaCertificato);
                                }}
                                className="p-0.5 text-slate-400 hover:text-blue-900 transition cursor-pointer"
                                title="Modifica data certificato"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {status.daysRemaining < 0
                                ? `Scaduto da ${Math.abs(status.daysRemaining)}gg`
                                : `Mancano ${status.daysRemaining}gg`}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Badge Idoneità */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold ${status.badgeBg} ${status.badgeText} border ${status.badgeBorder}`}
                        >
                          {status.status === 'VALID' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : status.status === 'EXPIRING' ? (
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-600 animate-pulse" />
                          )}
                          <span>{status.label}</span>
                        </span>
                      </td>

                      {/* Contatto Genitore */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 font-medium truncate max-w-[120px]">
                          {athlete.nomeGenitore}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{athlete.telefonoGenitore}</span>
                        </div>
                      </td>

                      {/* Azioni & WhatsApp */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Convalida ricevuta button if pending */}
                          {athlete.ricevutaPagamento?.caricata && !athlete.ricevutaPagamento.verificata && (
                            <button
                              onClick={() => handleVerifyReceipt(athlete)}
                              className="inline-flex items-center gap-1 bg-blue-900 hover:bg-blue-800 text-white font-bold px-2 py-1.5 rounded-lg text-[10px] transition shadow-xs cursor-pointer active:scale-95"
                              title="Convalida e registra bonifico/ricevuta"
                            >
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Convalida Pagamento</span>
                            </button>
                          )}

                          {/* WhatsApp Avviso Certificato */}
                          <a
                            href={waCertUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] transition shadow-2xs cursor-pointer"
                            title="Invia promemoria certificato medico su WhatsApp al genitore"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WA Medico</span>
                          </a>

                          {/* WhatsApp Avviso Quota/Rinnovo */}
                          <a
                            href={waQuotaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 bg-blue-700 hover:bg-blue-800 text-white font-bold px-2 py-1.5 rounded-lg text-[10px] transition shadow-2xs cursor-pointer"
                            title="Invia promemoria saldo quota/rinnovo con IBAN via WhatsApp"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">WA Quota</span>
                          </a>

                          {/* Scheda Atleta */}
                          <button
                            onClick={() => onSelectAthleteForView(athlete.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 transition cursor-pointer"
                            title="Visualizza scheda come la vede l'atleta/genitore"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Elimina */}
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Vuoi davvero rimuovere ${athlete.nome} ${athlete.cognome} dall'anagrafica?`
                                )
                              ) {
                                onDeleteAthlete(athlete.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                            title="Rimuovi atleta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL GESTIONE ACCOUNT STAFF & DIRIGENZA */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200 p-5 sm:p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Membri Staff & Dirigenza ({staffUsers.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Account autorizzati all'accesso gestionale ASD Grumo Volley
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowStaffModal(false);
                  setShowAddStaffForm(false);
                  setStaffModalError('');
                  setStaffModalSuccess('');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {staffModalSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{staffModalSuccess}</span>
              </div>
            )}

            {/* List of registered staff */}
            <div className="mt-4 space-y-2.5">
              {staffUsers.map((staff) => {
                const isCurrent = currentStaffUser?.id === staff.id;
                return (
                  <div
                    key={staff.id}
                    className={`p-3.5 rounded-xl border transition ${
                      isCurrent
                        ? 'bg-blue-50/50 border-blue-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shadow-2xs">
                          {staff.nome.charAt(0)}{staff.cognome.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                              {staff.nome} {staff.cognome}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-900 text-white">
                                Tu
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <strong className="text-slate-700 font-mono">{staff.email}</strong>
                            </span>
                            {staff.telefono && (
                              <span>• Tel: {staff.telefono}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            staff.ruolo === 'Presidente'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : staff.ruolo === 'Segreteria'
                              ? 'bg-blue-50 text-blue-900 border-blue-200'
                              : staff.ruolo === 'Allenatore'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {staff.ruolo}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Form to add a new staff member */}
            {!showAddStaffForm ? (
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowAddStaffForm(true)}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Registra Nuovo Membro Staff</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Chiudi
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateStaffFromModal} className="mt-5 pt-4 border-t border-slate-200 space-y-3 bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-red-600" />
                    <span>Registra Nuovo Collega Dirigenza/Staff</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddStaffForm(false)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Annulla
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Nome:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="es. Paolo"
                      value={newStaffNome}
                      onChange={(e) => setNewStaffNome(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Cognome:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="es. Bianchi"
                      value={newStaffCognome}
                      onChange={(e) => setNewStaffCognome(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Email di Accesso:
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="es. paolo.bianchi@asdgrumo.it"
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Ruolo:
                    </label>
                    <select
                      value={newStaffRuolo}
                      onChange={(e) => setNewStaffRuolo(e.target.value as StaffRole)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-red-600 cursor-pointer"
                    >
                      <option value="Dirigente">Dirigente Accompagnatore</option>
                      <option value="Allenatore">Allenatore / Coach</option>
                      <option value="Segreteria">Segreteria Amministrativa</option>
                      <option value="Presidente">Presidente / Direttivo</option>
                      <option value="Staff Tecnico">Staff Tecnico / Medico</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Telefono (facoltativo):
                    </label>
                    <input
                      type="tel"
                      placeholder="es. 333 9876543"
                      value={newStaffTelefono}
                      onChange={(e) => setNewStaffTelefono(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Crea Password (min. 4 car.):
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Password di accesso"
                      value={newStaffPassword}
                      onChange={(e) => setNewStaffPassword(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                {staffModalError && (
                  <div className="p-2 rounded-lg bg-red-100 border border-red-200 text-xs text-red-700">
                    {staffModalError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddStaffForm(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs cursor-pointer active:scale-95"
                  >
                    Crea Account Staff
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MATCHES & CALENDAR MODAL */}
      {showMatchesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center border border-blue-200">
                  <Trophy className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Gestione Gare & Risultati
                  </h3>
                  <p className="text-xs text-slate-500">
                    ASD Grumo in Casa (BLU) o Fuori Casa (ROSSO) • Aggiornabile esclusivamente dallo staff
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowMatchesModal(false);
                  setShowAddMatchForm(false);
                  setEditingScoreMatchId(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {matchFormSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{matchFormSuccess}</span>
                </div>
              )}

              {/* Action bar inside modal */}
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-700">
                  Partite nel Calendario: <span className="text-blue-900 font-black">{matches.length}</span>
                </div>
                {!showAddMatchForm && (
                  <button
                    onClick={() => setShowAddMatchForm(true)}
                    className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                  >
                    <Volleyball className="w-3.5 h-3.5" />
                    <span>+ Inserisci Nuova Partita</span>
                  </button>
                )}
              </div>

              {/* Form Nuovo Match */}
              {showAddMatchForm && (
                <form
                  onSubmit={handleCreateMatch}
                  className="bg-slate-50 border border-slate-300 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Volleyball className="w-4 h-4 text-blue-900" />
                      <span>Inserisci Dettagli Partita</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Tutti i campi contrassegnati sono obbligatori
                    </span>
                  </div>

                  {/* Toggle Casa (BLU) vs Fuori Casa (ROSSO) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      1. Dove gioca l'ASD Grumo Volley?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleMatchLocationType(true)}
                        className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                          newMatchIsHome
                            ? 'bg-blue-900 text-white border-blue-900 shadow-sm ring-2 ring-blue-300'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                            newMatchIsHome ? 'border-white bg-white' : 'border-slate-400'
                          }`}
                        />
                        <div>
                          <div className="text-xs font-bold">IN CASA (BLU)</div>
                          <div
                            className={`text-[10px] ${
                              newMatchIsHome ? 'text-blue-200' : 'text-slate-400'
                            }`}
                          >
                            PalaSport Comunale Grumo
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleMatchLocationType(false)}
                        className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                          !newMatchIsHome
                            ? 'bg-red-600 text-white border-red-600 shadow-sm ring-2 ring-red-300'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-red-300'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                            !newMatchIsHome ? 'border-white bg-white' : 'border-slate-400'
                          }`}
                        />
                        <div>
                          <div className="text-xs font-bold">FUORI CASA (ROSSO)</div>
                          <div
                            className={`text-[10px] ${
                              !newMatchIsHome ? 'text-red-200' : 'text-slate-400'
                            }`}
                          >
                            In trasferta da avversari
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Teams Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Squadra di Casa:
                      </label>
                      <input
                        type="text"
                        required
                        value={newMatchSquadraCasa}
                        onChange={(e) => setNewMatchSquadraCasa(e.target.value)}
                        placeholder="Es. ASD Grumo Volley"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Squadra Ospite:
                      </label>
                      <input
                        type="text"
                        required
                        value={newMatchSquadraOspite}
                        onChange={(e) => setNewMatchSquadraOspite(e.target.value)}
                        placeholder="Es. Volley Modugno"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-900"
                      />
                    </div>
                  </div>

                  {/* Categoria, Data & Orario */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Categoria / Torneo:
                      </label>
                      <input
                        type="text"
                        required
                        value={newMatchCategoria}
                        onChange={(e) => setNewMatchCategoria(e.target.value)}
                        placeholder="Es. Serie D Femminile"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Data Partita:
                      </label>
                      <input
                        type="date"
                        required
                        value={newMatchData}
                        onChange={(e) => setNewMatchData(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Orario Inizio:
                      </label>
                      <input
                        type="time"
                        required
                        value={newMatchOrario}
                        onChange={(e) => setNewMatchOrario(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-900"
                      />
                    </div>
                  </div>

                  {/* Luogo & Indirizzo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Palazzetto / Struttura di Gioco:
                      </label>
                      <input
                        type="text"
                        required
                        value={newMatchLuogo}
                        onChange={(e) => setNewMatchLuogo(e.target.value)}
                        placeholder="Es. PalaSport Comunale - Grumo Appula"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Indirizzo (opzionale):
                      </label>
                      <input
                        type="text"
                        value={newMatchIndirizzo}
                        onChange={(e) => setNewMatchIndirizzo(e.target.value)}
                        placeholder="Es. Via Sannicandro, Grumo Appula (BA)"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-900"
                      />
                    </div>
                  </div>

                  {/* Risultato iniziale e Note */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Stato / Risultato Iniziale:
                      </label>
                      <input
                        type="text"
                        value={newMatchRisultato}
                        onChange={(e) => setNewMatchRisultato(e.target.value)}
                        placeholder="Es. In programma"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Note per atlete / pubblico:
                      </label>
                      <input
                        type="text"
                        value={newMatchNote}
                        onChange={(e) => setNewMatchNote(e.target.value)}
                        placeholder="Es. Ritrovo atlete ore 17:15 - Ingresso libero"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-900"
                      />
                    </div>
                  </div>

                  {matchFormError && (
                    <div className="p-2.5 rounded-xl bg-red-100 border border-red-200 text-xs text-red-700">
                      {matchFormError}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMatchForm(false)}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
                    >
                      Annulla
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Salva e Pubblica nel Banner</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Lista Partite Configurate */}
              <div className="space-y-3">
                {matches.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
                    <Volleyball className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div className="text-sm font-bold text-slate-700">Nessuna partita in calendario</div>
                    <p className="text-xs text-slate-500 mt-1">
                      Clicca sul pulsante in alto per programmare il prossimo match.
                    </p>
                  </div>
                ) : (
                  matches.map((m) => {
                    const isFinished = m.stato === 'CONCLUSA' || (m.risultato && m.risultato !== 'In programma' && m.risultato !== 'Da disputare');
                    const isEditingScore = editingScoreMatchId === m.id;

                    return (
                      <div
                        key={m.id}
                        className={`rounded-2xl border p-4 transition-all ${
                          m.isHome
                            ? 'bg-blue-50/40 border-blue-200 hover:border-blue-300'
                            : 'bg-red-50/40 border-red-200 hover:border-red-300'
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                m.isHome
                                  ? 'bg-blue-900 text-white'
                                  : 'bg-red-600 text-white'
                              }`}
                            >
                              {m.isHome ? 'IN CASA • BLU' : 'FUORI CASA • ROSSO'}
                            </span>
                            <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                              {m.categoria}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                if (isEditingScore) {
                                  setEditingScoreMatchId(null);
                                } else {
                                  setEditingScoreMatchId(m.id);
                                  setEditScoreValue(m.risultato || '');
                                  setEditSetScoresValue(m.setScores || '');
                                  setEditMatchStato(m.stato || 'CONCLUSA');
                                }
                              }}
                              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer flex items-center gap-1"
                            >
                              <Edit2 className="w-3 h-3 text-blue-900" />
                              <span>Aggiorna Risultato</span>
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`Eliminare la partita ${m.squadraCasa} vs ${m.squadraOspite}?`)) {
                                  onDeleteMatch(m.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer rounded-lg hover:bg-red-50"
                              title="Elimina partita"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Match Title & Teams */}
                        <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
                          <span className={m.isHome ? 'text-blue-900 font-black' : ''}>
                            {m.squadraCasa}
                          </span>
                          <span className="text-slate-400 font-normal">vs</span>
                          <span className={!m.isHome ? 'text-red-600 font-black' : ''}>
                            {m.squadraOspite}
                          </span>

                          <span
                            className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider ${
                              isFinished
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}
                          >
                            {m.risultato || 'In programma'}
                          </span>
                        </div>

                        {/* Sub info */}
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{m.data} ore {m.orario}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{m.luogo} {m.indirizzo ? `(${m.indirizzo})` : ''}</span>
                          </span>
                          {m.setScores && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-slate-700 font-semibold">
                                Set: {m.setScores}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Inline Score Updater */}
                        {isEditingScore && (
                          <div className="mt-3 p-3 bg-white border border-slate-300 rounded-xl shadow-xs space-y-2.5 animate-in fade-in duration-150">
                            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                              <span>Aggiorna Punteggio Finale & Set:</span>
                              <span className="text-[10px] text-slate-400">Salvataggio istantaneo</span>
                            </div>

                            {/* Quick Buttons for Common Volley Scores */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-500 mr-1">Preimpostati:</span>
                              {['3 - 0', '3 - 1', '3 - 2', '2 - 3', '1 - 3', '0 - 3', 'In programma'].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => setEditScoreValue(preset)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                                    editScoreValue === preset
                                      ? 'bg-blue-900 text-white border-blue-900'
                                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                                  }`}
                                >
                                  {preset}
                                </button>
                              ))}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                                  Punteggio Partita (es. 3 - 1):
                                </label>
                                <input
                                  type="text"
                                  value={editScoreValue}
                                  onChange={(e) => setEditScoreValue(e.target.value)}
                                  placeholder="Es. 3 - 1 o In programma"
                                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                                  Parziali Set (es. 25-21, 23-25, 25-18, 25-20):
                                </label>
                                <input
                                  type="text"
                                  value={editSetScoresValue}
                                  onChange={(e) => setEditSetScoresValue(e.target.value)}
                                  placeholder="Es. 25-21, 23-25, 25-18, 25-20"
                                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-900"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingScoreMatchId(null)}
                                className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                              >
                                Annulla
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveScore(m)}
                                className="px-3.5 py-1 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs cursor-pointer active:scale-95 flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Salva Risultato</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Le modifiche appaiono istantaneamente nel banner principale dell'app.</span>
              <button
                onClick={() => {
                  setShowMatchesModal(false);
                  setShowAddMatchForm(false);
                }}
                className="px-4 py-2 font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition cursor-pointer"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

