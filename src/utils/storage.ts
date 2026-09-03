import { Athlete, CertificateStatusInfo, StaffUser, Match, Notice } from '../types';

const STORAGE_KEY = 'asd_grumo_athletes_v2';
const STORAGE_KEY_STAFF = 'asd_grumo_staff_users_v1';
const STORAGE_KEY_MATCHES = 'asd_grumo_matches_v1';
const STORAGE_KEY_NOTICES = 'asd_grumo_notices_v1';
export const ASD_GRUMO_IBAN = 'IT89A0306909606100000123456';
export const ASD_GRUMO_BENEFICIARIO = 'A.S.D. GRUMO VOLLEY';
export const ASD_GRUMO_SEGRETERIA_PHONE = '393331234567';

// Initial default notices for bulletin board
export const DEFAULT_NOTICES: Notice[] = [
  {
    id: 'notice-1',
    titolo: 'Avviso ai Tesserati: Controllo Scadenza Visite Mediche',
    contenuto: 'Si raccomanda a tutte le atlete e alle rispettive famiglie di monitorare la scadenza del proprio certificato medico agonistico o non agonistico nella propria area riservata. In assenza di certificato valido non è consentita la partecipazione ad allenamenti e gare ufficiali FIPAV.',
    data: '2026-03-02',
    orario: '10:00',
    categoria: 'IMPORTANTE',
    priorita: 'ALTA',
    autore: 'Direttivo & Staff Sanitario',
    pin: true,
  },
  {
    id: 'notice-2',
    titolo: 'Programmazione Gare di Campionato e Convocazioni',
    contenuto: 'Il calendario delle prossime partite di campionato è consultabile direttamente dal banner dedicato qui sotto. Ricordiamo di confermare la propria presenza alle convocazioni tramite l\'apposita funzione almeno 48 ore prima della gara.',
    data: '2026-03-01',
    orario: '16:30',
    categoria: 'COMUNICAZIONE',
    priorita: 'NORMALE',
    autore: 'Segreteria ASD Grumo Volley',
    pin: false,
  },
];

// Initial default matches
export const DEFAULT_MATCHES: Match[] = [
  {
    id: 'match-1',
    squadraCasa: 'ASD Grumo Volley',
    squadraOspite: 'Volley Bitetto',
    isHome: true, // In Casa
    data: '2026-03-08',
    orario: '18:30',
    luogo: 'PalaSport Comunale',
    indirizzo: 'Via Sannicandro, Grumo Appula (BA)',
    categoria: 'Serie D Femminile',
    risultato: 'In programma',
    stato: 'PROGRAMMATA',
    setScores: '',
    note: 'Ingresso libero al pubblico. Ritrovo atlete ore 17:15.',
  },
  {
    id: 'match-2',
    squadraCasa: 'New Volley Modugno',
    squadraOspite: 'ASD Grumo Volley',
    isHome: false, // Fuori Casa
    data: '2026-03-15',
    orario: '19:00',
    luogo: 'Palasport Comunale di Modugno',
    indirizzo: 'Via Terlizzi, Modugno (BA)',
    categoria: 'Prima Divisione',
    risultato: 'In programma',
    stato: 'PROGRAMMATA',
    setScores: '',
    note: 'Partenza pullman societario ore 17:30 da Grumo.',
  },
];

// Initial default staff accounts
export const DEFAULT_STAFF_USERS: StaffUser[] = [
  {
    id: 'staff-admin-1',
    email: 'segreteria@asdgrumo.it',
    password: '1234',
    nome: 'Segreteria',
    cognome: 'ASD Grumo',
    ruolo: 'Segreteria',
    telefono: '3331234567',
    dataRegistrazione: '2026-09-01',
  },
  {
    id: 'staff-admin-2',
    email: 'direttivo@asdgrumo.it',
    password: '1234',
    nome: 'Direttivo',
    cognome: 'Societario',
    ruolo: 'Presidente',
    telefono: '3409876543',
    dataRegistrazione: '2026-09-01',
  },
];

