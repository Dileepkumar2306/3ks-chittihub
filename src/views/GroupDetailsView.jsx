import React, { useState } from 'react';
import { useChits } from '../context/ChitContext';
import {
  ArrowLeft,
  Calendar,
  Users,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Receipt,
  MessageCircle,
  UserPlus
} from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal';

export const GroupDetailsView = () => {
  const {
    data,
    selectedGroupId,
    setSelectedGroupId,
    setSelectedMemberId,
    setActiveTab,
    quickMarkPaid,
    getGroupStats,
    getMemberBalance,
    t
  } = useChits();

  const group = data.groups.find((g) => g.id === selectedGroupId) || data.groups[0];
  const [selectedMonth, setSelectedMonth] = useState(group?.currentMonth || 1);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState({});

  if (!group) {
    return (
      <div className="page-container">
        <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('groups')}>
          <ArrowLeft size={16} /> Back to Groups
        </button>
        <p style={{ marginTop: '2rem' }}>No group selected.</p>
      </div>
    );
  }

  const groupMembers = data.members.filter((m) => m.groupId === group.id);
  const stats = getGroupStats(group.id);

  // Payments for the selected month in this group
  const monthPayments = data.payments.filter(
    (p) => p.groupId === group.id && Number(p.monthNumber) === Number(selectedMonth)
  );

  let monthExpected = 0;
  let monthCollected = 0;

  groupMembers.forEach((m) => {
    const exp = m.monthlyAmount || group.monthlyAmount;
    monthExpected += exp;
    const pay = monthPayments.find((p) => p.memberId === m.id);
    if (pay) {
      monthCollected += Number(pay.paidAmount) || 0;
    }
  });

  const monthPending = Math.max(0, monthExpected - monthCollected);

  const handleOpenPayment = (member) => {
    setModalInitial({
      groupId: group.id,
      memberId: member.id,
      monthNumber: selectedMonth,
      expectedAmount: member.monthlyAmount || group.monthlyAmount
    });
    setPaymentModalOpen(true);
  };

  const handleSendWhatsApp = (member, payment) => {
    const exp = member.monthlyAmount || group.monthlyAmount;
    const paid = payment ? payment.paidAmount : 0;
    const pending = Math.max(0, exp - paid);

    const text = t('whatsappReminderText', member.name, group.name, selectedMonth, pending, exp);
    const cleanPhone = (member.mobile || '').replace(/\D/g, '');
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="page-container">
      {/* Top Navigation Back */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setActiveTab('groups')}
        >
          <ArrowLeft size={16} />
          <span>Back to Groups</span>
        </button>

        <span className={`status-pill ${group.status === 'Active' ? 'status-active' : 'status-completed'}`}>
          {group.status === 'Active' ? t('active') : t('completed')}
        </span>
      </div>

      {/* Group Header Card */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              {group.name}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <span>Members: <strong>{groupMembers.length} / {group.memberCount}</strong></span>
              <span>•</span>
              <span>Total Duration: <strong>{group.monthsCount} Months</strong></span>
              <span>•</span>
              <span>Monthly Chit: <strong>₹{group.monthlyAmount.toLocaleString('en-IN')}</strong></span>
              <span>•</span>
              <span>Current Cycle: <strong style={{ color: 'var(--gold-400)' }}>Month {group.currentMonth || 1}</strong></span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setActiveTab('members');
            }}
          >
            <UserPlus size={16} />
            <span>{t('addMember')}</span>
          </button>
        </div>

        {/* Financial Highlights */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {t('kpiTotalExpected')}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              ₹{stats.totalExpected.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {t('kpiTotalCollected')}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
              ₹{stats.totalCollected.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {t('kpiTotalPending')}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fb7185' }}>
              ₹{stats.totalPending.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Pool per Month
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-400)' }}>
              ₹{(group.memberCount * group.monthlyAmount).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Month Selector Bar */}
      <div className="card" style={{ marginBottom: '1.75rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--gold-400)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{t('selectMonth')} Collection Sheet</h3>
          </div>

          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
            <span>Month Expected: <strong>₹{monthExpected.toLocaleString('en-IN')}</strong></span>
            <span>Collected: <strong style={{ color: '#34d399' }}>₹{monthCollected.toLocaleString('en-IN')}</strong></span>
            <span>Pending: <strong style={{ color: '#fb7185' }}>₹{monthPending.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        {/* Scrollable Month Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.35rem' }}>
          {Array.from({ length: group.monthsCount }, (_, i) => i + 1).map((m) => {
            const isSelected = Number(selectedMonth) === m;
            const isCurrent = Number(group.currentMonth) === m;

            return (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMonth(m)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '1px solid var(--gold-400)' : '1px solid var(--border-color)',
                  background: isSelected ? 'var(--gold-glow)' : 'rgba(15, 23, 42, 0.6)',
                  color: isSelected ? 'var(--gold-400)' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span>Month {m}</span>
                {isCurrent && (
                  <span style={{ fontSize: '0.65rem', background: 'var(--gold-500)', color: '#000', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 800 }}>
                    NOW
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Member Collection Sheet Table for the selected month */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Users size={18} color="var(--gold-400)" />
            <span>Month {selectedMonth} Payments ({groupMembers.length} Members)</span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>{t('memberId')}</th>
                <th>{t('memberName')}</th>
                <th>{t('mobileNumber')}</th>
                <th>{t('expectedAmount')}</th>
                <th>{t('paidAmount')}</th>
                <th>{t('statusCol')}</th>
                <th>{t('remarksCol')}</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No members added to this group yet. Click "+ Add Member" to get started.
                  </td>
                </tr>
              ) : (
                groupMembers.map((member) => {
                  const payment = monthPayments.find((p) => p.memberId === member.id);
                  const expected = member.monthlyAmount || group.monthlyAmount;
                  const paid = payment ? payment.paidAmount : 0;
                  const status = payment ? payment.status : 'Pending';

                  const statusClass =
                    status === 'Paid'
                      ? 'status-paid'
                      : status === 'Partial'
                      ? 'status-partial'
                      : status === 'Advance'
                      ? 'status-advance'
                      : 'status-pending';

                  return (
                    <tr key={member.id}>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {member.memberCode}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        <span
                          style={{ cursor: 'pointer', color: 'var(--gold-400)' }}
                          onClick={() => {
                            setSelectedMemberId(member.id);
                            setActiveTab('member-details');
                          }}
                        >
                          {member.name}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{member.mobile}</td>
                      <td>₹{expected.toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 700, color: paid > 0 ? '#34d399' : 'inherit' }}>
                        ₹{paid.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`status-pill ${statusClass}`}>{status}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '180px' }}>
                        {payment?.remarks || '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          {/* Quick 1-click Mark Paid */}
                          {status !== 'Paid' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              onClick={() => quickMarkPaid(group.id, member.id, selectedMonth, expected)}
                              title="1-Click Mark Paid"
                            >
                              <CheckCircle2 size={13} />
                              <span>{t('markPaid')}</span>
                            </button>
                          )}

                          {/* Open Detailed Payment Modal */}
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleOpenPayment(member)}
                            title="Edit or log payment"
                          >
                            <Receipt size={13} />
                            <span>Log</span>
                          </button>

                          {/* WhatsApp Reminder if pending */}
                          {status !== 'Paid' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-whatsapp"
                              onClick={() => handleSendWhatsApp(member, payment)}
                              title="WhatsApp Reminder"
                            >
                              <MessageCircle size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
