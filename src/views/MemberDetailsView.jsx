import React, { useState } from 'react';
import { useChits } from '../context/ChitContext';
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Layers,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Receipt,
  MessageCircle,
  Share2,
  Printer,
  Image as ImageIcon,
  Eye
} from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal';

export const MemberDetailsView = () => {
  const {
    data,
    selectedMemberId,
    setActiveTab,
    getMemberBalance,
    getMemberHistory,
    openScreenshotModal,
    t
  } = useChits();

  const member = data.members.find((m) => m.id === selectedMemberId) || data.members[0];
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState({});

  if (!member) {
    return (
      <div className="page-container">
        <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('members')}>
          <ArrowLeft size={16} /> Back to Members
        </button>
        <p style={{ marginTop: '2rem' }}>No member selected.</p>
      </div>
    );
  }

  const group = data.groups.find((g) => g.id === member.groupId);
  const balance = getMemberBalance(member.id);
  const history = getMemberHistory(member.id);

  // Collect all WhatsApp & Payment screenshots for this member
  const memberScreenshots = [
    ...history.filter((h) => h.screenshot).map((h) => ({
      id: h.id,
      monthNumber: h.monthNumber,
      amount: h.paidAmount,
      date: h.paidDate,
      utr: h.referenceNo,
      paymentMode: h.paymentMode,
      screenshot: h.screenshot,
      source: 'Passbook Record'
    })),
    ...(data.whatsappMessages || [])
      .filter((w) => w.memberId === member.id && w.screenshot)
      .map((w) => ({
        id: w.id,
        monthNumber: w.monthNumber,
        amount: w.amount,
        date: w.timestamp,
        utr: w.utr,
        paymentMode: w.paymentMode,
        screenshot: w.screenshot,
        source: 'WhatsApp Feed'
      }))
  ];
  const uniqueScreenshots = Array.from(new Map(memberScreenshots.map((s) => [s.screenshot, s])).values());

  const handleEditPayment = (item) => {
    setModalInitial({
      groupId: member.groupId,
      memberId: member.id,
      monthNumber: item.monthNumber,
      expectedAmount: item.expectedAmount,
      paidAmount: item.paidAmount,
      status: item.status !== 'Upcoming' ? item.status : 'Paid',
      paymentMode: item.paymentMode !== '-' ? item.paymentMode : 'Cash',
      referenceNo: item.referenceNo || '',
      remarks: item.remarks || '',
      paidDate: item.paidDate || new Date().toISOString().split('T')[0]
    });
    setPaymentModalOpen(true);
  };

  const handleSendReminder = () => {
    const text = t(
      'whatsappReminderText',
      member.name,
      group?.name || 'Chit Group',
      group?.currentMonth || 1,
      balance.pendingBalance,
      member.monthlyAmount
    );
    const cleanPhone = (member.mobile || '').replace(/\D/g, '');
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSendReceipt = (p) => {
    const text = t(
      'whatsappReceiptText',
      member.name,
      group?.name || 'Chit Group',
      p.monthNumber,
      p.paidAmount,
      p.paidDate || new Date().toISOString().split('T')[0]
    );
    const cleanPhone = (member.mobile || '').replace(/\D/g, '');
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="page-container">
      {/* Back Button and Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setActiveTab('members')}
        >
          <ArrowLeft size={16} />
          <span>Back to Member Directory</span>
        </button>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          {balance.pendingBalance > 0 && (
            <button
              type="button"
              className="btn btn-sm btn-whatsapp"
              onClick={handleSendReminder}
            >
              <MessageCircle size={15} />
              <span>{t('sendReminder')}</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => window.print()}
          >
            <Printer size={15} />
            <span>Print Passbook</span>
          </button>
        </div>
      </div>

      {/* Member Profile Card */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--gold-400), var(--gold-600))',
                color: '#0b1120',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 800,
                boxShadow: 'var(--shadow-gold)'
              }}
            >
              {member.name.charAt(0)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {member.name}
                </h2>
                <span style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.08)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontFamily: 'monospace' }}>
                  {member.memberCode}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={14} color="var(--gold-400)" />
                  {member.mobile}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Layers size={14} color="var(--gold-400)" />
                  {group?.name || 'Chit Group'}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} color="var(--gold-400)" />
                  Joined: {member.joiningDate}
                </span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {t('monthlyAmount')}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold-400)' }}>
              ₹{member.monthlyAmount.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Balance Highlights Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-color)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {t('totalDue')} ({group?.currentMonth || 1} Months)
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              ₹{balance.totalDue.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {t('totalPaid')}
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399' }}>
              ₹{balance.totalPaid.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {t('balanceAmount')} (Pending)
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: balance.pendingBalance > 0 ? 'var(--rose-500)' : '#34d399' }}>
              ₹{balance.pendingBalance.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Advance Balance
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: balance.advanceAmount > 0 ? 'var(--indigo-500)' : 'var(--text-muted)' }}>
              ₹{balance.advanceAmount.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Month-by-Month Passbook Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Receipt size={18} color="var(--gold-400)" />
            <span>{t('passbookTitle')} (1 to {group?.monthsCount || 20} Months)</span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>{t('monthCol')}</th>
                <th>{t('expectedAmount')}</th>
                <th>{t('paidAmount')}</th>
                <th>{t('statusCol')}</th>
                <th>Proof</th>
                <th>{t('paymentDate')}</th>
                <th>{t('paymentMode')}</th>
                <th>{t('referenceNo')}</th>
                <th>{t('remarksCol')}</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => {
                const statusClass =
                  item.status === 'Paid'
                    ? 'status-paid'
                    : item.status === 'Partial'
                    ? 'status-partial'
                    : item.status === 'Advance'
                    ? 'status-advance'
                    : item.status === 'Upcoming'
                    ? 'status-completed'
                    : 'status-pending';

                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700 }}>Month {item.monthNumber}</td>
                    <td>₹{item.expectedAmount.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700, color: item.paidAmount > 0 ? '#34d399' : 'inherit' }}>
                      ₹{item.paidAmount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`status-pill ${statusClass}`}>{item.status}</span>
                    </td>
                    <td>
                      {item.screenshot ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() =>
                            openScreenshotModal({
                              screenshotUrl: item.screenshot,
                              title: `${member.name} - Month ${item.monthNumber} Receipt`,
                              memberName: member.name,
                              memberMobile: member.mobile,
                              memberId: member.id,
                              memberCode: member.memberCode,
                              groupName: group?.name || 'Chitti Group',
                              amount: item.paidAmount,
                              monthNumber: item.monthNumber,
                              utr: item.referenceNo,
                              paymentMode: item.paymentMode,
                              date: item.paidDate,
                              status: 'Verified'
                            })
                          }
                          style={{
                            borderColor: '#25d366',
                            color: '#25d366',
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.72rem'
                          }}
                          title="View WhatsApp Screenshot Proof"
                        >
                          <ImageIcon size={12} />
                          <span>Proof</span>
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>-</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{item.paidDate || '-'}</td>
                    <td style={{ fontSize: '0.82rem' }}>{item.paymentMode || '-'}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.referenceNo || '-'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '160px' }}>
                      {item.remarks || '-'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEditPayment(item)}
                          title="Record / Edit payment"
                        >
                          <Receipt size={13} />
                          <span>{item.paidAmount > 0 ? 'Edit' : 'Pay'}</span>
                        </button>

                        {item.paidAmount > 0 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-whatsapp"
                            onClick={() => handleSendReceipt(item)}
                            title="Send WhatsApp Receipt"
                          >
                            <MessageCircle size={13} />
                            <span>Receipt</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* WhatsApp Payment Proofs & Screenshots Gallery Card */}
      {uniqueScreenshots.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem', padding: '1.25rem' }}>
          <div className="card-header" style={{ marginBottom: '1rem', paddingBottom: '0.75rem' }}>
            <div className="card-title">
              <ImageIcon size={18} color="#25d366" />
              <span>WhatsApp Payment Proofs & Screenshots ({uniqueScreenshots.length})</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {uniqueScreenshots.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                className="screenshot-thumb-box"
                onClick={() =>
                  openScreenshotModal({
                    screenshotUrl: item.screenshot,
                    title: `${member.name} - Month ${item.monthNumber} Proof`,
                    memberName: member.name,
                    memberMobile: member.mobile,
                    memberId: member.id,
                    memberCode: member.memberCode,
                    groupName: group?.name || 'Chitti Group',
                    amount: item.amount,
                    monthNumber: item.monthNumber,
                    utr: item.utr,
                    paymentMode: item.paymentMode,
                    date: item.date,
                    status: 'Verified'
                  })
                }
              >
                <div style={{ height: '140px', background: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <img
                    src={item.screenshot}
                    alt={`Proof Month ${item.monthNumber}`}
                    style={{ maxWidth: '100%', maxHeight: '140px', objectFit: 'contain' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(5, 10, 24, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                      color: '#ffffff',
                      gap: '0.35rem',
                      fontWeight: 600,
                      fontSize: '0.78rem'
                    }}
                    className="screenshot-hover-overlay"
                  >
                    <Eye size={16} color="var(--gold-400)" />
                    <span>View Proof</span>
                  </div>
                </div>

                <div style={{ padding: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      Month {item.monthNumber}
                    </span>
                    <span style={{ fontWeight: 800, color: '#34d399', fontSize: '0.88rem' }}>
                      ₹{Number(item.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {item.paymentMode} • {item.date || 'Recorded'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Entry Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        initialData={modalInitial}
      />
    </div>
  );
};