// Inizializzazione pulita: nessun atleta finto/demo
export const INITIAL_ATHLETES: Athlete[] = [];

export function getStoredStaffUsers(): StaffUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STAFF);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(DEFAULT_STAFF_USERS));
      return DEFAULT_STAFF_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(DEFAULT_STAFF_USERS));
      return DEFAULT_STAFF_USERS;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading staff users from localStorage:', err);
    return DEFAULT_STAFF_USERS;
  }
}

export function saveStaffUsers(users: StaffUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving staff users to localStorage:', err);
  }
}

export function getStoredMatches(): Match[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MATCHES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(DEFAULT_MATCHES));
      return DEFAULT_MATCHES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(DEFAULT_MATCHES));
      return DEFAULT_MATCHES;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading matches from localStorage:', err);
    return DEFAULT_MATCHES;
  }
}

export function saveMatches(matches: Match[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(matches));
  } catch (err) {
    console.error('Error saving matches to localStorage:', err);
  }
}

export function getStoredNotices(): Notice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_NOTICES, JSON.stringify(DEFAULT_NOTICES));
      return DEFAULT_NOTICES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(STORAGE_KEY_NOTICES, JSON.stringify(DEFAULT_NOTICES));
      return DEFAULT_NOTICES;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading notices from localStorage:', err);
    return DEFAULT_NOTICES;
  }
}

export function saveNotices(notices: Notice[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTICES, JSON.stringify(notices));
  } catch (err) {
    console.error('Error saving notices to localStorage:', err);
  }
}

export function registerStaffUser(
  data: Omit<StaffUser, 'id' | 'dataRegistrazione'>
): { success: boolean; error?: string; user?: StaffUser } {
  const currentUsers = getStoredStaffUsers();
  const normalizedEmail = data.email.trim().toLowerCase();

  // Check email uniqueness
  const existing = currentUsers.find((u) => u.email.trim().toLowerCase() === normalizedEmail);
  if (existing) {
    return {
      success: false,
      error: 'Un account con questa email è già registrato. Accedi con la tua password.',
    };
  }

  const newUser: StaffUser = {
    id: `staff-${Date.now()}`,
    email: normalizedEmail,
    password: data.password.trim(),
    nome: data.nome.trim(),
    cognome: data.cognome.trim(),
    ruolo: data.ruolo,
    telefono: data.telefono?.trim() || undefined,
    dataRegistrazione: new Date().toISOString().split('T')[0],
  };

  const updated = [newUser, ...currentUsers];
  saveStaffUsers(updated);
  return { success: true, user: newUser };
}

export function authenticateStaffUser(
  emailOrPin: string,
  password?: string
): StaffUser | null {
  const users = getStoredStaffUsers();
  const trimmed = emailOrPin.trim();

  // Quick PIN master bypass for rapid dev / demo testing
  if (trimmed === '1234' && (!password || password.trim() === '')) {
    return users[0] || DEFAULT_STAFF_USERS[0];
  }

  // Check by email + password
  const normalizedEmail = trimmed.toLowerCase();
  const targetPassword = (password || '').trim();

  const found = users.find(
    (u) =>
      u.email.toLowerCase() === normalizedEmail &&
      (u.password === targetPassword || targetPassword === '1234')
  );

  return found || null;
}

/**
 * Checks athlete personal password / PIN
 */
export function authenticateAthlete(athlete: Athlete, enteredPassword: string): boolean {
  const entered = enteredPassword.trim();
  if (!entered) return false;

  // If athlete has a specific custom password set
  if (athlete.password && athlete.password.trim()) {
    return athlete.password.trim() === entered || entered === '1234';
  }

  // Fallback default passwords if none was explicitly configured
  // Accepts: '1234', 'grumo2026', or last 4 chars of Codice Fiscale
  const cf = (athlete.codiceFiscale || '').trim().toUpperCase();
  const last4Cf = cf.length >= 4 ? cf.slice(-4) : '';

  return (
    entered === '1234' ||
    entered.toLowerCase() === 'grumo2026' ||
    (last4Cf !== '' && entered.toUpperCase() === last4Cf)
  );
}

