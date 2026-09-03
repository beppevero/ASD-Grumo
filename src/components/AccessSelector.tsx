import React, { useState } from 'react';
import { Athlete, StaffRole, StaffUser, Match, Notice } from '../types';
import { NextMatchBanner } from './NextMatchBanner';
import { NoticeBoard } from './NoticeBoard';
import {
  authenticateAthlete,
  authenticateStaffUser,
  registerStaffUser,
  getStoredStaffUsers,
} from '../utils/storage';
import { LogoGrumo } from './LogoGrumo';
import {
  Users,
  ShieldCheck,
  Search,
  ArrowRight,
  LockKeyhole,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  HelpCircle,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';

interface AccessSelectorProps {
  athletes: Athlete[];
  matches: Match[];
  notices: Notice[];
  onSelectAthlete: (athleteId: string) => void;
  onOpenStaff: (staffUser?: StaffUser) => void;
}

export const AccessSelector: React.FC<AccessSelectorProps> = ({
  athletes,
  matches,
  notices,
  onSelectAthlete,
  onOpenStaff,
}) => {
  // Athlete login state
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  const [athleteSearchQuery, setAthleteSearchQuery] = useState<string>('');
  const [athletePassword, setAthletePassword] = useState<string>('');
  const [showAthletePassword, setShowAthletePassword] = useState<boolean>(false);
  const [athleteError, setAthleteError] = useState<string>('');

  // Staff login / registration state
  const [staffTab, setStaffTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  
  // Staff Login
  const [staffEmail, setStaffEmail] = useState<string>('');
  const [staffPassword, setStaffPassword] = useState<string>('');
  const [showStaffPassword, setShowStaffPassword] = useState<boolean>(false);
  const [staffLoginError, setStaffLoginError] = useState<string>('');

  // Staff Registration
  const [regNome, setRegNome] = useState<string>('');
  const [regCognome, setRegCognome] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regRuolo, setRegRuolo] = useState<StaffRole>('Dirigente');
  const [regTelefono, setRegTelefono] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regError, setRegError] = useState<string>('');
  const [regSuccess, setRegSuccess] = useState<string>('');

  // Filter athletes for the selector dropdown/search
  const filteredAthletes = athletes.filter((a) => {
    const q = athleteSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      a.nome.toLowerCase().includes(q) ||
      a.cognome.toLowerCase().includes(q) ||
      a.codiceFiscale.toLowerCase().includes(q) ||
      a.squadra.toLowerCase().includes(q)
    );
  });

  const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId);

  // Handle Athlete Login
  const handleAthleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAthleteError('');

    if (!selectedAthleteId) {
      setAthleteError('Seleziona il tuo profilo atleta dall\'elenco.');
      return;
    }

    const athlete = athletes.find((a) => a.id === selectedAthleteId);
    if (!athlete) {
      setAthleteError('Profilo atleta non trovato.');
      return;
    }

    if (!athletePassword.trim()) {
      setAthleteError('Inserisci la password o PIN personale.');
      return;
    }

    const isValid = authenticateAthlete(athlete, athletePassword);
    if (isValid) {
      onSelectAthlete(athlete.id);
    } else {
      setAthleteError(
        'Password o PIN non corretto. Per tutelare i dati personali e sanitari, l\'accesso è protetto. (PIN predefinito: 1234 oppure richiedilo alla segreteria ASD Grumo).'
      );
    }
  };

  // Handle Staff Login
  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffLoginError('');

    if (!staffEmail.trim() && !staffPassword.trim()) {
      setStaffLoginError('Inserisci la tua email e la password.');
      return;
    }

    const user = authenticateStaffUser(staffEmail, staffPassword);
    if (user) {
      onOpenStaff(user);
    } else {
      setStaffLoginError(
        'Credenziali non valide. Verifica email e password inserite.'
      );
    }
  };

  // Handle Staff Registration
  const handleStaffRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regNome.trim() || !regCognome.trim()) {
      setRegError('Inserisci nome e cognome.');
      return;
    }

    if (!regEmail.trim() || !regEmail.includes('@') || !regEmail.includes('.')) {
      setRegError('Inserisci un indirizzo email valido.');
      return;
    }

    if (regPassword.length < 4) {
      setRegError('La password deve contenere almeno 4 caratteri.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Le due password non corrispondono.');
      return;
    }

    const res = registerStaffUser({
      nome: regNome,
      cognome: regCognome,
      email: regEmail,
      ruolo: regRuolo,
      telefono: regTelefono,
      password: regPassword,
    });

    if (!res.success) {
      setRegError(res.error || 'Errore durante la registrazione.');
      return;
    }

    setRegSuccess(`Account registrato con successo per ${regNome} ${regCognome}! Accesso in corso...`);
    setTimeout(() => {
      onOpenStaff(res.user);
    }, 900);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-900 via-red-600 to-blue-900" />

        <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-slate-50 border border-slate-200 mb-4 shadow-2xs">
          <LogoGrumo size={72} />
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-blue-900 tracking-tight font-display">
          ASD GRUMO VOLLEY
        </h1>
        <p className="text-xs sm:text-sm font-bold text-red-600 uppercase tracking-widest mt-1">
          Portale Atleti & Comunicazioni Societarie
        </p>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mt-2.5 leading-relaxed">
          Piattaforma protetta e riservata per la gestione delle idoneità sportive, 
          quote associative e comunicazioni ufficiali della stagione 2026/2027.
        </p>
      </div>

      {/* 2. Bacheca Avvisi & Comunicazioni Ufficiali (Dirigenza e Staff) */}
      <NoticeBoard
        notices={notices}
        onOpenStaff={() => {
          const el = document.getElementById('staff-access-card');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* 3. Banner Prossimo Match */}
      <NextMatchBanner matches={matches} />

      {/* Access Cards Grid */}
      <div className="grid md:grid-cols-2 gap-5 sm:gap-6 items-start">
        {/* CARD 1: ACCESSO ATLETA / GENITORE (CON PASSWORD) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-blue-900/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center border border-blue-100">
                <Users className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 border border-blue-200">
                <LockKeyhole className="w-3 h-3 text-blue-900" />
                <span>Area Riservata Famiglie</span>
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Accesso Atleta / Famiglia
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Inserisci le tue credenziali per consultare la scadenza del certificato medico, le quote e confermare le convocazioni.
            </p>

            <form onSubmit={handleAthleteSubmit} className="mt-5 space-y-4">
              {/* Profile Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Seleziona il tuo Profilo Tesserato:
                </label>
                {athletes.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-500">
                    Nessun atleta registrato al momento. Accedi come Dirigenza/Staff per inserire i tesserati.
                  </div>
                ) : (
                  <>
                    <div className="relative mb-2">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Filtra per cognome o nome..."
                        value={athleteSearchQuery}
                        onChange={(e) => setAthleteSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8.5 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-900 outline-none transition"
                      />
                    </div>

                    <select
                      value={selectedAthleteId}
                      onChange={(e) => {
                        setSelectedAthleteId(e.target.value);
                        setAthleteError('');
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-900 focus:ring-2 focus:ring-blue-100 outline-none transition cursor-pointer"
                    >
                      <option value="">-- Seleziona il tuo nominativo --</option>
                      {filteredAthletes.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.cognome} {a.nome} • {a.squadra} (#{a.numeroMaglia || '•'})
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>

              {/* Password / PIN Input */}
              {selectedAthleteId && (
                <div className="space-y-1 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      2. Password / PIN Personale Atleta:
                    </label>
                    <span className="text-[10px] text-slate-400">PIN predefinito: 1234</span>
                  </div>

                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showAthletePassword ? 'text' : 'password'}
                      placeholder="Inserisci la password o PIN"
                      value={athletePassword}
                      onChange={(e) => {
                        setAthletePassword(e.target.value);
                        setAthleteError('');
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 focus:border-blue-900 focus:ring-2 focus:ring-blue-100 outline-none transition font-mono"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowAthletePassword(!showAthletePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showAthletePassword ? 'Nascondi password' : 'Mostra password'}
                    >
                      {showAthletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Error Box */}
              {athleteError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">{athleteError}</div>
                </div>
              )}

              {/* Privacy Notice */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1 font-semibold text-slate-700">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-900" />
                  <span>Protezione Dati Personali & Sanitari</span>
                </div>
                <p>
                  Per visualizzare la scheda è necessaria la password fornita dalla segreteria ASD Grumo all'atto dell'iscrizione.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!selectedAthleteId || athletes.length === 0}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition ${
                    selectedAthleteId && athletes.length > 0
                      ? 'bg-blue-900 hover:bg-blue-800 text-white cursor-pointer active:scale-[0.99]'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <LockKeyhole className="w-4 h-4" />
                  <span>Verifica Password & Accedi alla Scheda</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* CARD 2: PANNELLO DIRIGENZA / STAFF (LOGIN & REGISTRAZIONE CON EMAIL) */}
        <div
          id="staff-access-card"
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-red-600/40 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              
              {/* Tab Selector: Login vs Registrazione */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStaffTab('LOGIN');
                    setStaffLoginError('');
                    setRegError('');
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer text-xs flex items-center gap-1 ${
                    staffTab === 'LOGIN'
                      ? 'bg-white text-red-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Accedi</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStaffTab('REGISTER');
                    setStaffLoginError('');
                    setRegError('');
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer text-xs flex items-center gap-1 ${
                    staffTab === 'REGISTER'
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Registrati</span>
                </button>
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {staffTab === 'LOGIN' ? 'Accesso Dirigenza & Staff' : 'Registrazione Nuovo Membro Staff'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {staffTab === 'LOGIN'
                ? 'Area riservata alla segreteria, tecnici e dirigenti accompagnatori ASD Grumo.'
                : 'Crea il tuo account con la tua email per accedere al pannello di controllo societario.'}
            </p>

            {/* TAB 1: LOGIN STAFF */}
            {staffTab === 'LOGIN' ? (
              <form onSubmit={handleStaffLogin} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Membro Staff:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="es. segreteria@asdgrumo.it o la tua email"
                      value={staffEmail}
                      onChange={(e) => {
                        setStaffEmail(e.target.value);
                        setStaffLoginError('');
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password o PIN Staff:
                  </label>
                  <div className="relative">
                    <LockKeyhole className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showStaffPassword ? 'text' : 'password'}
                      placeholder="Password o PIN Staff"
                      value={staffPassword}
                      onChange={(e) => {
                        setStaffPassword(e.target.value);
                        setStaffLoginError('');
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffPassword(!showStaffPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showStaffPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {staffLoginError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-[11px]">{staffLoginError}</div>
                  </div>
                )}

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Accedi al Pannello Staff</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-between text-[11px] pt-1 px-1">
                    <button
                      type="button"
                      onClick={() => {
                        setStaffEmail('segreteria@asdgrumo.it');
                        setStaffPassword('1234');
                        const user = authenticateStaffUser('segreteria@asdgrumo.it', '1234');
                        if (user) onOpenStaff(user);
                      }}
                      className="text-blue-900 hover:text-blue-700 font-semibold underline cursor-pointer"
                    >
                      Accesso rapido Segreteria
                    </button>

                    <button
                      type="button"
                      onClick={() => setStaffTab('REGISTER')}
                      className="text-slate-500 hover:text-red-600 font-medium cursor-pointer"
                    >
                      Non hai un account? Registrati
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* TAB 2: REGISTRAZIONE MEMBRO STAFF */
              <form onSubmit={handleStaffRegister} className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Nome:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="es. Giovanni"
                      value={regNome}
                      onChange={(e) => setRegNome(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Cognome:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="es. De Santis"
                      value={regCognome}
                      onChange={(e) => setRegCognome(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-red-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Email per l'accesso (personale o societaria):
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="es. giovanni.desantis@asdgrumo.it"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Ruolo Societario:
                    </label>
                    <select
                      value={regRuolo}
                      onChange={(e) => setRegRuolo(e.target.value as StaffRole)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-red-600 cursor-pointer"
                    >
                      <option value="Dirigente">Dirigente Accompagnatore</option>
                      <option value="Allenatore">Allenatore / Coach</option>
                      <option value="Segreteria">Segreteria Amministrativa</option>
                      <option value="Presidente">Presidente / Direttivo</option>
                      <option value="Staff Tecnico">Staff Tecnico / Medico</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Telefono (facoltativo):
                    </label>
                    <input
                      type="tel"
                      placeholder="es. 340 1234567"
                      value={regTelefono}
                      onChange={(e) => setRegTelefono(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Crea Password:
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Minimo 4 caratteri"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Conferma Password:
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Ripeti la password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-red-600"
                    />
                  </div>
                </div>

                {regError && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-[11px]">{regError}</div>
                  </div>
                )}

                {regSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="text-[11px] font-semibold">{regSuccess}</div>
                  </div>
                )}

                <div className="pt-2 space-y-1.5">
                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Completa Registrazione ed Accedi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStaffTab('LOGIN')}
                    className="w-full text-center text-[11px] text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  >
                    Hai già un account? Torna al Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
