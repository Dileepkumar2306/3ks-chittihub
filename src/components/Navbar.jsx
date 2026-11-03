import React from 'react';
import { useChits } from '../context/ChitContext';
import { Menu, Lock, Globe, CheckCircle2, AlertCircle, Smartphone, MessageCircle } from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { data, activeTab, setActiveTab, setLanguage, lockApp, notification, triggerInstallPrompt, isInstalled, t } = useChits();

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return t('navDashboard');
      case 'groups':
      case 'group-details':
        return t('navGroups');
      case 'members':
      case 'member-details':
        return t('navMembers');
      case 'payments':
        return t('navPayments');
      case 'whatsapp':
        return t('navWhatsApp');
      case 'reports':
        return t('navReports');
      case 'settings':
        return t('navSettings');
      default:
        return t('navDashboard');
    }
  };

  const toggleLang = () => {
    const nextLang = data.settings.language === 'en' ? 'te' : 'en';
    setLanguage(nextLang);
  };

  return (
    <>
      <header className="app-navbar">
        <div className="navbar-left">
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle menu"
          >
            <Menu size={22} />
          </button>

          <div className="page-breadcrumb">
            <span className="breadcrumb-path">3KS Chits / Admin</span>
            <h1 className="breadcrumb-title">{getPageTitle()}</h1>
          </div>
        </div>

        <div className="navbar-right">
          {/* Quick WhatsApp Chit Hub */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('whatsapp')}
            title="Open WhatsApp Chit Hub"
            style={{
              borderColor: 'rgba(37, 211, 102, 0.4)',
              color: '#25d366',
              background: 'rgba(37, 211, 102, 0.08)'
            }}
          >
            <MessageCircle size={15} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>WhatsApp</span>
          </button>

          {/* Install App for Android / Windows */}
          {!isInstalled && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={triggerInstallPrompt}
              title="Install 3KS Chits on Android / Windows"
              style={{ borderColor: 'var(--gold-400)', color: 'var(--gold-400)' }}
            >
              <Smartphone size={15} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Install App</span>
            </button>
          )}

          {/* Language Switcher */}
          <button
            type="button"
            className="lang-toggle-btn"
            onClick={toggleLang}
            title="Switch Language"
          >
            <Globe size={15} />
            <span>{data.settings.language === 'en' ? 'తెలుగు' : 'English'}</span>
          </button>

          {/* Quick Lock */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={lockApp}
            title={`${t('lockApp')} (Ctrl+L)`}
          >
            <Lock size={15} />
            <span className="kbd-badge" style={{ display: 'none', md: 'inline-flex' }}>Ctrl+L</span>
          </button>
        </div>
      </header>

      {/* Floating Toast Notification Banner */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '12px',
            background: notification.type === 'error' ? 'var(--rose-500)' : 'var(--emerald-500)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: 'var(--shadow-lg)',
            animation: 'slideUp 0.25s ease'
          }}
        >
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notification.message}</span>
        </div>
      )}
    </>
  );
};
