import React from 'react';
import { useChits } from '../context/ChitContext';
import {
  LayoutDashboard,
  Layers,
  Users,
  Receipt,
  FileText,
  Settings,
  MessageCircle,
  Lock,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { data, activeTab, setActiveTab, lockApp, t } = useChits();

  const pendingProofs = (data.whatsappMessages || []).filter((m) => m.status === 'Pending').length;

  const navItems = [
    {
      id: 'dashboard',
      label: t('navDashboard'),
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'groups',
      label: t('navGroups'),
      icon: Layers,
      badge: data.groups.length
    },
    {
      id: 'members',
      label: t('navMembers'),
      icon: Users,
      badge: data.members.length
    },
    {
      id: 'payments',
      label: t('navPayments'),
      icon: Receipt,
      badge: null
    },
    {
      id: 'whatsapp',
      label: t('navWhatsApp'),
      icon: MessageCircle,
      badge: pendingProofs > 0 ? pendingProofs : null,
      badgeAlert: pendingProofs > 0
    },
    {
      id: 'reports',
      label: t('navReports'),
      icon: FileText,
      badge: null
    },
    {
      id: 'settings',
      label: t('navSettings'),
      icon: Settings,
      badge: null
    }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 10, 24, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 35
          }}
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/logo.jpg" alt="3KS Chits" className="sidebar-logo" />
          <div style={{ flex: 1 }}>
            <div className="brand-title">{t('appName')}</div>
            <div className="brand-subtitle">{t('appTagline')}</div>
          </div>
          {isOpen && (
            <button
              type="button"
              className="btn-icon"
              onClick={onClose}
              style={{ display: 'flex' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || 
              (item.id === 'groups' && activeTab === 'group-details') ||
              (item.id === 'members' && activeTab === 'member-details');

            return (
              <button
                key={item.id}
                type="button"
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {item.badge !== null && item.badge > 0 && (
                  <span
                    className="nav-badge"
                    style={item.badgeAlert ? { background: '#f59e0b', color: '#0b1120' } : {}}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={lockApp}
          >
            <Lock size={16} />
            <span>{t('lockApp')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
