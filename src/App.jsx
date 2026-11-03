import React, { useState } from 'react';
import { ChitProvider, useChits } from './context/ChitContext';
import { PinLockModal } from './components/PinLockModal';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';

import { DashboardView } from './views/DashboardView';
import { GroupsView } from './views/GroupsView';
import { GroupDetailsView } from './views/GroupDetailsView';
import { MembersView } from './views/MembersView';
import { MemberDetailsView } from './views/MemberDetailsView';
import { MonthlyPaymentsView } from './views/MonthlyPaymentsView';
import { WhatsAppHubView } from './views/WhatsAppHubView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

import { PaymentModal } from './components/PaymentModal';
import { ScreenshotModal } from './components/ScreenshotModal';
import { Plus } from 'lucide-react';

const MainAppContent = () => {
  const { isLocked, activeTab } = useChits();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fabPaymentOpen, setFabPaymentOpen] = useState(false);

  if (isLocked) {
    return <PinLockModal />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'groups':
        return <GroupsView />;
      case 'group-details':
        return <GroupDetailsView />;
      case 'members':
        return <MembersView />;
      case 'member-details':
        return <MemberDetailsView />;
      case 'payments':
        return <MonthlyPaymentsView />;
      case 'whatsapp':
        return <WhatsAppHubView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main>{renderActiveView()}</main>
        
        {/* Mobile Floating Action Button */}
        <button
          type="button"
          className="mobile-fab"
          onClick={() => setFabPaymentOpen(true)}
          title="Quick Record Payment"
          aria-label="Quick Record Payment"
        >
          <Plus size={26} strokeWidth={2.6} />
        </button>

        <BottomNav />
      </div>

      {/* Global Quick Record Payment Modal from FAB */}
      <PaymentModal
        isOpen={fabPaymentOpen}
        onClose={() => setFabPaymentOpen(false)}
      />

      {/* Global High-Resolution WhatsApp Screenshot Modal */}
      <ScreenshotModal />
    </div>
  );
};

export default function App() {
  return (
    <ChitProvider>
      <MainAppContent />
    </ChitProvider>
  );
}
