import React, { useState, useEffect } from 'react';
import { Athlete, StaffUser } from '../types';
import {
  resetAthletePassword,
  resetStaffPassword,
  getStoredStaffUsers,
  ASD_GRUMO_SEGRETERIA_PHONE,
} from '../utils/storage';
import {
  X,
  KeyRound,
  ShieldCheck,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  RotateCcw,
  MessageCircle,
  HelpCircle,
  Lock,
} from 'lucide-react';

interface PasswordRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  athletes: Athlete[];
  initialMode?: 'ATHLETE' | 'STAFF';
  preselectedAthleteId?: string;
  prefilledStaffEmail?: string;
  onAthletePasswordReset?: (updatedAthlete: Athlete) => void;
  onStaffPasswordReset?: (updatedStaff: StaffUser, autoLogin?: boolean) => void;
}

export const PasswordRecoveryModal: React.FC<PasswordRecoveryModalProps> = ({
  isOpen,
  onClose,
  athletes,
  initialMode = 'ATHLETE',
  preselectedAthleteId = '',
  prefilledStaffEmail = '',
  onAthletePasswordReset,
  onStaffPasswordReset,
}) => {
  const [activeTab, setActiveTab] = useState<'ATHLETE' | 'STAFF'>(initialMode);

  // --- Athlete Recovery State ---
  const [athleteId, setAthleteId] = useState<string>(preselectedAthleteId);
  const [athleteSearchQuery, setAthleteSearchQuery] = useState<string>('');
  const [athleteVerificationMethod, setAthleteVerificationMethod] = useState<'CF' | 'BIRTHDATE'>('CF');
  const [athleteVerificationInput, setAthleteVerificationInput] = useState<string>('');
  const [athleteVerified, setAthleteVerified] = useState<boolean>(false);
  const [athleteNewPassword, setAthleteNewPassword] = useState<string>('');
  const [athleteConfirmPassword, setAthleteConfirmPassword] = useState<string>('');
  const [showAthleteNewPassword, setShowAthleteNewPassword] = useState<boolean>(false);
  const [athleteError, setAthleteError] = useState<string>('');
  const [athleteSuccess, setAthleteSuccess] = useState<string>('');
  const [revealedCurrentPin, setRevealedCurrentPin] = useState<string | null>(null);

  // --- Staff Recovery State ---
  const [staffEmail, setStaffEmail] = useState<string>(prefilledStaffEmail);
  const [staffVerificationSurname, setStaffVerificationSurname] = useState<string>('');
  const [staffVerified, setStaffVerified] = useState<boolean>(false);
  const [verifiedStaffUser, setVerifiedStaffUser] = useState<StaffUser | null>(null);
  const [staffNewPassword, setStaffNewPassword] = useState<string>('');
  const [staffConfirmPassword, setStaffConfirmPassword] = useState<string>('');
  const [showStaffNewPassword, setShowStaffNewPassword] = useState<boolean>(false);
  const [staffError, setStaffError] = useState<string>('');
  const [staffSuccess, setStaffSuccess] = useState<string>('');

  // Sync initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      setAthleteId(preselectedAthleteId);
      setStaffEmail(prefilledStaffEmail);
      resetForms();
    }
  }, [isOpen, initialMode, preselectedAthleteId, prefilledStaffEmail]);

  const resetForms = () => {
    setAthleteVerificationInput('');
    setAthleteVerified(false);
    setAthleteNewPassword('');
    setAthleteConfirmPassword('');
    setAthleteError('');
    setAthleteSuccess('');
    setRevealedCurrentPin(null);

    setStaffVerificationSurname('');
    setStaffVerified(false);
    setVerifiedStaffUser(null);
    setStaffNewPassword('');
    setStaffConfirmPassword('');
    setStaffError('');
    setStaffSuccess('');
  };

  if (!isOpen) return null;

  const selectedAthlete = athletes.find((a) => a.id === athleteId);

  // Filter athletes for dropdown
  const filteredAthletes = athletes.filter((a) => {
    const q = athleteSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      a.nome.toLowerCase().includes(q) ||
      a.cognome.toLowerCase().includes(q) ||
      a.squadra.toLowerCase().includes(q) ||
      a.codiceFiscale.toLowerCase().includes(q)
    );
  });

  // --- Athlete Verification Handler ---
  const handleVerifyAthlete = (e: React.FormEvent) => {
    e.preventDefault();
    setAthleteError('');
    setAthleteSuccess('');
    setRevealedCurrentPin(null);

    if (!selectedAthlete) {
      setAthleteError('Seleziona prima l\'atleta per cui intendi recuperare il PIN.');
      return;
    }

    const input = athleteVerificationInput.trim().toUpperCase();
    if (!input) {
      setAthleteError(
        athleteVerificationMethod === 'CF'
          ? 'Inserisci il Codice Fiscale (o le ultime 6 cifre/lettere).'
          : 'Inserisci la data di nascita.'
      );
      return;
    }

    let isMatch = false;
    if (athleteVerificationMethod === 'CF') {
      const targetCf = selectedAthlete.codiceFiscale.toUpperCase();
      isMatch = targetCf === input || targetCf.endsWith(input);
    } else {
      isMatch = selectedAthlete.dataNascita === athleteVerificationInput.trim();
    }

    if (isMatch) {
      setAthleteVerified(true);
      setAthleteError('');
    } else {
      setAthleteError(
        athleteVerificationMethod === 'CF'
          ? 'Il Codice Fiscale inserito non corrisponde a quello presente nei registri dell\'atleta selezionato.'
          : 'La data di nascita inserita non corrisponde a quella presente nei registri.'
      );
    }
  };

  // --- Athlete Set New Password Handler ---
  const handleSaveAthleteNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setAthleteError('');
    setAthleteSuccess('');

    if (!selectedAthlete) return;

    if (athleteNewPassword.length < 4) {
      setAthleteError('Il nuovo PIN o password deve contenere almeno 4 caratteri.');
      return;
    }

    if (athleteNewPassword !== athleteConfirmPassword) {
      setAthleteError('I due valori di password inseriti non coincidono.');
      return;
    }

    const res = resetAthletePassword(selectedAthlete.id, athleteNewPassword);
    if (res.success && res.athlete) {
      setAthleteSuccess(`Password / PIN per ${res.athlete.nome} ${res.athlete.cognome} aggiornato con successo!`);
      if (onAthletePasswordReset) {
        onAthletePasswordReset(res.athlete);
      }
    } else {
      setAthleteError(res.error || 'Errore durante l\'aggiornamento del PIN.');
    }
  };

  // Reset to default PIN '1234'
  const handleResetToDefaultAthletePin = () => {
    if (!selectedAthlete) return;
    const res = resetAthletePassword(selectedAthlete.id, '1234');
    if (res.success && res.athlete) {
      setAthleteSuccess(`PIN per ${res.athlete.nome} ${res.athlete.cognome} reimpostato su quello standard: 1234`);
      setAthleteNewPassword('1234');
      setAthleteConfirmPassword('1234');
      if (onAthletePasswordReset) {
        onAthletePasswordReset(res.athlete);
      }
    }
  };

  // --- Staff Verification Handler ---
  const handleVerifyStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError('');
    setStaffSuccess('');

    const email = staffEmail.trim().toLowerCase();
    if (!email) {
      setStaffError('Inserisci l\'indirizzo email registrato.');
      return;
    }

    const staffUsers = getStoredStaffUsers();
    const foundUser = staffUsers.find((u) => u.email.trim().toLowerCase() === email);

    if (!foundUser) {
      setStaffError('Nessun utente Staff trovato con questa email. Verifica l\'indirizzo inserito.');
      return;
    }

    const surnameInput = staffVerificationSurname.trim().toLowerCase();
    const actualSurname = foundUser.cognome.trim().toLowerCase();

    // Verification by surname or club secret override
    if (surnameInput !== actualSurname && surnameInput !== 'grumo') {
      setStaffError('Il cognome inserito non corrisponde a quello registrato per questa email.');
      return;
    }

    setVerifiedStaffUser(foundUser);
    setStaffVerified(true);
    setStaffError('');
  };

  // --- Staff Set New Password Handler ---
  const handleSaveStaffNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError('');
    setStaffSuccess('');

    if (!verifiedStaffUser) return;

    if (staffNewPassword.length < 4) {
      setStaffError('La nuova password deve contenere almeno 4 caratteri.');
      return;
    }

    if (staffNewPassword !== staffConfirmPassword) {
      setStaffError('Le due password non corrispondono.');
      return;
    }

    const res = resetStaffPassword(verifiedStaffUser.email, staffNewPassword);
    if (res.success && res.user) {
      setStaffSuccess(`Password aggiornata per ${res.user.nome} ${res.user.cognome}! Ora puoi accedere al pannello.`);
      if (onStaffPasswordReset) {
        onStaffPasswordReset(res.user, false);
      }
    } else {
      setStaffError(res.error || 'Errore durante l\'aggiornamento della password.');
    }
  };

  // Pre-filled WhatsApp message for Athlete assistance
  const waAthleteText = selectedAthlete
    ? `Salve Segreteria ASD Grumo Volley, richiedo assistenza per il recupero del PIN di accesso per l'atleta ${selectedAthlete.cognome} ${selectedAthlete.nome} (CF: ${selectedAthlete.codiceFiscale}, Squadra: ${selectedAthlete.squadra}).`
    : `Salve Segreteria ASD Grumo Volley, richiedo assistenza per il recupero del PIN di accesso per un'atleta.`;
  const waAthleteUrl = `https://wa.me/${ASD_GRUMO_SEGRETERIA_PHONE}?text=${encodeURIComponent(waAthleteText)}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8 relative">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center border border-blue-200 shadow-2xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Recupero Password & PIN
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                ASD Grumo Volley • Servizio di ripristino credenziali
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
            title="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-4 flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('ATHLETE');
              resetForms();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'ATHLETE'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Atleta / Famiglia</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('STAFF');
              resetForms();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'STAFF'
                ? 'bg-white text-red-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dirigenza / Staff</span>
          </button>
        </div>

        {/* TAB 1: RECUPERO ATLETA */}
        {activeTab === 'ATHLETE' && (
          <div className="mt-5 space-y-4">
            <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-200 text-xs text-blue-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-900" />
                <span>Hai smarrito il PIN o la password della scheda atleta?</span>
              </div>
              <p className="text-[11px] text-blue-900/80 leading-relaxed">
                Verifica i dati anagrafici dell'atleta registrato per reimpostare immediatamente il PIN oppure richiedi assistenza alla segreteria societaria.
              </p>
            </div>

            {athleteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">{athleteError}</span>
              </div>
            )}

            {athleteSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs leading-relaxed">{athleteSuccess}</span>
                  <p className="text-[11px] font-normal text-emerald-700">
                    Puoi ora accedere direttamente con il nuovo PIN dalla schermata principale.
                  </p>
                </div>
              </div>
            )}

            {!athleteVerified ? (
              /* FASE 1: Selezione atleta e verifica identità */
              <form onSubmit={handleVerifyAthlete} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1. Seleziona l'Atleta:
                  </label>
                  <select
                    value={athleteId}
                    onChange={(e) => {
                      setAthleteId(e.target.value);
                      setAthleteError('');
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-900 outline-none cursor-pointer font-medium"
                  >
                    <option value="">-- Clicca per selezionare l'atleta --</option>
                    {athletes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.cognome} {a.nome} • {a.squadra} ({a.codiceFiscale})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedAthlete && (
                  <div className="space-y-3 pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">
                        2. Verifica Identità di Sicurezza:
                      </label>
                      <div className="flex items-center gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setAthleteVerificationMethod('CF')}
                          className={`px-2 py-0.5 rounded cursor-pointer ${
                            athleteVerificationMethod === 'CF'
                              ? 'bg-blue-900 text-white font-bold'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Codice Fiscale
                        </button>
                        <button
                          type="button"
                          onClick={() => setAthleteVerificationMethod('BIRTHDATE')}
                          className={`px-2 py-0.5 rounded cursor-pointer ${
                            athleteVerificationMethod === 'BIRTHDATE'
                              ? 'bg-blue-900 text-white font-bold'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Data di Nascita
                        </button>
                      </div>
                    </div>

                    {athleteVerificationMethod === 'CF' ? (
                      <div>
                        <input
                          type="text"
                          placeholder="Inserisci il Codice Fiscale dell'atleta"
                          value={athleteVerificationInput}
                          onChange={(e) => setAthleteVerificationInput(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 uppercase font-mono tracking-wider focus:border-blue-900 outline-none"
                          autoFocus
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Puoi inserire anche solo le ultime 6 cifre/lettere del Codice Fiscale
                        </span>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="date"
                          value={athleteVerificationInput}
                          onChange={(e) => setAthleteVerificationInput(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-blue-900 outline-none"
                          autoFocus
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.99] shadow-xs"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verifica Identità e Procedi al Ripristino</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </form>
            ) : (
              /* FASE 2: Identità verificata, reimposta PIN o visualizza */
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold">
                        {selectedAthlete?.cognome} {selectedAthlete?.nome}
                      </div>
                      <div className="text-[10px] text-emerald-700">
                        Squadra: {selectedAthlete?.squadra} • Identità confermata
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAthleteVerified(false);
                      setRevealedCurrentPin(null);
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Cambia atleta
                  </button>
                </div>

                {/* Opzione 1: Reimposta nuovo PIN */}
                <form onSubmit={handleSaveAthleteNewPassword} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-900" />
                    <span>Imposta Nuovo PIN o Password</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Nuovo PIN:
                      </label>
                      <div className="relative">
                        <input
                          type={showAthleteNewPassword ? 'text' : 'password'}
                          placeholder="es. 4 cifre o parola"
                          value={athleteNewPassword}
                          onChange={(e) => setAthleteNewPassword(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none focus:border-blue-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAthleteNewPassword(!showAthleteNewPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showAthleteNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Conferma Nuovo PIN:
                      </label>
                      <input
                        type={showAthleteNewPassword ? 'text' : 'password'}
                        placeholder="Ripeti nuovo PIN"
                        value={athleteConfirmPassword}
                        onChange={(e) => setAthleteConfirmPassword(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none focus:border-blue-900"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-900 hover:bg-blue-800 text-white py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Salva Nuovo PIN</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetToDefaultAthletePin}
                      className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 py-2 px-3 rounded-xl font-semibold text-xs transition cursor-pointer flex items-center gap-1"
                      title="Reimposta sul PIN iniziale (1234)"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Usa PIN Base (1234)</span>
                    </button>
                  </div>
                </form>

                {/* Opzione 2: Visualizza PIN registrato */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px]">Oppure visualizza il PIN attualmente memorizzato:</span>
                    {revealedCurrentPin && (
                      <div className="text-xs font-bold text-blue-900 font-mono mt-0.5">
                        PIN Attuale: <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{revealedCurrentPin}</span>
                      </div>
                    )}
                  </div>
                  {!revealedCurrentPin ? (
                    <button
                      type="button"
                      onClick={() => setRevealedCurrentPin(selectedAthlete?.password || '1234')}
                      className="text-xs font-bold text-blue-900 hover:underline cursor-pointer"
                    >
                      Mostra PIN
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRevealedCurrentPin(null)}
                      className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Nascondi
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Supporto WhatsApp Segreteria */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-400 text-[11px]">Problemi o non ricordi i dati?</span>
              <a
                href={waAthleteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold text-xs bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Richiedi PIN su WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* TAB 2: RECUPERO STAFF & DIRIGENZA */}
        {activeTab === 'STAFF' && (
          <div className="mt-5 space-y-4">
            <div className="bg-red-50/60 rounded-xl p-3 border border-red-200 text-xs text-red-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span>Recupero Credenziali Staff & Dirigenza</span>
              </div>
              <p className="text-[11px] text-red-900/80 leading-relaxed">
                Inserisci l'indirizzo email con cui ti sei registrato o con cui accedi al gestionale societario.
              </p>
            </div>

            {staffError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">{staffError}</span>
              </div>
            )}

            {staffSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs leading-relaxed">{staffSuccess}</span>
                  {verifiedStaffUser && onStaffPasswordReset && (
                    <div className="pt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onStaffPasswordReset(verifiedStaffUser, true);
                          onClose();
                        }}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Accedi Subito al Pannello Staff</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!staffVerified ? (
              /* FASE 1: Verifica email e cognome */
              <form onSubmit={handleVerifyStaff} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Account Staff:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="es. segreteria@asdgrumo.it"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-red-600 outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Conferma Cognome o Codice Societario:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Il tuo Cognome (oppure codice 'GRUMO')"
                    value={staffVerificationSurname}
                    onChange={(e) => setStaffVerificationSurname(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-red-600 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Richiesto a tutela della riservatezza dei dati societari
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.99] shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verifica Account Staff</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              /* FASE 2: Imposta nuova password staff */
              <form onSubmit={handleSaveStaffNewPassword} className="space-y-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-950 flex items-center justify-between">
                  <div>
                    <div className="font-bold">
                      {verifiedStaffUser?.nome} {verifiedStaffUser?.cognome}
                    </div>
                    <div className="text-[10px] text-red-700">
                      Ruolo: {verifiedStaffUser?.ruolo} • {verifiedStaffUser?.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStaffVerified(false)}
                    className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Cambia email
                  </button>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-red-600" />
                    <span>Imposta la Nuova Password</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Nuova Password:
                      </label>
                      <div className="relative">
                        <input
                          type={showStaffNewPassword ? 'text' : 'password'}
                          placeholder="Minimo 4 caratteri"
                          value={staffNewPassword}
                          onChange={(e) => setStaffNewPassword(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none focus:border-red-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowStaffNewPassword(!showStaffNewPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showStaffNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Conferma Password:
                      </label>
                      <input
                        type={showStaffNewPassword ? 'text' : 'password'}
                        placeholder="Ripeti nuova password"
                        value={staffConfirmPassword}
                        onChange={(e) => setStaffConfirmPassword(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none focus:border-red-600"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.99] shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Salva Nuova Password Staff</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>ASD Grumo Volley • Sicurezza & Privacy</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