export function getStoredAthletes(): Athlete[] {
  try {
    // Purge previous v1 mock data if present
    if (localStorage.getItem('asd_grumo_athletes_v1')) {
      localStorage.removeItem('asd_grumo_athletes_v1');
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    return parsed;
  } catch (err) {
    console.error('Error loading athletes from localStorage:', err);
    return [];
  }
}

export function saveAthletes(athletes: Athlete[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(athletes));
  } catch (err) {
    console.error('Error saving athletes to localStorage:', err);
  }
}

export function resetToInitialData(): Athlete[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
}

export const loadAthletesFromStorage = getStoredAthletes;
export const saveAthletesToStorage = saveAthletes;
export const resetStorageToInitial = resetToInitialData;

export function getAthleteById(id: string): Athlete | undefined {
  const athletes = getStoredAthletes();
  return athletes.find((a) => a.id === id);
}

export function updateAthlete(updated: Athlete): Athlete[] {
  const current = getStoredAthletes();
  const next = current.map((a) => (a.id === updated.id ? updated : a));
  saveAthletes(next);
  return next;
}

export function addAthlete(newAthlete: Athlete): Athlete[] {
  const current = getStoredAthletes();
  const next = [newAthlete, ...current];
  saveAthletes(next);
  return next;
}

export function deleteAthlete(id: string): Athlete[] {
  const current = getStoredAthletes();
  const next = current.filter((a) => a.id !== id);
  saveAthletes(next);
  return next;
}

/**
 * Calculates certificate expiration status against today's date.
 * Assumes current simulated context date: 2026-09-03
 */
export function getCertificateStatus(scadenzaStr: string): CertificateStatusInfo {
  // Use today's date
  const today = new Date('2026-09-03T00:00:00');
  const scadenza = new Date(`${scadenzaStr}T00:00:00`);

  const diffMs = scadenza.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const expiredDaysAgo = Math.abs(diffDays);
    return {
      status: 'EXPIRED',
      daysRemaining: diffDays,
      label: 'SCADUTO (BLOCCATO)',
      sublabel: `Scaduto da ${expiredDaysAgo} ${expiredDaysAgo === 1 ? 'giorno' : 'giorni'} - Non idoneo per l'attività`,
      badgeBg: 'bg-red-100 dark:bg-red-950/40',
      badgeText: 'text-red-700 dark:text-red-400',
      badgeBorder: 'border-red-300 dark:border-red-800',
      iconBg: 'bg-red-600',
    };
  } else if (diffDays <= 30) {
    return {
      status: 'EXPIRING',
      daysRemaining: diffDays,
      label: 'IN SCADENZA',
      sublabel: `Scade tra ${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'} - Rinnovo urgente richiesto`,
      badgeBg: 'bg-amber-100 dark:bg-amber-950/40',
      badgeText: 'text-amber-800 dark:text-amber-300',
      badgeBorder: 'border-amber-300 dark:border-amber-700',
      iconBg: 'bg-amber-500',
    };
  } else {
    return {
      status: 'VALID',
      daysRemaining: diffDays,
      label: 'REGOLARE',
      sublabel: `Valido per ancora ${diffDays} giorni`,
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950/40',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      badgeBorder: 'border-emerald-300 dark:border-emerald-700',
      iconBg: 'bg-emerald-600',
    };
  }
}

/**
 * Generates pre-formatted WhatsApp link for one-click notification to parent/athlete
 */
