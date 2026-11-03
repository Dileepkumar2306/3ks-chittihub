import React from 'react';
import { useChits } from '../context/ChitContext';
import { LayoutDashboard, Layers, Users, Receipt, MessageCircle, FileText, Settings } from 'lucide-react';

export const BottomNav = () => {
  const { activeTab, setActiveTab, t } = useChits();

  const items = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { id: 'groups', label: t('navGroups'), icon: Layers },
    { id: 'members', label: t('navMembers'), icon: Users },
    { id: 'payments', label: t('navPayments'), icon: Receipt },
    { id: 'whatsapp', label: t('navWhatsApp'), icon: MessageCircle },
    { id: 'reports', label: t('navReports'), icon: FileText }
  ];

  return (
    <nav className="mobile-bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id || 
          (item.id === 'groups' && activeTab === 'group-details') ||
          (item.id === 'members' && activeTab === 'member-details');

        return (
          <div
            key={item.id}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </div>
        );
      })}
    </nav>
  );
};
