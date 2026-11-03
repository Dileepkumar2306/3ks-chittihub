import React, { useState } from 'react';
import { useChits } from '../context/ChitContext';
import { Lock, Delete, ShieldCheck, KeyRound } from 'lucide-react';

export const PinLockModal = () => {
  const { verifyPin, resetPinToDefault, t } = useChits();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (digit) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        setTimeout(() => {
          const success = verifyPin(nextPin);
          if (!success) {
            setError(true);
            setPin('');
          }
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div className="pin-screen-container">
      <div className={`pin-box ${error ? 'shake' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <img
            src="/logo.jpg"
            alt="3KS Chits"
            style={{
              width: '85px',
              height: '85px',
              borderRadius: '20px',
              border: '2px solid var(--gold-400)',
              boxShadow: 'var(--shadow-gold)'
            }}
          />
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          {t('appName')}
        </h2>
        <p style={{ color: 'var(--gold-400)', fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          {t('appTagline')}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          <Lock size={16} color="var(--gold-400)" />
          <span>{t('enterPin')}</span>
        </div>

        {/* 4 Dot Indicators */}
        <div className="pin-dots">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`pin-dot ${pin.length > index ? 'filled' : ''} ${error ? 'error' : ''}`}
            />
          ))}
        </div>

        {error && (
          <div style={{ color: 'var(--rose-500)', fontSize: '0.82rem', marginBottom: '1rem', fontWeight: 600 }}>
            {t('wrongPin')}
          </div>
        )}

        {/* Keypad */}
        <div className="keypad-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              className="keypad-key"
              onClick={() => handleKeyPress(num.toString())}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            className="keypad-key"
            style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}
            onClick={handleClear}
          >
            C
          </button>
          <button
            type="button"
            className="keypad-key"
            onClick={() => handleKeyPress('0')}
          >
            0
          </button>
          <button
            type="button"
            className="keypad-key"
            onClick={handleBackspace}
          >
            <Delete size={20} />
          </button>
        </div>

        {/* Helper & Emergency Unlock */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <ShieldCheck size={14} color="var(--gold-400)" />
            <span>Authorized Admin Access • Secure 256-bit Protection</span>
          </div>

          <button
            type="button"
            onClick={resetPinToDefault}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.74rem',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <KeyRound size={12} />
            {t('forgotPin')}
          </button>
        </div>
      </div>
    </div>
  );
};