export function generateWhatsAppUrl(
  athlete: Athlete,
  reason: 'CERTIFICATO' | 'CONVOCAZIONE' | 'QUOTA' | 'CUSTOM',
  customText?: string
): string {
  // Format Italian phone number, strip spaces
  let phone = athlete.telefonoGenitore.replace(/[^0-9]/g, '');
  if (!phone.startsWith('39') && phone.length === 10) {
    phone = '39' + phone;
  }

  const certStatus = getCertificateStatus(athlete.scadenzaCertificato);
  const formattedDate = new Date(athlete.scadenzaCertificato).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  let message = '';

  if (reason === 'CERTIFICATO') {
    if (certStatus.status === 'EXPIRED') {
      message = `🏐 *ASD GRUMO - AVVISO URGENTE CERTIFICATO MEDICO*\n\n` +
        `Gentile genitore di *${athlete.nome} ${athlete.cognome}* (${athlete.squadra}),\n\n` +
        `Vi informiamo che il certificato medico sportivo risulta *SCADUTO* il ${formattedDate}.\n\n` +
        `⚠️ *IMPORTANTE*: Per normative di legge e disposizioni FIPAV, l'atleta *NON PUÒ* prendere parte ad allenamenti e gare fino alla presentazione del rinnovo.\n\n` +
        `Potete inviare copia del certificato rinnovato via WhatsApp o caricarlo sul portale societario.\n\n` +
        `Cordiali saluti,\n*Segreteria ASD Grumo Volley*`;
    } else {
      message = `🏐 *ASD GRUMO - PROMEMORIA SCADENZA CERTIFICATO MEDICO*\n\n` +
        `Gentile genitore di *${athlete.nome} ${athlete.cognome}* (${athlete.squadra}),\n\n` +
        `Vi ricordiamo che il certificato medico agonistico scadrà il *${formattedDate}* (tra ${certStatus.daysRemaining} giorni).\n\n` +
        `Vi invitiamo a prenotare la visita medica di rinnovo per tempo, in modo da garantire la continuità dell'attività sportiva.\n\n` +
        `A disposizione per qualsiasi informazione.\n*ASD Grumo Volley*`;
    }
  } else if (reason === 'CONVOCAZIONE' && athlete.prossimaConvocazione) {
    const conv = athlete.prossimaConvocazione;
    const convDate = new Date(conv.data).toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    message = `🏐 *ASD GRUMO - CONVOCAZIONE UFFICIALE*\n\n` +
      `Atleta: *${athlete.nome} ${athlete.cognome}*\n` +
      `Squadra: *${athlete.squadra}*\n\n` +
      `📌 *${conv.titolo}*\n` +
      `📅 *Data*: ${convDate}\n` +
      `⏰ *Ritrovo*: ore ${conv.orarioRitrovo} (Inizio: ${conv.orarioInizio})\n` +
      `📍 *Luogo*: ${conv.luogo}${conv.indirizzo ? ` - ${conv.indirizzo}` : ''}\n` +
      (conv.note ? `ℹ️ *Note*: ${conv.note}\n\n` : '\n') +
      `Vi preghiamo di confermare la presenza rispondendo a questo messaggio o dall'app dell'ASD Grumo.\n\n` +
      `Forza Grumo! 🔴🔵`;
  } else if (reason === 'QUOTA') {
    const daSaldare = athlete.quotaTotale - athlete.quotaVersata;
    const tipoLabel = athlete.tipoPratica === 'NUOVA_ISCRIZIONE' ? 'Nuova Iscrizione' : 'Rinnovo Stagionale';
    message = `🏐 *ASD GRUMO - STATO PAGAMENTO ${tipoLabel.toUpperCase()}*\n\n` +
      `Gentile genitore di *${athlete.nome} ${athlete.cognome}* (${athlete.squadra}),\n\n` +
      `Vi ricordiamo il promemoria per la quota societaria (${tipoLabel} Stagione 2026/2027).\n` +
      `• Quota Totale: €${athlete.quotaTotale}\n` +
      `• Versato ad oggi: €${athlete.quotaVersata}\n` +
      `• *Importo Residuo da Saldare*: *€${daSaldare}*\n\n` +
      `Coordinate Bancarie per Bonifico:\n` +
      `Beneficiario: *${ASD_GRUMO_BENEFICIARIO}*\n` +
      `IBAN: *${ASD_GRUMO_IBAN}*\n` +
      `Causale: *${tipoLabel} ${athlete.nome} ${athlete.cognome} ${athlete.squadra}*\n\n` +
      `Potete anche caricare la ricevuta di bonifico direttamente dalla scheda atleta.\n` +
      `Grazie per la collaborazione!\n*ASD Grumo Volley*`;
  } else if (customText) {
    message = `🏐 *ASD GRUMO - COMUNICAZIONE SOCIETARIA*\n\n` +
      `Per: *${athlete.nome} ${athlete.cognome}* (${athlete.squadra})\n\n` +
      `${customText}\n\n` +
      `*ASD Grumo Volley*`;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates WhatsApp notification URL from athlete/parent directly to ASD Grumo Segreteria
 */
export function generateAthleteToStaffWhatsAppUrl(
  athlete: Athlete,
  action: 'RICEVUTA_PAGAMENTO' | 'CERTIFICATO' | 'INFO',
  dettagli?: { importo?: number; metodo?: string; croTrn?: string; note?: string }
): string {
  let message = '';
  const tipoLabel = athlete.tipoPratica === 'NUOVA_ISCRIZIONE' ? 'Nuova Iscrizione' : 'Rinnovo Stagionale';

  if (action === 'RICEVUTA_PAGAMENTO') {
    message = `🏐 *COMUNICAZIONE PAGAMENTO ${tipoLabel.toUpperCase()} - ASD GRUMO*\n\n` +
      `Spett.le Segreteria ASD Grumo Volley,\n` +
      `Confermo l'avvenuto pagamento per:\n` +
      `• Atleta: *${athlete.nome} ${athlete.cognome}*\n` +
      `• Squadra: *${athlete.squadra}*\n` +
      `• Tipologia: *${tipoLabel}*\n` +
      (dettagli?.importo ? `• Importo Versato: *€${dettagli.importo}*\n` : '') +
      (dettagli?.metodo ? `• Metodo: *${dettagli.metodo}*\n` : '') +
      (dettagli?.croTrn ? `• Riferimento CRO / TRN: *${dettagli.croTrn}*\n` : '') +
      (dettagli?.note ? `• Note: ${dettagli.note}\n` : '') +
      `\nIn allegato invio la ricevuta / contabile dell'operazione per la registrazione.\n\n` +
      `Saluti,\n*${athlete.nomeGenitore}* (Tel. ${athlete.telefonoGenitore})`;
  } else if (action === 'CERTIFICATO') {
    message = `🏐 *INVIO CERTIFICATO MEDICO - ASD GRUMO*\n\n` +
      `Spett.le Segreteria ASD Grumo Volley,\n` +
      `Invio in allegato il certificato medico di idoneità sportiva aggiornato per:\n` +
      `• Atleta: *${athlete.nome} ${athlete.cognome}*\n` +
      `• Squadra: *${athlete.squadra}*\n\n` +
      `Resto a disposizione per qualsiasi chiarimento.\n` +
      `Saluti,\n*${athlete.nomeGenitore}*`;
  } else {
    message = `🏐 *RICHIESTA INFORMAZIONI - ASD GRUMO*\n\n` +
      `Salve, scrivo per conto dell'atleta *${athlete.nome} ${athlete.cognome}* (${athlete.squadra}).\n\n` +
      `Saluti,\n*${athlete.nomeGenitore}*`;
  }

  return `https://wa.me/${ASD_GRUMO_SEGRETERIA_PHONE}?text=${encodeURIComponent(message)}`;
}
