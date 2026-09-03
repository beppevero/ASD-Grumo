export type CertificateState = 'VALID' | 'EXPIRING' | 'EXPIRED';

export type TipoPratica = 'NUOVA_ISCRIZIONE' | 'RINNOVO_STAGIONALE';

export type StatoPagamento = 'SALDATO' | 'ACCONTO_VERSATO' | 'DA_SALDARE' | 'IN_VERIFICA';

export interface RicevutaPagamento {
  caricata: boolean;
  dataCaricamento?: string; // YYYY-MM-DD
  nomeFile?: string;
  importo?: number;
  metodo?: 'Bonifico Bancario' | 'Contanti' | 'POS / Carta' | 'Altro';
  note?: string;
  croTrn?: string;
  verificata?: boolean;
}

export interface PersonalMessage {
  id: string;
  data: string;
  titolo: string;
  testo: string;
  letto: boolean;
  urgente?: boolean;
  mittente?: string;
}

export interface Convocazione {
  id: string;
  titolo: string;
  tipo: 'PARTITA' | 'ALLENAMENTO' | 'TORNEO';
  avversario?: string;
  data: string; // ISO YYYY-MM-DD
  orarioRitrovo: string;
  orarioInizio: string;
  luogo: string;
  indirizzo?: string;
  note?: string;
  risposta?: 'CONFERMATO' | 'ASSENTE' | 'IN_ATTESA';
  motivoAssenza?: string;
  dataRisposta?: string;
}

export interface Athlete {
  id: string;
  nome: string;
  cognome: string;
  codiceFiscale: string;
  dataNascita: string;
  squadra: string;
  numeroMaglia: number;
  ruolo: string;
  telefonoGenitore: string;
  nomeGenitore: string;
  emailGenitore: string;
  scadenzaCertificato: string; // YYYY-MM-DD
  tipoCertificato: 'Agonistico B1' | 'Non Agonistico';
  certificatoCaricato?: boolean;
  certificatoFileName?: string;
  password?: string; // Password / PIN personale per accesso riservato alla scheda atleta
  
  // Quota e Pagamento Rinnovo / Iscrizione
  tipoPratica?: TipoPratica;
  stagioneSportiva?: string;
  statoQuota: 'REGOLARE' | 'SECONDA_RATA_ATTESA' | 'IN_SOSPESO' | 'IN_VERIFICA';
  statoPagamento?: StatoPagamento;
  quotaTotale: number;
  quotaVersata: number;
  ricevutaPagamento?: RicevutaPagamento;

  messaggiPersonali: PersonalMessage[];
  prossimaConvocazione?: Convocazione;
  noteMediche?: string;
  notePagamento?: string;
}

export type StaffRole = 'Dirigente' | 'Allenatore' | 'Segreteria' | 'Presidente' | 'Staff Tecnico';

export interface StaffUser {
  id: string;
  email: string;
  password: string;
  nome: string;
  cognome: string;
  ruolo: StaffRole;
  telefono?: string;
  dataRegistrazione: string;
}

export interface CertificateStatusInfo {
  status: CertificateState;
  daysRemaining: number;
  label: string;
  sublabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconBg: string;
}

export interface Match {
  id: string;
  squadraCasa: string;
  squadraOspite: string;
  isHome: boolean; // true se ASD Grumo gioca in casa, false se fuori casa
  data: string; // YYYY-MM-DD
  orario: string; // HH:mm
  luogo: string; // Nome palazzetto / palestra
  indirizzo?: string;
  categoria: string; // es. Serie D, Prima Divisione, Under 16, Under 14
  risultato?: string; // es. "In programma" o "3 - 1" o "2 - 3"
  stato: 'PROGRAMMATA' | 'IN_CORSO' | 'CONCLUSA';
  setScores?: string; // es. "25-21, 23-25, 25-18, 25-20"
  note?: string;
}

export interface Notice {
  id: string;
  titolo: string;
  contenuto: string;
  data: string; // YYYY-MM-DD
  orario?: string; // HH:mm
  categoria: 'IMPORTANTE' | 'COMUNICAZIONE' | 'ALLENAMENTI' | 'GARE' | 'EVENTI';
  priorita?: 'ALTA' | 'NORMALE';
  autore?: string; // es. "Direttivo ASD Grumo", "Staff Tecnico"
  pin?: boolean;
}

