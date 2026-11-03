import React, { useState } from 'react';
import { useChits } from '../context/ChitContext';
import {
  Receipt,
  PlusCircle,
  Filter,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageCircle,
  Search,
  Image as ImageIcon
} from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal';

export const MonthlyPaymentsView = () => {
  const {
    data,
    quickMarkPaid,
    setSelectedMemberId,
    setActiveTab,
    openScreenshotModal,
    t
  } = useChits();

  const [selectedGroupId, setSelectedGroupId] = useState(data.groups[0]?.id || '');
  const activeGroup = data.groups.find((g) => g.id === selectedGroupId) || data.groups[0];
  const [selectedMonth, setSelectedMonth] = useState(activeGroup?.currentMonth || 1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState({});

  const groupMembers = data.members.filter((m) => m.groupId === selectedGroupId);

  const monthPayments = data.payments.filter(
    (p) => p.groupId === selectedGroupId && Number(p.monthNumber) === Number(selectedMonth)
  );

  // Calculate totals for this month
  let totalMonthExpected = 0;
  let totalMonthCollected = 0;

  groupMembers.forEach((m) => {
    const exp = m.monthlyAmount || activeGroup?.monthlyAmount || 5000;
    totalMonthExpected += exp;
    const pay = monthPayments.find((p) => p.memberId === m.id);
    if (pay) {
      totalMonthCollected += Number(pay.paidAmount) || 0;
    }
  });

  const totalMonthPending = Math.max(0, totalMonthExpected - totalMonthCollected);
  const collectionPercent = totalMonthExpected > 0 ? Math.round((totalMonthCollected / totalMonthExpected) * 100) : 0;

  // Handle opening modal for new or existing payment
  const handleOpenPayment = (member = null) => {
    if (member) {
      setModalInitial({
        groupId: selectedGroupId,
        memberId: member.id,
        monthNumber: selectedMonth,
        expectedAmount: member.monthlyAmount || activeGroup?.monthlyAmount || 5000
      });
    } else {
      setModalInitial({
        groupId: selectedGroupId,
        monthNumber: selectedMonth
      });
    }
    setPaymentModalOpen(true);
  };

  const handleSendWhatsApp = (member, payment) => {
    const exp = member.monthlyAmount || activeGroup?.monthlyAmount || 5000;
    const paid = payment ? payment.paidAmount : 0;
    const pending = Math.max(0, exp - paid);

    const text = t('whatsappReminderText', member.name, activeGroup?.name || 'Chit Group', selectedMonth, pending, exp);
    const cleanPhone = (member.mobile || '').replace(/\D/g, '');
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Filtered members list
  const filteredList = groupMembers.filter((m) => {
    const pay = monthPayments.find((p) => p.memberId === m.id);
    const status = pay ? pay.status : 'Pending';

    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.mobile.includes(searchQuery) ||
      m.memberCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-container">
      {/* Title & Add Payment Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {t('paymentsTitle')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {t('paymentsSubtitle')}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => handleOpenPayment()}
        >
          <PlusCircle size={17} />
          <span>{t('actionRecordPayment')}</span>
        </button>
      </div>

      {/* Group & Month Selectors */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          {/* Group Selector */}
          <div>
            <label className="form-label">{t('selectGroup')}</label>
            <select
              className="form-select"
              value={selectedGroupId}
              onChange={(e) => {
                setSelectedGroupId(e.target.value);
                const g = data.groups.find((grp) => grp.id === e.target.value);
                if (g) setSelectedMonth(g.currentMonth || 1);
              }}
            >
              {data.groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.status})
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div>
            <label className="form-label">{t('selectMonth')}</label>
            <select
              className="form-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {Array.from({ length: activeGroup ? activeGroup.monthsCount : 20 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  Month {m} {activeGroup && Number(activeGroup.currentMonth) === m ? '(Active Month)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="form-label">{t('statusCol')}</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Paid">{t('statusPaid')}</option>
              <option value="Partial">{t('statusPartial')}</option>
              <option value="Pending">{t('statusPending')}</option>
              <option value="Advance">{t('statusAdvance')}</option>
            </select>
          </div>

          {/* Search Member */}
          <div>
            <label className="form-label">Search Member</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2rem' }}
                placeholder="Name, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Month Summary Bar */}
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
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Month {selectedMonth} Expected
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              ₹{totalMonthExpected.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Month {selectedMonth} Collected
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
              ₹{totalMonthCollected.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Month {selectedMonth} Pending
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fb7185' }}>
              ₹{totalMonthPending.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Collection Progress
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-400)' }}>
              {collectionPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Collection Matrix Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>{t('memberId')}</th>
                <th>{t('memberName')}</th>
                <th>{t('expectedAmount')}</th>
                <th>{t('paidAmount')}</th>
                <th>{t('statusCol')}</th>
                <th>Proof</th>
                <th>{t('paymentDate')}</th>
                <th>{t('paymentMode')}</th>
                <th>{t('remarksCol')}</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    {t('noRecords')}
                  </td>
                </tr>
              ) : (
                filteredList.map((m) => {
                  const payment = monthPayments.find((p) => p.memberId === m.id);
                  const expected = m.monthlyAmount || activeGroup?.monthlyAmount || 5000;
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
                    <tr key={m.id}>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {m.memberCode}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        <span
                          style={{ cursor: 'pointer', color: 'var(--gold-400)' }}
                          onClick={() => {
                            setSelectedMemberId(m.id);
                            setActiveTab('member-details');
                          }}
                        >
                          {m.name}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.mobile}</div>
                      </td>
                      <td>₹{expected.toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 700, color: paid > 0 ? '#34d399' : 'inherit' }}>
                        ₹{paid.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`status-pill ${statusClass}`}>{status}</span>
                      </td>
                      <td>
                        {payment?.screenshot ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() =>
                              openScreenshotModal({
                                screenshotUrl: payment.screenshot,
                                title: `${m.name} - Month ${selectedMonth} Proof`,
                                memberName: m.name,
                                memberMobile: m.mobile,
                                memberId: m.id,
                                memberCode: m.memberCode,
                                groupName: activeGroup?.name || 'Chitti Group',
                                amount: payment.paidAmount,
                                monthNumber: selectedMonth,
                                utr: payment.referenceNo,
                                paymentMode: payment.paymentMode,
                                date: payment.paidDate,
                                status: 'Verified'
                              })
                            }
                            style={{
                              borderColor: '#25d366',
                              color: '#25d366',
                              padding: '0.2rem 0.5rem',
                              fontSize: '0.72rem'
                            }}
                            title="Click to view full screenshot proof"
                          >
                            <ImageIcon size={12} />
                            <span>Proof</span>
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>-</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{payment?.paidDate || '-'}</td>
                      <td style={{ fontSize: '0.82rem' }}>{payment?.paymentMode || '-'}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '170px' }}>
                        {payment?.remarks || '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          {status !== 'Paid' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              onClick={() => quickMarkPaid(selectedGroupId, m.id, selectedMonth, expected)}
                              title="1-Click Mark Paid"
                            >
                              <CheckCircle2 size={13} />
                              <span>{t('markPaid')}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleOpenPayment(m)}
                            title="Edit or log payment"
                          >
                            <Receipt size={13} />
                            <span>Log</span>
                          </button>

                          {status !== 'Paid' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-whatsapp"
                              onClick={() => handleSendWhatsApp(m, payment)}
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
