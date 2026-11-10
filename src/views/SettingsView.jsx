import React, { useState, useRef } from 'react';
import { useChits } from '../context/ChitContext';
import {
  Settings,
  Shield,
  KeyRound,
  Globe,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Building,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Laptop
} from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const SettingsView = () => {
  const {
    data,
    updatePin,
    setLanguage,
    exportBackupJSON,
    importBackupJSON,
    reloadDemoData,
    clearAllData,
    triggerInstallPrompt,
    isInstalled,
    showToast,
    t
  } = useChits();

  // PIN Form State
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');

  // Confirmation modal states
  const [confirmReloadOpen, setConfirmReloadOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const fileInputRef = useRef(null);

  const handlePinChangeSubmit = (e) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    if (currentPinInput !== data.settings.pin) {
      setPinError('Current PIN is incorrect.');
      return;
    }

    if (!/^\d{4}$/.test(newPinInput)) {
      setPinError('New PIN must be exactly 4 digits.');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinError('New PIN and confirmation do not match.');
      return;
    }

    updatePin(newPinInput);
    setPinSuccess('PIN updated successfully!');
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const success = importBackupJSON(content);
        if (success && fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="page-container">
      {/* Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {t('settingsTitle')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          {t('settingsSubtitle')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {/* Device & Platform Support (Windows & Android) */}
        <div className="card" style={{ borderColor: 'var(--border-highlight)' }}>
          <div className="card-header">
            <div className="card-title">
              <Smartphone size={19} color="var(--gold-400)" />
              <span>Windows & Android Mobile</span>
            </div>
            <span style={{ fontSize: '0.72rem', background: 'var(--gold-glow)', color: 'var(--gold-400)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
              PWA READY
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
            3KS Chits is engineered for seamless operation on <strong>Android phones</strong> (as a standalone installed app) and <strong>Windows PCs</strong> (with full keyboard shortcuts).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-md)' }}>
              <Smartphone size={22} color="#34d399" />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Android Mobile Experience</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bottom navigation, touch gestures, offline caching, and 1-tap WhatsApp reminders.</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-md)' }}>
              <Laptop size={22} color="var(--cyan-500)" />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Windows Desktop Experience</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High-density widescreen layouts, CSV/Excel downloads, and <code style={{ color: 'var(--gold-400)' }}>Ctrl+L</code> lock shortcut.</div>
              </div>
            </div>
          </div>

          {!isInstalled ? (
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={triggerInstallPrompt}
            >
              <Smartphone size={16} />
              <span>Install 3KS Chits App (Phone / PC)</span>
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.85rem', fontWeight: 600, padding: '0.5rem 0' }}>
              <CheckCircle2 size={18} />
              <span>App is already installed and running standalone!</span>
            </div>
          )}
        </div>

        {/* Security PIN Settings */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Shield size={19} color="var(--gold-400)" />
              <span>{t('securityPin')}</span>
            </div>
          </div>

          <form onSubmit={handlePinChangeSubmit}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              Protect your chit records with a 4-digit numeric PIN. Current default PIN is <strong>{data.settings.pin}</strong>.
            </p>

            {pinError && (
              <div style={{ color: 'var(--rose-500)', fontSize: '0.82rem', marginBottom: '1rem', fontWeight: 600 }}>
                {pinError}
              </div>
            )}

            {pinSuccess && (
              <div style={{ color: '#34d399', fontSize: '0.82rem', marginBottom: '1rem', fontWeight: 600 }}>
                {pinSuccess}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{t('currentPin')}</label>
              <input
                type="password"
                maxLength={4}
                className="form-input"
                placeholder="4 digits"
                value={currentPinInput}
                onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">{t('newPin')}</label>
                <input
                  type="password"
                  maxLength={4}
                  className="form-input"
                  placeholder="4 digits"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('confirmPin')}</label>
                <input
                  type="password"
                  maxLength={4}
                  className="form-input"
                  placeholder="4 digits"
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              <KeyRound size={16} />
              <span>{t('savePin')}</span>
            </button>
          </form>
        </div>

        {/* Language Selection */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Globe size={19} color="var(--gold-400)" />
              <span>{t('languageSetting')}</span>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
            Choose the language for the user interface, labels, tables, and WhatsApp reminder templates.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* English option */}
            <div
              onClick={() => setLanguage('en')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                border: data.settings.language === 'en' ? '2px solid var(--gold-400)' : '1px solid var(--border-color)',
                background: data.settings.language === 'en' ? 'var(--gold-glow)' : 'rgba(15, 23, 42, 0.6)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>English</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Standard English interface</div>
              </div>
              {data.settings.language === 'en' && <CheckCircle2 size={20} color="var(--gold-400)" />}
            </div>

            {/* Telugu option */}
            <div
              onClick={() => setLanguage('te')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                border: data.settings.language === 'te' ? '2px solid var(--gold-400)' : '1px solid var(--border-color)',
                background: data.settings.language === 'te' ? 'var(--gold-glow)' : 'rgba(15, 23, 42, 0.6)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-telugu)' }}>తెలుగు (Telugu)</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>పూర్తి తెలుగు అనువాదం మరియు వాట్సాప్ సందేశాలు</div>
              </div>
              {data.settings.language === 'te' && <CheckCircle2 size={20} color="var(--gold-400)" />}
            </div>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Download size={19} color="var(--gold-400)" />
              <span>{t('backupSection')}</span>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
            {t('backupDesc')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Backup Button */}
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={exportBackupJSON}
            >
              <Download size={16} />
              <span>{t('downloadBackup')}</span>
            </button>

            {/* Restore Button */}
            <div style={{ position: 'relative' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} />
                <span>{t('uploadBackup')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Reset & Sample Records */}
        <div className="card" style={{ borderColor: 'rgba(244, 63, 94, 0.25)' }}>
          <div className="card-header">
            <div className="card-title" style={{ color: 'var(--rose-500)' }}>
              <Trash2 size={19} />
              <span>{t('dangerZone')}</span>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
            {t('dangerDesc')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Reload Demo */}
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setConfirmReloadOpen(true)}
            >
              <RefreshCw size={16} />
              <span>{t('loadDemoData')}</span>
            </button>

            {/* Wipe all */}
          {/* Refresh All Data */}
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            onClick={() => { clearAllData(); reloadDemoData(); showToast('Data refreshed to default demo records'); }}
          >
            <RefreshCw size={16} />
            <span>Refresh All Data</span>
          </button>
            <button
              type="button"
              className="btn btn-danger"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setConfirmClearOpen(true)}
            >
              <Trash2 size={16} />
              <span>Refresh All Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={confirmReloadOpen}
        onClose={() => setConfirmReloadOpen(false)}
        onConfirm={reloadDemoData}
        title="Reload Demo Data"
        message="This will reset all current groups, members, and payment records back to the initial sample records. Are you sure?"
      />

      <ConfirmationModal
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={clearAllData}
        title="Wipe All Records"
        message="WARNING: This will permanently delete all chit groups, members, and payment transactions. This cannot be undone."
      />
    </div>
  );
};
