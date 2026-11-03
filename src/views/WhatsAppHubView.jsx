import React, { useState, useRef, useEffect } from 'react';
import { useChits } from '../context/ChitContext';
import {
  MessageCircle,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  PlusCircle,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Search,
  Filter,
  Users,
  IndianRupee,
  Layers,
  Sparkles,
  Trash2,
  RefreshCw,
  Eye,
  Check,
  Send,
  Smartphone,
  ShieldCheck,
  X
} from 'lucide-react';
import { generatePaymentScreenshot } from '../utils/screenshotGenerator';

export const WhatsAppHubView = () => {
  const {
    data,
    verifyWhatsAppPayment,
    addWhatsAppMessage,
    deleteWhatsAppMessage,
    linkWhatsAppGroup,
    updateWhatsAppSettings,
    simulateIncomingWhatsAppPayment,
    openScreenshotModal,
    setSelectedMemberId,
    setActiveTab,
    showToast,
    t
  } = useChits();

  const [activeTabFilter, setActiveTabFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'VERIFIED'
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLinkGroupModalOpen, setIsLinkGroupModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form state for Upload / Add Screenshot Modal
  const [uploadMemberId, setUploadMemberId] = useState('');
  const [uploadGroupId, setUploadGroupId] = useState(data.groups[0]?.id || '');
  const [uploadAmount, setUploadAmount] = useState('5000');
  const [uploadMonth, setUploadMonth] = useState(1);
  const [uploadPaymentMode, setUploadPaymentMode] = useState('PhonePe');
  const [uploadUtr, setUploadUtr] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadImagePreview, setUploadImagePreview] = useState(null);
  const [autoRecordToLedger, setAutoRecordToLedger] = useState(true);

  // New WhatsApp Group Link form
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupChitId, setNewGroupChitId] = useState(data.groups[0]?.id || '');
  const [newGroupInvite, setNewGroupInvite] = useState('');

  const fileInputRef = useRef(null);

  // Set default member when group changes in upload modal
  useEffect(() => {
    if (uploadGroupId) {
      const groupMems = data.members.filter((m) => m.groupId === uploadGroupId);
      if (groupMems.length > 0 && (!uploadMemberId || !groupMems.some((m) => m.id === uploadMemberId))) {
        setUploadMemberId(groupMems[0].id);
        setUploadAmount(groupMems[0].monthlyAmount || 5000);
      }
      const grp = data.groups.find((g) => g.id === uploadGroupId);
      if (grp) {
        setUploadMonth(grp.currentMonth || 1);
      }
    }
  }, [uploadGroupId]);

  const messages = data.whatsappMessages || [];
  const whatsappGroups = data.whatsappGroups || [];

  const pendingCount = messages.filter((m) => m.status === 'Pending').length;
  const verifiedCount = messages.filter((m) => m.status === 'Verified').length;
  const totalVerifiedAmount = messages
    .filter((m) => m.status === 'Verified')
    .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  // Handle Manual File Upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, WebP)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Paste event for clipboard screenshots (Ctrl+V)
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            setUploadImagePreview(event.target.result);
            showToast('Screenshot pasted from clipboard!');
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    }
  };

  const handleSyncWhatsApp = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('WhatsApp sync completed! All linked groups up-to-date.');
    }, 1200);
  };

  const handleSubmitUploadModal = (e) => {
    e.preventDefault();
    const member = data.members.find((m) => m.id === uploadMemberId);
    const group = data.groups.find((g) => g.id === uploadGroupId);

    if (!member) {
      alert('Please select a member.');
      return;
    }

    // If no screenshot image was uploaded, generate a clean receipt preview
    const finalScreenshot =
      uploadImagePreview ||
      generatePaymentScreenshot({
        app: uploadPaymentMode.toLowerCase().includes('phone')
          ? 'phonepe'
          : uploadPaymentMode.toLowerCase().includes('google') || uploadPaymentMode.toLowerCase().includes('gpay')
          ? 'gpay'
          : 'paytm',
        amount: Number(uploadAmount) || 5000,
        memberName: member.name,
        memberPhone: member.mobile,
        groupName: group?.name || '3KS Chit Group',
        utr: uploadUtr || `UPI${Date.now()}`,
        date: 'Just now'
      });

    addWhatsAppMessage(
      {
        groupId: whatsappGroups[0]?.id || 'wa-grp-1',
        chitGroupId: uploadGroupId,
        memberId: member.id,
        senderName: member.name,
        senderMobile: member.mobile,
        memberCode: member.memberCode,
        messageText:
          uploadNotes ||
          `Sent ₹${Number(uploadAmount).toLocaleString('en-IN')} for Month ${uploadMonth} installment via ${uploadPaymentMode}. Screenshot proof attached.`,
        timestamp: 'Just now',
        amount: Number(uploadAmount) || 0,
        monthNumber: Number(uploadMonth) || 1,
        paymentMode: uploadPaymentMode,
        utr: uploadUtr || `UPI/${Date.now().toString().slice(-8)}`,
        screenshot: finalScreenshot
      },
      autoRecordToLedger
    );

    setIsUploadModalOpen(false);
    setUploadImagePreview(null);
    setUploadUtr('');
    setUploadNotes('');
  };

  const handleCreateGroupLink = (e) => {
    e.preventDefault();
    if (!newGroupName) return;
    linkWhatsAppGroup({
      name: newGroupName,
      chitGroupId: newGroupChitId,
      inviteLink: newGroupInvite,
      membersCount: 20
    });
    setNewGroupName('');
    setNewGroupInvite('');
    setIsLinkGroupModalOpen(false);
  };

  const handleOpenScreenshot = (msg) => {
    const group = data.groups.find((g) => g.id === msg.chitGroupId);
    openScreenshotModal({
      screenshotUrl: msg.screenshot,
      title: `${msg.senderName} - Month ${msg.monthNumber} Receipt`,
      memberName: msg.senderName,
      memberMobile: msg.senderMobile,
      memberId: msg.memberId,
      memberCode: msg.memberCode,
      groupName: group?.name || 'Chitti Group',
      amount: msg.amount,
      monthNumber: msg.monthNumber,
      utr: msg.utr,
      paymentMode: msg.paymentMode,
      date: msg.timestamp,
      messageText: msg.messageText,
      status: msg.status,
      messageId: msg.id
    });
  };

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    const matchesTab =
      activeTabFilter === 'ALL' ||
      (activeTabFilter === 'PENDING' && msg.status === 'Pending') ||
      (activeTabFilter === 'VERIFIED' && msg.status === 'Verified');

    const matchesGroup = selectedGroupFilter === 'ALL' || msg.chitGroupId === selectedGroupFilter;

    const matchesSearch =
      (msg.senderName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (msg.senderMobile || '').includes(searchQuery) ||
      (msg.utr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (msg.messageText || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesGroup && matchesSearch;
  });

  return (
    <div className="page-container">
      {/* Title & Top Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'rgba(37, 211, 102, 0.15)',
                color: '#25d366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(37, 211, 102, 0.3)'
              }}
            >
              <MessageCircle size={22} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {t('whatsAppTitle')}
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {t('whatsAppSubtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Simulate Member Screenshot Button */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={simulateIncomingWhatsAppPayment}
            title="Simulate an incoming member WhatsApp payment screenshot"
            style={{ borderColor: 'var(--gold-400)', color: 'var(--gold-400)' }}
          >
            <Sparkles size={14} />
            <span>{t('whatsAppSimulateIncoming')}</span>
          </button>

          {/* Upload Screenshot / Log Proof Button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Upload size={15} />
            <span>{t('whatsAppAddScreenshot')}</span>
          </button>
        </div>
      </div>

      {/* Top Status & Metrics Grid */}
      <div className="kpi-grid" style={{ marginBottom: '1.75rem' }}>
        {/* WhatsApp Connection Status Card */}
        <div
          className="kpi-card"
          style={{
            '--kpi-accent': '#25d366',
            cursor: 'pointer',
            border: '1px solid rgba(37, 211, 102, 0.25)'
          }}
          onClick={() => setIsQrModalOpen(true)}
          title="Click to view WhatsApp QR Code & Bot Status"
        >
          <div className="kpi-top">
            <span className="kpi-label">{t('whatsAppStatus')}</span>
            <div
              className="kpi-icon-wrap"
              style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#25d366' }}
            >
              <QrCode size={19} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#25d366',
                boxShadow: '0 0 10px #25d366'
              }}
            />
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Connected
            </span>
          </div>
          <div className="kpi-subtext" style={{ marginTop: '0.4rem' }}>
            <span>+91 {data.settings?.whatsappPhone || '9848011223'} • Click for QR</span>
          </div>
        </div>

        {/* Linked Groups */}
        <div
          className="kpi-card"
          style={{ '--kpi-accent': 'var(--cyan-500)', cursor: 'pointer' }}
          onClick={() => setIsLinkGroupModalOpen(true)}
          title="Click to link a new WhatsApp chit group"
        >
          <div className="kpi-top">
            <span className="kpi-label">{t('whatsAppGroupCount')}</span>
            <div className="kpi-icon-wrap" style={{ color: 'var(--cyan-500)' }}>
              <Users size={19} />
            </div>
          </div>
          <div className="kpi-value">{whatsappGroups.length} Groups</div>
          <div className="kpi-subtext">
            <span>+ Link New Chit Group</span>
          </div>
        </div>

        {/* Pending Verification Proofs */}
        <div
          className="kpi-card"
          style={{
            '--kpi-accent': pendingCount > 0 ? 'var(--amber-500)' : 'var(--emerald-500)',
            borderColor: pendingCount > 0 ? 'var(--amber-border)' : 'var(--border-color)'
          }}
        >
          <div className="kpi-top">
            <span className="kpi-label">{t('whatsAppPendingProofs')}</span>
            <div
              className="kpi-icon-wrap"
              style={{
                color: pendingCount > 0 ? 'var(--amber-500)' : 'var(--emerald-500)',
                background: pendingCount > 0 ? 'var(--amber-bg)' : 'var(--emerald-bg)'
              }}
            >
              <Clock size={19} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: pendingCount > 0 ? 'var(--amber-500)' : 'inherit' }}>
            {pendingCount}
          </div>
          <div className="kpi-subtext">
            <span>{pendingCount > 0 ? 'Action required: Review below' : 'All clear & verified'}</span>
          </div>
        </div>

        {/* Verified Collections from WhatsApp */}
        <div className="kpi-card" style={{ '--kpi-accent': 'var(--emerald-500)' }}>
          <div className="kpi-top">
            <span className="kpi-label">{t('whatsAppVerifiedProofs')}</span>
            <div className="kpi-icon-wrap" style={{ color: 'var(--emerald-500)' }}>
              <CheckCircle2 size={19} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#34d399' }}>
            ₹{totalVerifiedAmount.toLocaleString('en-IN')}
          </div>
          <div className="kpi-subtext">
            <span>{verifiedCount} payments recorded</span>
          </div>
        </div>
      </div>

      {/* Linked WhatsApp Groups Banner Card */}
      <div className="card" style={{ marginBottom: '1.75rem', padding: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="var(--gold-400)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
              {t('whatsAppGroups')}
            </h3>
            <span
              style={{
                background: 'rgba(37, 211, 102, 0.15)',
                color: '#25d366',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                fontWeight: 700
              }}
            >
              Auto-Sync Active
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleSyncWhatsApp}
              disabled={isSyncing}
              title="Force Sync with WhatsApp Web"
            >
              <RefreshCw size={13} className={isSyncing ? 'spin-icon' : ''} />
              <span>{isSyncing ? 'Syncing...' : t('whatsAppSyncNow')}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsLinkGroupModalOpen(true)}
            >
              <PlusCircle size={13} />
              <span>Link Group</span>
            </button>
          </div>
        </div>

        {/* Group Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
          {whatsappGroups.map((wg) => {
            const chitGroup = data.groups.find((g) => g.id === wg.chitGroupId);
            return (
              <div
                key={wg.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    {wg.name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--gold-400)', marginTop: '2px' }}>
                    Linked to: {chitGroup?.name || 'All Members'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {wg.membersCount} Members • {wg.lastActivity}
                  </div>
                </div>

                <a
                  href={wg.inviteLink || 'https://web.whatsapp.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-whatsapp btn-sm"
                  style={{ textDecoration: 'none', padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                >
                  <ExternalLink size={12} />
                  <span>Open</span>
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Messages & Screenshots Section */}
      <div className="card">
        {/* Filter & Search Bar Header */}
        <div
          className="card-header"
          style={{ flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)' }}
        >
          <div className="card-title">
            <MessageCircle size={18} color="#25d366" />
            <span>{t('whatsAppInbox')}</span>
            <span
              style={{
                fontSize: '0.75rem',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '0.15rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-secondary)'
              }}
            >
              {filteredMessages.length} Messages
            </span>
          </div>

          {/* Filter Controls */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Filter Tabs */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-sm)',
                padding: '2px',
                border: '1px solid var(--border-color)'
              }}
            >
              <button
                type="button"
                className={`tab-btn ${activeTabFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setActiveTabFilter('ALL')}
                style={{
                  background: activeTabFilter === 'ALL' ? 'var(--gold-500)' : 'transparent',
                  color: activeTabFilter === 'ALL' ? '#0b1120' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                All
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTabFilter === 'PENDING' ? 'active' : ''}`}
                onClick={() => setActiveTabFilter('PENDING')}
                style={{
                  background: activeTabFilter === 'PENDING' ? 'var(--amber-500)' : 'transparent',
                  color: activeTabFilter === 'PENDING' ? '#0b1120' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Pending ({pendingCount})
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTabFilter === 'VERIFIED' ? 'active' : ''}`}
                onClick={() => setActiveTabFilter('VERIFIED')}
                style={{
                  background: activeTabFilter === 'VERIFIED' ? 'var(--emerald-500)' : 'transparent',
                  color: activeTabFilter === 'VERIFIED' ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Verified ({verifiedCount})
              </button>
            </div>

            {/* Group Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '160px', padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
            >
              <option value="ALL">All Groups</option>
              {data.groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2rem', padding: '0.4rem 0.75rem 0.4rem 2rem', fontSize: '0.82rem', width: '180px' }}
                placeholder="Search member, UTR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Message Feed List */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredMessages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}
              >
                <MessageCircle size={26} color="var(--text-muted)" />
              </div>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                No WhatsApp payment messages found
              </h4>
              <p style={{ fontSize: '0.85rem' }}>
                Click "+ Add WhatsApp Screenshot" or "Simulate Member Screenshot" to record payment proof.
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const chitGroup = data.groups.find((g) => g.id === msg.chitGroupId);
              const isPending = msg.status === 'Pending';

              return (
                <div
                  key={msg.id}
                  style={{
                    background: isPending
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.06), rgba(15, 23, 42, 0.6))'
                      : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isPending ? 'var(--amber-border)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                    transition: 'all 0.2s ease'
                  }}
                  className="whatsapp-feed-card"
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.85rem',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}
                  >
                    {/* Sender Profile Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--gold-400), var(--gold-600))',
                          color: '#0b1120',
                          fontWeight: 800,
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {msg.senderName?.charAt(0) || 'M'}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: '0.98rem',
                              color: 'var(--text-primary)',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              if (msg.memberId) {
                                setSelectedMemberId(msg.memberId);
                                setActiveTab('member-details');
                              }
                            }}
                          >
                            {msg.senderName}
                          </span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontFamily: 'monospace',
                              background: 'rgba(255, 255, 255, 0.08)',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            {msg.memberCode || '3KS-MEM'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          +91 {msg.senderMobile} • {chitGroup?.name || 'Chitti Group'}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge & Timestamp */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {msg.timestamp}
                      </span>
                      <span
                        className={`status-pill ${isPending ? 'status-pending' : 'status-paid'}`}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                      >
                        {isPending ? '⏳ Verification Pending' : '✓ Recorded to Ledger'}
                      </span>
                    </div>
                  </div>

                  {/* Message Bubble & Screenshot Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: msg.screenshot ? 'minmax(0, 1.4fr) minmax(0, 1fr)' : '1fr',
                      gap: '1.25rem',
                      alignItems: 'center'
                    }}
                    className="whatsapp-message-split"
                  >
                    {/* Left: Message Text & Extracted Payment Details */}
                    <div>
                      {/* WhatsApp Speech Bubble */}
                      <div
                        style={{
                          background: 'rgba(37, 211, 102, 0.08)',
                          border: '1px solid rgba(37, 211, 102, 0.2)',
                          borderRadius: '12px',
                          borderTopLeftRadius: '2px',
                          padding: '0.85rem 1rem',
                          marginBottom: '0.85rem',
                          position: 'relative'
                        }}
                      >
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                          "{msg.messageText}"
                        </div>
                      </div>

                      {/* Auto-Detected Transaction Chips Bar */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.6rem',
                          padding: '0.75rem 1rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.82rem'
                        }}
                      >
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Amount: </span>
                          <strong style={{ color: '#34d399', fontSize: '0.95rem' }}>
                            ₹{Number(msg.amount).toLocaleString('en-IN')}
                          </strong>
                        </div>

                        <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Month: </span>
                          <strong style={{ color: 'var(--text-primary)' }}>Month {msg.monthNumber}</strong>
                        </div>

                        <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Mode: </span>
                          <strong style={{ color: '#a78bfa' }}>{msg.paymentMode || 'UPI'}</strong>
                        </div>

                        {msg.utr && (
                          <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '0.6rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>UTR: </span>
                            <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>
                              {msg.utr}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Payment Screenshot Thumbnail (Click to inspect!) */}
                    {msg.screenshot && (
                      <div
                        style={{
                          position: 'relative',
                          cursor: 'pointer',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: '1px solid var(--border-color)',
                          background: '#090d16',
                          maxHeight: '190px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                        onClick={() => handleOpenScreenshot(msg)}
                        title="Click to zoom / inspect payment screenshot"
                        className="screenshot-thumb-box"
                      >
                        <img
                          src={msg.screenshot}
                          alt="Screenshot Proof"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '190px',
                            objectFit: 'contain'
                          }}
                        />

                        {/* Overlay on hover */}
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(5, 10, 24, 0.65)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.82rem'
                          }}
                          className="screenshot-hover-overlay"
                        >
                          <Eye size={22} color="var(--gold-400)" />
                          <span>Click to Inspect Screenshot</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '1rem',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid var(--border-color)',
                      flexWrap: 'wrap',
                      gap: '0.6rem'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {msg.screenshot && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenScreenshot(msg)}
                        >
                          <Eye size={13} />
                          <span>{t('whatsAppViewScreenshot')}</span>
                        </button>
                      )}

                      {msg.memberId && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSelectedMemberId(msg.memberId);
                            setActiveTab('member-details');
                          }}
                        >
                          <Users size={13} />
                          <span>Passbook</span>
                        </button>
                      )}

                      <a
                        href={`https://wa.me/91${(msg.senderMobile || '').replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-whatsapp btn-sm"
                        style={{ textDecoration: 'none' }}
                      >
                        <MessageCircle size={13} />
                        <span>Chat</span>
                      </a>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {isPending ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => verifyWhatsAppPayment(msg.id)}
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: '#ffffff'
                          }}
                        >
                          <CheckCircle2 size={14} />
                          <span>{t('whatsAppVerifyAndRecord')}</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>
                          ✓ Verified & Updated Passbook
                        </span>
                      )}

                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => deleteWhatsAppMessage(msg.id)}
                        title="Dismiss message"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL 1: Upload / Add WhatsApp Screenshot & Proof */}
      {isUploadModalOpen && (
        <div className="modal-overlay" onPaste={handlePaste}>
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <Upload size={20} color="var(--gold-400)" />
                <span>{t('whatsAppAddScreenshot')}</span>
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadImagePreview(null);
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitUploadModal}>
              <div className="modal-body">
                {/* Drag-and-drop or Browse Screenshot Image */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Payment Screenshot (or paste with Ctrl+V)</span>
                    <span style={{ color: 'var(--gold-400)', fontSize: '0.74rem' }}>PNG, JPG, WebP</span>
                  </label>

                  <div
                    style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      textAlign: 'center',
                      background: 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />

                    {uploadImagePreview ? (
                      <div>
                        <img
                          src={uploadImagePreview}
                          alt="Screenshot Preview"
                          style={{
                            maxHeight: '180px',
                            maxWidth: '100%',
                            borderRadius: '8px',
                            boxShadow: 'var(--shadow-sm)',
                            marginBottom: '0.5rem'
                          }}
                        />
                        <div style={{ fontSize: '0.76rem', color: 'var(--gold-400)' }}>
                          Click to change or replace image
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            background: 'rgba(243, 201, 105, 0.1)',
                            color: 'var(--gold-400)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.75rem auto'
                          }}
                        >
                          <ImageIcon size={22} />
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          Select or Drop WhatsApp Payment Screenshot
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          You can also press <strong>Ctrl + V</strong> anywhere to paste from clipboard
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Group & Member Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">{t('selectGroup')}</label>
                    <select
                      className="form-select"
                      value={uploadGroupId}
                      onChange={(e) => setUploadGroupId(e.target.value)}
                      required
                    >
                      {data.groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('memberName')}</label>
                    <select
                      className="form-select"
                      value={uploadMemberId}
                      onChange={(e) => {
                        setUploadMemberId(e.target.value);
                        const mem = data.members.find((m) => m.id === e.target.value);
                        if (mem) setUploadAmount(mem.monthlyAmount || 5000);
                      }}
                      required
                    >
                      {data.members
                        .filter((m) => m.groupId === uploadGroupId)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.memberCode})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Amount, Month & Payment Mode */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label">{t('paidAmount')} (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={uploadAmount}
                      onChange={(e) => setUploadAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('selectMonth')}</label>
                    <select
                      className="form-select"
                      value={uploadMonth}
                      onChange={(e) => setUploadMonth(Number(e.target.value))}
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          Month {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('paymentMode')}</label>
                    <select
                      className="form-select"
                      value={uploadPaymentMode}
                      onChange={(e) => setUploadPaymentMode(e.target.value)}
                    >
                      <option value="PhonePe">PhonePe</option>
                      <option value="Google Pay">Google Pay (GPay)</option>
                      <option value="Paytm">Paytm</option>
                      <option value="UPI">Direct UPI</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                </div>

                {/* UTR / Ref Number */}
                <div className="form-group">
                  <label className="form-label">UPI Reference / UTR Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. UPI/410294812392"
                    value={uploadUtr}
                    onChange={(e) => setUploadUtr(e.target.value)}
                  />
                </div>

                {/* Message Text / Notes */}
                <div className="form-group">
                  <label className="form-label">WhatsApp Message / Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Sent Month 4 installment screenshot on WhatsApp"
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                  />
                </div>

                {/* Direct Ledger Recording Checkbox */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid var(--emerald-border)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <input
                    type="checkbox"
                    id="autoRecordLedger"
                    checked={autoRecordToLedger}
                    onChange={(e) => setAutoRecordToLedger(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#10b981', cursor: 'pointer' }}
                  />
                  <label htmlFor="autoRecordLedger" style={{ fontSize: '0.82rem', color: '#ffffff', cursor: 'pointer' }}>
                    <strong>Directly update member passbook & mark as Paid</strong>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadImagePreview(null);
                  }}
                >
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  <span>Save WhatsApp Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: WhatsApp Web QR Code Link Modal */}
      {isQrModalOpen && (
        <div className="modal-overlay" onClick={() => setIsQrModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '500px', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title" style={{ color: '#25d366' }}>
                <QrCode size={20} />
                <span>{t('whatsAppScanTitle')}</span>
              </div>
              <button type="button" className="btn-icon" onClick={() => setIsQrModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.75rem' }}>
              {/* QR Code Container */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '1.25rem',
                  borderRadius: '16px',
                  display: 'inline-block',
                  margin: '0 auto 1.25rem auto',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                {/* SVG QR Code Simulation */}
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <rect width="200" height="200" fill="#ffffff" />
                  {/* Position detection patterns */}
                  <rect x="15" y="15" width="50" height="50" fill="#000000" rx="6" />
                  <rect x="23" y="23" width="34" height="34" fill="#ffffff" rx="4" />
                  <rect x="31" y="31" width="18" height="18" fill="#000000" rx="2" />

                  <rect x="135" y="15" width="50" height="50" fill="#000000" rx="6" />
                  <rect x="143" y="23" width="34" height="34" fill="#ffffff" rx="4" />
                  <rect x="151" y="31" width="18" height="18" fill="#000000" rx="2" />

                  <rect x="15" y="135" width="50" height="50" fill="#000000" rx="6" />
                  <rect x="23" y="143" width="34" height="34" fill="#ffffff" rx="4" />
                  <rect x="31" y="151" width="18" height="18" fill="#000000" rx="2" />

                  {/* QR Data Grid Matrix */}
                  <g fill="#000000">
                    <rect x="80" y="20" width="12" height="12" />
                    <rect x="100" y="20" width="8" height="8" />
                    <rect x="85" y="45" width="10" height="10" />
                    <rect x="105" y="45" width="14" height="10" />
                    <rect x="75" y="70" width="10" height="10" />
                    <rect x="95" y="70" width="10" height="10" />
                    <rect x="115" y="70" width="10" height="10" />
                    <rect x="135" y="75" width="10" height="10" />
                    <rect x="160" y="75" width="14" height="14" />
                    <rect x="20" y="85" width="12" height="12" />
                    <rect x="45" y="85" width="12" height="12" />
                    <rect x="75" y="95" width="10" height="10" />
                    <rect x="95" y="95" width="10" height="10" />
                    <rect x="115" y="95" width="10" height="10" />
                    <rect x="145" y="105" width="12" height="12" />
                    <rect x="80" y="125" width="12" height="12" />
                    <rect x="105" y="125" width="12" height="12" />
                    <rect x="135" y="135" width="15" height="15" />
                    <rect x="165" y="135" width="15" height="15" />
                    <rect x="80" y="155" width="12" height="12" />
                    <rect x="105" y="155" width="12" height="12" />
                    <rect x="140" y="165" width="12" height="12" />
                    <rect x="165" y="165" width="12" height="12" />
                  </g>

                  {/* Center WhatsApp icon circle */}
                  <circle cx="100" cy="100" r="18" fill="#25d366" />
                  <path
                    d="M93 96 C93 92 97 88 101 88 C105 88 108 92 108 96 C108 101 104 105 101 105 L96 106 L97 101 Z"
                    fill="#ffffff"
                  />
                </svg>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  color: '#25d366',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  marginBottom: '0.5rem'
                }}
              >
                <CheckCircle2 size={16} />
                <span>Status: Connected to +91 {data.settings?.whatsappPhone || '9848011223'}</span>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {t('whatsAppScanInstructions')}
              </p>

              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '0.85rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)'
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  Auto-Detect Feature Active:
                </div>
                When members share UPI screenshots in group or direct chat, this app automatically notifies you and records the amount to their passbook.
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button type="button" className="btn btn-primary" onClick={() => setIsQrModalOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Link New WhatsApp Group Modal */}
      {isLinkGroupModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLinkGroupModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Users size={18} color="var(--cyan-500)" />
                <span>Link WhatsApp Chit Group</span>
              </div>
              <button type="button" className="btn-icon" onClick={() => setIsLinkGroupModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGroupLink}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">WhatsApp Group Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 3KS Chitti Group A"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Link to 3KS Chit Scheme</label>
                  <select
                    className="form-select"
                    value={newGroupChitId}
                    onChange={(e) => setNewGroupChitId(e.target.value)}
                  >
                    {data.groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp Group Invite Link (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://chat.whatsapp.com/..."
                    value={newGroupInvite}
                    onChange={(e) => setNewGroupInvite(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsLinkGroupModalOpen(false)}
                >
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  Link Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

