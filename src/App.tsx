import React, { useState, useEffect } from 'react';
import { Athlete, StaffUser, Match, Notice } from './types';
import {
  loadAthletesFromStorage,
  saveAthletesToStorage,
  resetStorageToInitial,
  getStoredMatches,
  saveMatches,
  getStoredNotices,
  saveNotices,
} from './utils/storage';
import { Header } from './components/Header';
import { AccessSelector } from './components/AccessSelector';
import { AthleteView } from './components/AthleteView';
import { StaffDashboard } from './components/StaffDashboard';
import { AddAthleteModal } from './components/AddAthleteModal';
import { BroadcastModal } from './components/BroadcastModal';
import { WifiOff, Heart } from 'lucide-react';

export default function App() {
  const [athletes, setAthletes] = useState<Athlete[]>(() => loadAthletesFromStorage());
  const [matches, setMatches] = useState<Match[]>(() => getStoredMatches());
  const [notices, setNotices] = useState<Notice[]>(() => getStoredNotices());
  const [currentView, setCurrentView] = useState<'SELECTOR' | 'ATHLETE' | 'STAFF'>('SELECTOR');
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [currentStaffUser, setCurrentStaffUser] = useState<StaffUser | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  // Offline status
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync with localStorage
  const handleUpdateAthlete = (updated: Athlete) => {
    const newAthletes = athletes.map((a) => (a.id === updated.id ? updated : a));
    setAthletes(newAthletes);
    saveAthletesToStorage(newAthletes);
  };

  const handleAddAthlete = (newAthlete: Athlete) => {
    const newAthletes = [newAthlete, ...athletes];
    setAthletes(newAthletes);
    saveAthletesToStorage(newAthletes);
  };

  const handleDeleteAthlete = (id: string) => {
    const newAthletes = athletes.filter((a) => a.id !== id);
    setAthletes(newAthletes);
    saveAthletesToStorage(newAthletes);
    if (selectedAthleteId === id) {
      setSelectedAthleteId(null);
      setCurrentView('STAFF');
    }
  };

  const handleSendMessage = (
    targetType: 'ALL' | 'TEAM' | 'SINGLE',
    targetId: string,
    title: string,
    text: string,
    isUrgent: boolean
  ) => {
    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      data: new Date().toLocaleDateString('it-IT'),
      titolo: title,
      testo: text,
      letto: false,
      urgente: isUrgent,
      mittente: 'Direzione ASD Grumo',
    };

    const newAthletes = athletes.map((a) => {
      let matches = false;
      if (targetType === 'ALL') matches = true;
      else if (targetType === 'TEAM' && a.squadra === targetId) matches = true;
      else if (targetType === 'SINGLE' && a.id === targetId) matches = true;

      if (matches) {
        return {
          ...a,
          messaggiPersonali: [newMessage, ...a.messaggiPersonali],
        };
      }
      return a;
    });

    setAthletes(newAthletes);
    saveAthletesToStorage(newAthletes);
    alert('Avviso inviato con successo!');
  };

  const handleResetData = () => {
    if (
      confirm(
        'Vuoi azzerare il database dell\'ASD Grumo e rimuovere tutti i dati inseriti?'
      )
    ) {
      const fresh = resetStorageToInitial();
      setAthletes(fresh);
      setSelectedAthleteId(null);
      setCurrentView('SELECTOR');
    }
  };

  // Matches Handlers
  const handleAddMatch = (newMatchData: Omit<Match, 'id'>) => {
    const newMatch: Match = {
      ...newMatchData,
      id: `match-${Date.now()}`,
    };
    const updated = [newMatch, ...matches];
    setMatches(updated);
    saveMatches(updated);
  };

  const handleUpdateMatch = (updatedMatch: Match) => {
    const updated = matches.map((m) => (m.id === updatedMatch.id ? updatedMatch : m));
    setMatches(updated);
    saveMatches(updated);
  };

  const handleDeleteMatch = (matchId: string) => {
    const updated = matches.filter((m) => m.id !== matchId);
    setMatches(updated);
    saveMatches(updated);
  };

  const handleAddNotice = (newNoticeData: Omit<Notice, 'id'>) => {
    const newNotice: Notice = {
      ...newNoticeData,
      id: `notice-${Date.now()}`,
    };
    const updated = [newNotice, ...notices];
    setNotices(updated);
    saveNotices(updated);
  };

  const handleUpdateNotice = (updatedNotice: Notice) => {
    const updated = notices.map((n) => (n.id === updatedNotice.id ? updatedNotice : n));
    setNotices(updated);
    saveNotices(updated);
  };

  const handleDeleteNotice = (noticeId: string) => {
    const updated = notices.filter((n) => n.id !== noticeId);
    setNotices(updated);
    saveNotices(updated);
  };

  const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-blue-900 selection:text-white font-sans">
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-xs font-semibold px-4 py-2 text-center flex items-center justify-center gap-2 shadow-xs">
          <WifiOff className="w-4 h-4" />
          <span>
            Sei in modalità offline. Tutti i dati restano salvati in locale sul dispositivo.
          </span>
        </div>
      )}

      {/* Persistent App Header */}
      <Header
        currentRole={
          currentView === 'ATHLETE'
            ? 'ATHLETE'
            : currentView === 'STAFF'
            ? 'STAFF'
            : null
        }
        athleteName={selectedAthlete ? `${selectedAthlete.nome} ${selectedAthlete.cognome}` : undefined}
        staffUser={currentStaffUser}
        onLogout={() => {
          setSelectedAthleteId(null);
          setCurrentStaffUser(null);
          setCurrentView('SELECTOR');
        }}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentView === 'SELECTOR' && (
          <AccessSelector
            athletes={athletes}
            matches={matches}
            notices={notices}
            onSelectAthlete={(id) => {
              setSelectedAthleteId(id);
              setCurrentView('ATHLETE');
            }}
            onOpenStaff={(user) => {
              setCurrentStaffUser(user || null);
              setCurrentView('STAFF');
            }}
            onUpdateAthlete={handleUpdateAthlete}
          />
        )}

        {currentView === 'ATHLETE' && selectedAthlete && (
          <AthleteView
            athlete={selectedAthlete}
            onUpdateAthlete={handleUpdateAthlete}
            onBack={() => {
              setSelectedAthleteId(null);
              setCurrentView('SELECTOR');
            }}
          />
        )}

        {currentView === 'STAFF' && (
          <StaffDashboard
            athletes={athletes}
            matches={matches}
            onAddMatch={handleAddMatch}
            onUpdateMatch={handleUpdateMatch}
            onDeleteMatch={handleDeleteMatch}
            notices={notices}
            onAddNotice={handleAddNotice}
            onUpdateNotice={handleUpdateNotice}
            onDeleteNotice={handleDeleteNotice}
            currentStaffUser={currentStaffUser}
            onUpdateAthlete={handleUpdateAthlete}
            onDeleteAthlete={handleDeleteAthlete}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
            onSelectAthleteForView={(id) => {
              setSelectedAthleteId(id);
              setCurrentView('ATHLETE');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 space-y-1.5">
        <div className="font-bold text-slate-700 flex items-center justify-center gap-2">
          <span className="text-blue-900 tracking-tight font-display text-base">ASD GRUMO VOLLEY</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Piattaforma PWA per la gestione societaria, monitoraggio scadenze mediche e tutela sanitaria FIPAV.
        </p>
      </footer>

      {/* Modals */}
      <AddAthleteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddAthlete}
      />

      <BroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        athletes={athletes}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
