import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialGroups,
  initialMembers,
  initialPayments,
  initialSettings,
  initialWhatsAppGroups,
  initialWhatsAppMessages
} from '../data/initialData';
import { generatePaymentScreenshot } from '../utils/screenshotGenerator';
import { translations } from '../i18n/translations';

const STORAGE_KEY = '3ks_chits_v1_store';

const ChitContext = createContext(null);

export const ChitProvider = ({ children }) => {
  // Load stored state or fall back to sample initial data
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Automatically migrate PIN if it was old default '1234'
        if (parsed?.settings?.pin === '1234' || !parsed?.settings?.pin) {
          parsed.settings = { ...parsed.settings, pin: '4554' };
        }
        if (!parsed.whatsappGroups || parsed.whatsappGroups.length === 0) {
          parsed.whatsappGroups = initialWhatsAppGroups;
        }
        if (!parsed.whatsappMessages || parsed.whatsappMessages.length === 0) {
          parsed.whatsappMessages = initialWhatsAppMessages;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load local storage data', e);
    }
    return {
      groups: initialGroups,
      members: initialMembers,
      payments: initialPayments,
      settings: initialSettings,
      whatsappGroups: initialWhatsAppGroups,
      whatsappMessages: initialWhatsAppMessages
    };
  });

  const [isLocked, setIsLocked] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [activeScreenshotModal, setActiveScreenshotModal] = useState(null);
  const [notification, setNotification] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to persist state', e);
    }
  }, [data]);

  // Listen for PWA install prompt (Android & Windows Chrome/Edge)
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
      showToast('3KS Chits App installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Windows Desktop Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setIsLocked(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerInstallPrompt = async () => {
    if (!installPrompt) {
      alert('To install 3KS Chits:\n\n• On Android: Tap Chrome menu (⋮) > "Add to Home screen" or "Install App".\n• On Windows: Click the Install icon in the browser address bar.');
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setIsInstalled(true);
    }
  };

  // Document language attribute for fonts
  useEffect(() => {
    document.documentElement.setAttribute('data-lang', data.settings.language || 'en');
  }, [data.settings.language]);

  // Flash toast notification helper
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Translation helper
  const t = (key, ...args) => {
    const lang = data.settings.language || 'en';
    const dict = translations[lang] || translations.en;
    const val = dict[key] || translations.en[key] || key;
    if (typeof val === 'function') {
      return val(...args);
    }
    return val;
  };

  // Toggle or set language
  const setLanguage = (lang) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, language: lang }
    }));
  };

  // PIN Security
  const verifyPin = (enteredPin) => {
    if (enteredPin === data.settings.pin) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const lockApp = () => {
    setIsLocked(true);
  };

  const updatePin = (newPin) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, pin: newPin }
    }));
    showToast(t('successMsg'));
  };

  const resetPinToDefault = () => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, pin: '4554' }
    }));
    setIsLocked(false);
    showToast('PIN reset to default: 4554');
  };

  // Group Management
  const addGroup = (groupData) => {
    const newGroup = {
      id: `grp-${Date.now()}`,
      name: groupData.name,
      memberCount: Number(groupData.memberCount) || 20,
      monthsCount: Number(groupData.monthsCount) || 20,
      monthlyAmount: Number(groupData.monthlyAmount) || 5000,
      totalValue: (Number(groupData.memberCount) || 20) * (Number(groupData.monthlyAmount) || 5000),
      startDate: groupData.startDate || new Date().toISOString().split('T')[0],
      endDate: groupData.endDate || '',
      status: groupData.status || 'Active',
      currentMonth: Number(groupData.currentMonth) || 1,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setData((prev) => ({
      ...prev,
      groups: [newGroup, ...prev.groups]
    }));
    showToast(t('successMsg'));
    return newGroup;
  };

  const updateGroup = (id, groupData) => {
    setData((prev) => ({
      ...prev,
      groups: prev.groups.map((g) =>
        g.id === id
          ? {
              ...g,
              ...groupData,
              memberCount: Number(groupData.memberCount ?? g.memberCount),
              monthsCount: Number(groupData.monthsCount ?? g.monthsCount),
              monthlyAmount: Number(groupData.monthlyAmount ?? g.monthlyAmount),
              currentMonth: Number(groupData.currentMonth ?? g.currentMonth),
              totalValue: (Number(groupData.memberCount ?? g.memberCount)) * (Number(groupData.monthlyAmount ?? g.monthlyAmount))
            }
          : g
      )
    }));
    showToast(t('successMsg'));
  };

  const deleteGroup = (id) => {
    setData((prev) => ({
      ...prev,
      groups: prev.groups.filter((g) => g.id !== id),
      members: prev.members.filter((m) => m.groupId !== id),
      payments: prev.payments.filter((p) => p.groupId !== id)
    }));
    showToast(t('successMsg'));
  };

  // Member Management
  const addMember = (memberData) => {
    const group = data.groups.find((g) => g.id === memberData.groupId);
    const codeSeq = (data.members.length + 1).toString().padStart(3, '0');
    const newMember = {
      id: `mem-${Date.now()}`,
      memberCode: `3KS-M${codeSeq}`,
      groupId: memberData.groupId,
      name: memberData.name,
      mobile: memberData.mobile,
      joiningDate: memberData.joiningDate || new Date().toISOString().split('T')[0],
      monthlyAmount: Number(memberData.monthlyAmount) || (group ? group.monthlyAmount : 5000),
      remarks: memberData.remarks || ''
    };

    setData((prev) => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
    showToast(t('successMsg'));
    return newMember;
  };

  const updateMember = (id, memberData) => {
    setData((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.id === id
          ? {
              ...m,
              ...memberData,
              monthlyAmount: Number(memberData.monthlyAmount ?? m.monthlyAmount)
            }
          : m
      )
    }));
    showToast(t('successMsg'));
  };

  const deleteMember = (id) => {
    setData((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id),
      payments: prev.payments.filter((p) => p.memberId !== id)
    }));
    showToast(t('successMsg'));
  };

  // Payment Recording
  const recordPayment = ({
    groupId,
    memberId,
    monthNumber,
    paidAmount,
    expectedAmount,
    status,
    paymentMode = 'Cash',
    referenceNo = '',
    remarks = '',
    paidDate = new Date().toISOString().split('T')[0],
    screenshot = null
  }) => {
    const paid = Number(paidAmount) || 0;
    const expected = Number(expectedAmount) || 0;

    let computedStatus = status;
    if (!computedStatus) {
      if (paid >= expected && expected > 0) {
        computedStatus = paid > expected ? 'Advance' : 'Paid';
      } else if (paid > 0 && paid < expected) {
        computedStatus = 'Partial';
      } else {
        computedStatus = 'Pending';
      }
    }

    setData((prev) => {
      const existingIndex = prev.payments.findIndex(
        (p) => p.groupId === groupId && p.memberId === memberId && Number(p.monthNumber) === Number(monthNumber)
      );
      const existingRecord = existingIndex >= 0 ? prev.payments[existingIndex] : null;

      const paymentRecord = {
        id: existingRecord ? existingRecord.id : `pay-${Date.now()}`,
        groupId,
        memberId,
        monthNumber: Number(monthNumber),
        expectedAmount: expected,
        paidAmount: paid,
        status: computedStatus,
        paymentMode,
        referenceNo,
        remarks,
        paidDate,
        screenshot: screenshot !== undefined && screenshot !== null ? screenshot : (existingRecord ? existingRecord.screenshot : null),
        updatedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        const updated = [...prev.payments];
        updated[existingIndex] = paymentRecord;
        return { ...prev, payments: updated };
      } else {
        return { ...prev, payments: [paymentRecord, ...prev.payments] };
      }
    });

    showToast(t('successMsg'));
  };

  // Quick mark paid for a member/month
  const quickMarkPaid = (groupId, memberId, monthNumber, expectedAmount) => {
    recordPayment({
      groupId,
      memberId,
      monthNumber,
      paidAmount: expectedAmount,
      expectedAmount,
      status: 'Paid',
      paymentMode: 'Cash',
      remarks: 'Paid ✓',
      paidDate: new Date().toISOString().split('T')[0]
    });
  };

  // Get single member balance summary
  const getMemberBalance = (memberId) => {
    const member = data.members.find((m) => m.id === memberId);
    if (!member) {
      return { totalDue: 0, totalPaid: 0, pendingBalance: 0, advanceAmount: 0 };
    }

    const group = data.groups.find((g) => g.id === member.groupId);
    const monthsPassed = group ? (group.status === 'Completed' ? group.monthsCount : (group.currentMonth || 1)) : 1;
    const totalExpected = monthsPassed * (member.monthlyAmount || 5000);

    const memberPayments = data.payments.filter((p) => p.memberId === memberId);
    const totalPaid = memberPayments.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);

    const pendingBalance = Math.max(0, totalExpected - totalPaid);
    const advanceAmount = Math.max(0, totalPaid - totalExpected);

    return {
      totalDue: totalExpected,
      totalPaid,
      pendingBalance,
      advanceAmount
    };
  };

  // Get member complete history across all months of their group
  const getMemberHistory = (memberId) => {
    const member = data.members.find((m) => m.id === memberId);
    if (!member) return [];

    const group = data.groups.find((g) => g.id === member.groupId);
    const totalMonths = group ? group.monthsCount : 12;
    const history = [];

    for (let m = 1; m <= totalMonths; m++) {
      const existing = data.payments.find(
        (p) => p.memberId === memberId && Number(p.monthNumber) === m
      );

      if (existing) {
        history.push(existing);
      } else {
        const isCurrentOrPast = group ? m <= (group.currentMonth || 1) : true;
        history.push({
          id: `virtual-${memberId}-${m}`,
          groupId: member.groupId,
          memberId: member.id,
          monthNumber: m,
          expectedAmount: member.monthlyAmount,
          paidAmount: 0,
          status: isCurrentOrPast ? 'Pending' : 'Upcoming',
          remarks: isCurrentOrPast ? 'Payment pending' : 'Future month',
          paidDate: null,
          paymentMode: '-'
        });
      }
    }

    return history;
  };

  // Compute Group Summary
  const getGroupStats = (groupId) => {
    const group = data.groups.find((g) => g.id === groupId);
    if (!group) return { totalExpected: 0, totalCollected: 0, totalPending: 0, memberCount: 0 };

    const groupMembers = data.members.filter((m) => m.groupId === groupId);
    const currentMonth = group.status === 'Completed' ? group.monthsCount : (group.currentMonth || 1);
    
    let totalExpected = 0;
    groupMembers.forEach((m) => {
      totalExpected += currentMonth * (m.monthlyAmount || group.monthlyAmount);
    });

    const groupPayments = data.payments.filter((p) => p.groupId === groupId);
    const totalCollected = groupPayments.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
    const totalPending = Math.max(0, totalExpected - totalCollected);

    return {
      totalExpected,
      totalCollected,
      totalPending,
      memberCount: groupMembers.length
    };
  };

  // Dashboard Aggregates
  const dashboardStats = () => {
    const totalMembers = data.members.length;
    const activeGroups = data.groups.filter((g) => g.status === 'Active');

    let totalExpected = 0;
    data.members.forEach((m) => {
      const group = data.groups.find((g) => g.id === m.groupId);
      if (group) {
        const monthCount = group.status === 'Completed' ? group.monthsCount : (group.currentMonth || 1);
        totalExpected += monthCount * (m.monthlyAmount || group.monthlyAmount || 5000);
      }
    });

    const totalCollected = data.payments.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
    const totalPending = Math.max(0, totalExpected - totalCollected);

    // Current month collection
    const currentMonthCollected = data.payments
      .filter((p) => {
        const grp = data.groups.find((g) => g.id === p.groupId);
        return grp && Number(p.monthNumber) === Number(grp.currentMonth);
      })
      .reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);

    return {
      totalMembers,
      activeGroupsCount: activeGroups.length,
      totalExpected,
      totalCollected,
      totalPending,
      currentMonthCollected
    };
  };

  // Backup & Restore
  const exportBackupJSON = () => {
    const exportPayload = {
      exportVersion: "1.0",
      appName: "3KS Chits",
      timestamp: new Date().toISOString(),
      ...data
    };
    const jsonStr = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `3KS_Chits_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup downloaded successfully!');
  };

  const importBackupJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.groups || !parsed.members || !parsed.payments) {
        throw new Error('Invalid backup schema');
      }
      setData({
        groups: parsed.groups,
        members: parsed.members,
        payments: parsed.payments,
        settings: parsed.settings || data.settings
      });
      showToast('Data restored successfully!');
      return true;
    } catch (e) {
      alert('Error importing backup: invalid file format.');
      return false;
    }
  };

  const reloadDemoData = () => {
    setData({
      groups: initialGroups,
      members: initialMembers,
      payments: initialPayments,
      settings: initialSettings,
      whatsappGroups: initialWhatsAppGroups,
      whatsappMessages: initialWhatsAppMessages
    });
    showToast('Demo data reloaded successfully!');
  };

  const clearAllData = () => {
    setData({
      groups: [],
      members: [],
      payments: [],
      settings: initialSettings,
      whatsappGroups: [],
      whatsappMessages: []
    });
    showToast('All records cleared.');
  };

  // WhatsApp Integration Functions
  const openScreenshotModal = (screenshotData) => {
    setActiveScreenshotModal(screenshotData);
  };

  const closeScreenshotModal = () => {
    setActiveScreenshotModal(null);
  };

  const verifyWhatsAppPayment = (messageId) => {
    const message = data.whatsappMessages?.find((m) => m.id === messageId);
    if (!message) return;

    recordPayment({
      groupId: message.chitGroupId,
      memberId: message.memberId,
      monthNumber: message.monthNumber,
      paidAmount: message.amount,
      expectedAmount: message.amount,
      status: 'Paid',
      paymentMode: message.paymentMode || 'UPI',
      referenceNo: message.utr || '',
      remarks: `WhatsApp Proof: ${message.messageText?.slice(0, 50) || 'Verified'}`,
      paidDate: new Date().toISOString().split('T')[0],
      screenshot: message.screenshot
    });

    setData((prev) => ({
      ...prev,
      whatsappMessages: (prev.whatsappMessages || []).map((m) =>
        m.id === messageId ? { ...m, status: 'Verified' } : m
      )
    }));

    showToast(`Payment of ₹${Number(message.amount).toLocaleString('en-IN')} verified & recorded!`);
  };

  const addWhatsAppMessage = (msgData, autoRecord = false) => {
    const newMsg = {
      id: `wa-msg-${Date.now()}`,
      groupId: msgData.groupId || data.whatsappGroups?.[0]?.id || 'wa-grp-1',
      chitGroupId: msgData.chitGroupId,
      memberId: msgData.memberId,
      senderName: msgData.senderName,
      senderMobile: msgData.senderMobile,
      memberCode: msgData.memberCode || '',
      messageText: msgData.messageText,
      timestamp: msgData.timestamp || 'Just now',
      timeAgo: 'Just now',
      amount: Number(msgData.amount) || 0,
      monthNumber: Number(msgData.monthNumber) || 1,
      paymentMode: msgData.paymentMode || 'UPI',
      utr: msgData.utr || '',
      status: autoRecord ? 'Verified' : 'Pending',
      hasScreenshot: Boolean(msgData.screenshot),
      screenshot: msgData.screenshot || null
    };

    if (autoRecord && msgData.memberId && msgData.chitGroupId) {
      recordPayment({
        groupId: msgData.chitGroupId,
        memberId: msgData.memberId,
        monthNumber: Number(msgData.monthNumber) || 1,
        paidAmount: Number(msgData.amount) || 0,
        expectedAmount: Number(msgData.amount) || 0,
        status: 'Paid',
        paymentMode: msgData.paymentMode || 'UPI',
        referenceNo: msgData.utr || '',
        remarks: msgData.messageText || 'WhatsApp Payment Screenshot',
        paidDate: new Date().toISOString().split('T')[0],
        screenshot: msgData.screenshot
      });
    }

    setData((prev) => ({
      ...prev,
      whatsappMessages: [newMsg, ...(prev.whatsappMessages || [])]
    }));

    showToast('WhatsApp payment record added!');
    return newMsg;
  };

  const deleteWhatsAppMessage = (messageId) => {
    setData((prev) => ({
      ...prev,
      whatsappMessages: (prev.whatsappMessages || []).filter((m) => m.id !== messageId)
    }));
    showToast('WhatsApp message dismissed.');
  };

  const linkWhatsAppGroup = (groupData) => {
    const newGroup = {
      id: `wa-grp-${Date.now()}`,
      name: groupData.name,
      chitGroupId: groupData.chitGroupId,
      groupJid: `${Date.now()}@g.us`,
      membersCount: Number(groupData.membersCount) || 20,
      inviteLink: groupData.inviteLink || '',
      status: 'Active',
      lastActivity: 'Just linked',
      autoSync: true
    };
    setData((prev) => ({
      ...prev,
      whatsappGroups: [...(prev.whatsappGroups || []), newGroup]
    }));
    showToast('WhatsApp group linked successfully!');
  };

  const updateWhatsAppSettings = (newSettings) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings
      }
    }));
    showToast('WhatsApp settings updated.');
  };

  const simulateIncomingWhatsAppPayment = () => {
    const pendingMem = data.members.find((m) => {
      const bal = getMemberBalance(m.id);
      return bal.pendingBalance > 0;
    }) || data.members[0];

    if (!pendingMem) return;
    const group = data.groups.find((g) => g.id === pendingMem.groupId);
    const month = group ? (group.currentMonth || 1) : 1;
    const amount = pendingMem.monthlyAmount || 5000;
    const utr = `UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    const apps = ['phonepe', 'gpay', 'paytm'];
    const chosenApp = apps[Math.floor(Math.random() * apps.length)];
    const appLabel = chosenApp === 'phonepe' ? 'PhonePe' : chosenApp === 'gpay' ? 'Google Pay' : 'Paytm UPI';

    const screenshot = generatePaymentScreenshot({
      app: chosenApp,
      amount,
      memberName: pendingMem.name,
      memberPhone: pendingMem.mobile,
      groupName: group?.name || '3KS Chit Group',
      utr,
      date: 'Just now'
    });

    addWhatsAppMessage({
      groupId: data.whatsappGroups?.[0]?.id || 'wa-grp-1',
      chitGroupId: pendingMem.groupId,
      memberId: pendingMem.id,
      senderName: pendingMem.name,
      senderMobile: pendingMem.mobile,
      memberCode: pendingMem.memberCode,
      messageText: `Anna, sent ₹${amount.toLocaleString('en-IN')} for Month ${month} installment via ${appLabel}. Screenshot attached, please check! Ref: ${utr}`,
      timestamp: 'Just now',
      amount,
      monthNumber: month,
      paymentMode: appLabel,
      utr,
      screenshot
    }, false);

    showToast(`New WhatsApp Payment Screenshot received from ${pendingMem.name}!`, 'info');
  };

  return (
    <ChitContext.Provider
      value={{
        data,
        isLocked,
        activeTab,
        selectedGroupId,
        selectedMemberId,
        activeScreenshotModal,
        openScreenshotModal,
        closeScreenshotModal,
        notification,
        setActiveTab,
        setSelectedGroupId,
        setSelectedMemberId,
        t,
        setLanguage,
        verifyPin,
        lockApp,
        updatePin,
        resetPinToDefault,
        addGroup,
        updateGroup,
        deleteGroup,
        addMember,
        updateMember,
        deleteMember,
        recordPayment,
        quickMarkPaid,
        getMemberBalance,
        getMemberHistory,
        getGroupStats,
        dashboardStats,
        exportBackupJSON,
        importBackupJSON,
        reloadDemoData,
        clearAllData,
        showToast,
        installPrompt,
        isInstalled,
        triggerInstallPrompt,
        verifyWhatsAppPayment,
        addWhatsAppMessage,
        deleteWhatsAppMessage,
        linkWhatsAppGroup,
        updateWhatsAppSettings,
        simulateIncomingWhatsAppPayment
      }}
    >
      {children}
    </ChitContext.Provider>
  );
};

export const useChits = () => {
  const context = useContext(ChitContext);
  if (!context) {
    throw new Error('useChits must be used within a ChitProvider');
  }
  return context;
};
