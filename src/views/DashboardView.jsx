import React, { useState } from 'react';
import { useChits } from '../context/ChitContext';
import {
  Users,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  TrendingUp,
  PlusCircle,
  Receipt,
  FileSpreadsheet,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Image as ImageIcon,
  Sparkles,
  QrCode
} from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal';

export const DashboardView = () => {
  const {
    data,
    setActiveTab,
    setSelectedGroupId,
    setSelectedMemberId,
    dashboardStats,
    getMemberBalance,
    openScreenshotModal,
    verifyWhatsAppPayment,
    t
  } = useChits();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState({});

  const stats = dashboardStats();
  const efficiency = stats.totalExpected > 0 ? Math.round((stats.totalCollected / stats.totalExpected) * 100) : 0;

  // WhatsApp messages with screenshots
  const whatsappProofs = (data.whatsappMessages || []).slice(0, 4);
  const pendingProofsCount = (data.whatsappMessages || []).filter((m) => m.status === 'Pending').length;

  // Recent transactions sorted by updatedAt or id
  const recentPayments = [...data.payments]
    .sort((a, b) => new Date(b.updatedAt || b.paidDate || 0) - new Date(a.updatedAt || a.paidDate || 0))
    .slice(0, 6);

  // High priority pending members
  const pendingMembers = data.members
    .map((member) => {
      const balance = getMemberBalance(member.id);
      const group = data.groups.find((g) => g.id === member.groupId);
      return {
        ...member,
        groupName: group?.name || 'Unknown Group',
        currentMonth: group?.currentMonth || 1,
        ...balance
      };
    })
    .filter((m) => m.pendingBalance > 0)
    .sort((a, b) => b.pendingBalance - a.pendingBalance)
    .slice(0, 5);

  const handleOpenRecordPayment = (member = null) => {
    if (member) {
      setModalInitial({
        groupId: member.groupId,
        memberId: member.id,
        expectedAmount: member.monthlyAmount,
        monthNumber: member.currentMonth
      });
    } else {
      setModalInitial({});
    }
    setPaymentModalOpen(true);
  };

  const handleSendWhatsApp = (m) => {
    const text = t('whatsappReminderText', m.name, m.groupName, m.currentMonth, m.pendingBalance, m.monthlyAmount);
    const cleanPhone = (m.mobile || '').replace(/\D/g, '');
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="page-container">
      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Total Members */}
        <div className="kpi-card" style={{ '--kpi-accent': 'var(--cyan-500)' }}>
          <div className="kpi-top">
            <span className="kpi-label">{t('kpiTotalMembers')}</span>
            <div className="kpi-icon-wrap" style={{ color: 'var(--cyan-500)' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-value">{stats.totalMembers}</div>
          <div className="kpi-subtext">
            <span>{stats.activeGroupsCount} {t('kpiActiveGroups')}</span>
          </div>
        </div>

        {/* Total Expected */}
        <div className="kpi-card" style={{ '--kpi-accent': 'var(--gold-400)' }}>
          <div className="kpi-top">
            <span className="kpi-label">{t('kpiTotalExpected')}</span>
            <div className="kpi-icon-wrap" style={{ color: 'var(--gold-400)' }}>
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="kpi-value">₹{stats.totalExpected.toLocaleString('en-IN')}</div>
          <div className="kpi-subtext">
            <span>Pool across active months</span>
          </div>
        </div>

        {/* Total Collected */}
        <div className="kpi-card" style={{ '--kpi-accent': 'var(--emerald-500)' }}>
          <div className="kpi-top">
            <span className="kpi-label">{t('kpiTotalCollected')}</span>
            <div className="kpi-icon-wrap" style={{ color: 'var(--emerald-500)' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#34d399' }}>
            ₹{stats.totalCollected.toLocaleString('en-IN')}
          </div>
          <div className="kpi-subtext">
            <TrendingUp size={14} color="#34d399" />
            <span>{efficiency}% {t('collectionEfficiency')}</span>
          </div>
        </div>

        {/* Total Pending */}
        <div className="kpi-card" style={{ '--kpi-accent': 'var(--rose-500)' }}>
          <div className="kpi-top">
            <span className="kpi-label">{t('kpiTotalPending')}</span>
            <div className="kpi-icon-wrap" style={{ color: 'var(--rose-500)' }}>
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#fb7185' }}>
            ₹{stats.totalPending.toLocaleString('en-IN')}
          </div>
          <div className="kpi-subtext">
            <span>{pendingMembers.length} members with dues</span>
          </div>
        </div>

        {/* Current Month Collection */}
        <div className="kpi-card" style={{ '--kpi-accent': 'var(--indigo-500)' }}>
          <div className="kpi-top">
            <span className="kpi-label">{t('kpiCurrentMonth')}</span>
            <div className="kpi-icon-wrap" style={{ color: 'var(--indigo-500)' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div className="kpi-value">₹{stats.currentMonthCollected.toLocaleString('en-IN')}</div>
          <div className="kpi-subtext">
            <span>Logged this active cycle</span>
          </div>
        </div>
      </div>

      {/* Collection Efficiency Banner */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--gold-400)" />
            <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Overall Chit Collection Health</span>
          </div>
          <span style={{ fontWeight: 800, color: 'var(--gold-400)', fontSize: '1rem' }}>{efficiency}% Collected</span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${Math.min(100, efficiency)}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <span>Collected: ₹{stats.totalCollected.toLocaleString('en-IN')}</span>
          <span>Pending: ₹{stats.totalPending.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="card" style={{ marginBottom: '1.75rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{t('quickActions')}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Common day-to-day administrative operations</p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveTab('groups')}
            >
              <PlusCircle size={16} />
              <span>{t('actionNewGroup')}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActiveTab('members')}
            >
              <Users size={16} />
              <span>{t('actionAddMember')}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleOpenRecordPayment()}
            >
              <Receipt size={16} />
              <span>{t('actionRecordPayment')}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActiveTab('reports')}
            >
              <FileSpreadsheet size={16} />
              <span>{t('actionGenerateReport')}</span>
            </button>

            <button
              type="button"
              className="btn btn-whatsapp"
              onClick={() => setActiveTab('whatsapp')}
            >
              <MessageCircle size={16} />
              <span>WhatsApp Chit Hub</span>
              {pendingProofsCount > 0 && (
                <span
                  style={{
                    background: 'var(--amber-500)',
                    color: '#0b1120',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.1rem 0.45rem',
                    fontSize: '0.72rem',
                    fontWeight: 800
                  }}
                >
                  {pendingProofsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Live Incoming Payment Proofs Card */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(37, 211, 102, 0.15)',
                color: '#25d366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <MessageCircle size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                  WhatsApp Group Payment Proofs
                </h3>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#25d366',
                    boxShadow: '0 0 8px #25d366'
                  }}
                />
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
                Live screenshots sent by chitti members in WhatsApp groups
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('whatsapp')}
            >
              <span>Open WhatsApp Hub</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll / Grid of Proofs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {whatsappProofs.map((proof) => {
            const isPending = proof.status === 'Pending';
            return (
              <div
                key={proof.id}
                style={{
                  background: isPending
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(15, 23, 42, 0.7))'
                    : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${isPending ? 'var(--amber-border)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    {proof.senderName}
                  </div>
                  <span
                    className={`status-pill ${isPending ? 'status-pending' : 'status-paid'}`}
                    style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}
                  >
                    {isPending ? '⏳ Review' : '✓ Verified'}
                  </span>
                </div>

                {/* Screenshot Box */}
                {proof.screenshot && (
                  <div
                    style={{
                      height: '110px',
                      background: '#090d16',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      border: '1px solid var(--border-color)'
                    }}
                    onClick={() =>
                      openScreenshotModal({
                        screenshotUrl: proof.screenshot,
                        title: `${proof.senderName} - Payment Proof`,
                        memberName: proof.senderName,
                        memberMobile: proof.senderMobile,
                        memberId: proof.memberId,
                        memberCode: proof.memberCode,
                        groupName: 'Chit Group',
                        amount: proof.amount,
                        monthNumber: proof.monthNumber,
                        utr: proof.utr,
                        paymentMode: proof.paymentMode,
                        date: proof.timestamp,
                        status: proof.status,
                        messageId: proof.id
                      })
                    }
                    title="Click to view screenshot"
                  >
                    <img
                      src={proof.screenshot}
                      alt="Proof"
                      style={{ maxHeight: '110px', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Month {proof.monthNumber}: </span>
                    <strong style={{ color: '#34d399' }}>₹{Number(proof.amount).toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {proof.paymentMode}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto' }}>
                  {isPending ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, padding: '0.35rem 0.6rem', fontSize: '0.76rem' }}
                      onClick={() => verifyWhatsAppPayment(proof.id)}
                    >
                      <CheckCircle2 size={13} />
                      <span>Verify & Record</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, padding: '0.35rem 0.6rem', fontSize: '0.76rem' }}
                      onClick={() => {
                        if (proof.memberId) {
                          setSelectedMemberId(proof.memberId);
                          setActiveTab('member-details');
                        }
                      }}
                    >
                      <span>View Passbook</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Section: Recent Transactions & Pending Dues Alert */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Payments Feed */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Receipt size={18} color="var(--gold-400)" />
              <span>{t('recentPayments')}</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('payments')}
            >
              <span>{t('viewAll')}</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>{t('memberName')}</th>
                  <th>{t('selectMonth')}</th>
                  <th>{t('paidAmount')}</th>
                  <th>{t('statusCol')}</th>
                  <th>{t('remarksCol')}</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      {t('noRecords')}
                    </td>
                  </tr>
                ) : (
                  recentPayments.map((p) => {
                    const member = data.members.find((m) => m.id === p.memberId);
                    const statusClass =
                      p.status === 'Paid'
                        ? 'status-paid'
                        : p.status === 'Partial'
                        ? 'status-partial'
                        : p.status === 'Advance'
                        ? 'status-advance'
                        : 'status-pending';

                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>
                          <span
                            style={{ cursor: 'pointer', color: 'var(--gold-400)' }}
                            onClick={() => {
                              setSelectedMemberId(p.memberId);
                              setActiveTab('member-details');
                            }}
                          >
                            {member?.name || 'Member'}
                          </span>
                        </td>
                        <td>Month {p.monthNumber}</td>
                        <td style={{ fontWeight: 700 }}>₹{(p.paidAmount || 0).toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`status-pill ${statusClass}`}>{p.status}</span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {p.remarks || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* High Priority Pending Alerts */}
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ color: 'var(--rose-500)' }}>
              <AlertCircle size={18} />
              <span>{t('pendingAlerts')}</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('reports')}
            >
              <span>{t('viewAll')}</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>{t('memberName')}</th>
                  <th>{t('mobileNumber')}</th>
                  <th>{t('balanceAmount')}</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingMembers.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: '#34d399', padding: '2rem' }}>
                      All dues are clear! No pending payments.
                    </td>
                  </tr>
                ) : (
                  pendingMembers.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>
                        <div
                          style={{ cursor: 'pointer', color: 'var(--text-primary)' }}
                          onClick={() => {
                            setSelectedMemberId(m.id);
                            setActiveTab('member-details');
                          }}
                        >
                          {m.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.groupName}</div>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{m.mobile}</td>
                      <td style={{ fontWeight: 800, color: 'var(--rose-500)' }}>
                        ₹{m.pendingBalance.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {/* WhatsApp Reminder Direct Action */}
                          <button
                            type="button"
                            className="btn btn-sm btn-whatsapp"
                            onClick={() => handleSendWhatsApp(m)}
                            title="Send WhatsApp Reminder"
                          >
                            <MessageCircle size={13} />
                            <span>WhatsApp</span>
                          </button>

                          {/* Quick Pay */}
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleOpenRecordPayment(m)}
                            title="Log payment"
                          >
                            Pay
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Entry Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        initialData={modalInitial}
      />
    </div>
  );
};
