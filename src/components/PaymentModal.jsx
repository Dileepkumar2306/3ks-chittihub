import React, { useState, useEffect, useRef } from 'react';
import { useChits } from '../context/ChitContext';
import { X, Receipt, IndianRupee, Calendar, CreditCard, MessageSquare, Image as ImageIcon, Trash2, Upload } from 'lucide-react';

export const PaymentModal = ({ isOpen, onClose, initialData = {} }) => {
  const { data, recordPayment, t } = useChits();

  const [groupId, setGroupId] = useState(initialData.groupId || (data.groups[0]?.id || ''));
  const [memberId, setMemberId] = useState(initialData.memberId || '');
  const [monthNumber, setMonthNumber] = useState(initialData.monthNumber || 1);
  const [paidAmount, setPaidAmount] = useState(initialData.paidAmount ?? '');
  const [expectedAmount, setExpectedAmount] = useState(initialData.expectedAmount || 5000);
  const [status, setStatus] = useState(initialData.status || 'Paid');
  const [paymentMode, setPaymentMode] = useState(initialData.paymentMode || 'Cash');
  const [referenceNo, setReferenceNo] = useState(initialData.referenceNo || '');
  const [remarks, setRemarks] = useState(initialData.remarks || '');
  const [paidDate, setPaidDate] = useState(initialData.paidDate || new Date().toISOString().split('T')[0]);
  const [screenshot, setScreenshot] = useState(initialData.screenshot || null);

  const fileInputRef = useRef(null);

  // Available members in chosen group
  const groupMembers = data.members.filter((m) => m.groupId === groupId);
  const currentGroup = data.groups.find((g) => g.id === groupId);

  // Sync state when initialData changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const gId = initialData.groupId || (data.groups[0]?.id || '');
      setGroupId(gId);

      const memList = data.members.filter((m) => m.groupId === gId);
      const mId = initialData.memberId || (memList[0]?.id || '');
      setMemberId(mId);

      const grp = data.groups.find((g) => g.id === gId);
      const mNum = initialData.monthNumber || (grp?.currentMonth || 1);
      setMonthNumber(mNum);

      const member = data.members.find((m) => m.id === mId);
      const exp = initialData.expectedAmount || (member?.monthlyAmount || grp?.monthlyAmount || 5000);
      setExpectedAmount(exp);

      // Check if there is an existing payment record for this month
      const existing = data.payments.find(
        (p) => p.groupId === gId && p.memberId === mId && Number(p.monthNumber) === Number(mNum)
      );

      if (existing) {
        setPaidAmount(existing.paidAmount);
        setStatus(existing.status);
        setPaymentMode(existing.paymentMode || 'Cash');
        setReferenceNo(existing.referenceNo || '');
        setRemarks(existing.remarks || '');
        setPaidDate(existing.paidDate || new Date().toISOString().split('T')[0]);
        setScreenshot(existing.screenshot || null);
      } else {
        setPaidAmount(initialData.paidAmount !== undefined ? initialData.paidAmount : exp);
        setStatus(initialData.status || 'Paid');
        setPaymentMode(initialData.paymentMode || 'Cash');
        setReferenceNo(initialData.referenceNo || '');
        setRemarks(initialData.remarks || 'Paid ✓');
        setPaidDate(new Date().toISOString().split('T')[0]);
        setScreenshot(initialData.screenshot || null);
      }
    }
  }, [isOpen, initialData, groupId]);

  // When group changes, auto-select first member of that group
  const handleGroupChange = (newGId) => {
    setGroupId(newGId);
    const memList = data.members.filter((m) => m.groupId === newGId);
    const firstMem = memList[0];
    if (firstMem) {
      setMemberId(firstMem.id);
      setExpectedAmount(firstMem.monthlyAmount || 5000);
      setPaidAmount(firstMem.monthlyAmount || 5000);
    }
  };

  // When member changes, update expected amount
  const handleMemberChange = (newMId) => {
    setMemberId(newMId);
    const member = data.members.find((m) => m.id === newMId);
    if (member) {
      setExpectedAmount(member.monthlyAmount);
      setPaidAmount(member.monthlyAmount);
    }
  };

  // Auto update status based on amount entered
  const handleAmountChange = (val) => {
    setPaidAmount(val);
    const num = Number(val);
    const exp = Number(expectedAmount);
    if (num >= exp && exp > 0) {
      setStatus(num > exp ? 'Advance' : 'Paid');
    } else if (num > 0 && num < exp) {
      setStatus('Partial');
    } else {
      setStatus('Pending');
    }
  };

  const handleRemarkChip = (text) => {
    setRemarks(text);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!groupId || !memberId) {
      alert('Please select both group and member.');
      return;
    }

    recordPayment({
      groupId,
      memberId,
      monthNumber: Number(monthNumber),
      paidAmount: Number(paidAmount) || 0,
      expectedAmount: Number(expectedAmount) || 0,
      status,
      paymentMode,
      referenceNo,
      remarks,
      paidDate,
      screenshot
    });

    onClose();
  };

  if (!isOpen) return null;

  const currentPaid = Number(paidAmount) || 0;
  const currentExp = Number(expectedAmount) || 0;
  const balance = Math.max(0, currentExp - currentPaid);
  const extraAdvance = Math.max(0, currentPaid - currentExp);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">
            <Receipt size={20} color="var(--gold-400)" />
            <span>{t('paymentsTitle')}</span>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Group Selection */}
            <div className="form-group">
              <label className="form-label">{t('selectGroup')}</label>
              <select
                className="form-select"
                value={groupId}
                onChange={(e) => handleGroupChange(e.target.value)}
                required
              >
                {data.groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Member Selection */}
            <div className="form-group">
              <label className="form-label">{t('memberName')}</label>
              <select
                className="form-select"
                value={memberId}
                onChange={(e) => handleMemberChange(e.target.value)}
                required
              >
                {groupMembers.length === 0 ? (
                  <option value="">No members in this group</option>
                ) : (
                  groupMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.memberCode}) - ₹{m.monthlyAmount}/mo
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Month & Expected Amount Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">{t('selectMonth')}</label>
                <select
                  className="form-select"
                  value={monthNumber}
                  onChange={(e) => setMonthNumber(Number(e.target.value))}
                >
                  {Array.from({ length: currentGroup ? currentGroup.monthsCount : 20 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      Month {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('expectedAmount')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    className="form-input"
                    value={expectedAmount}
                    onChange={(e) => setExpectedAmount(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Paid Amount & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--gold-400)' }}>
                  {t('paidAmount')} (₹)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={paidAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('statusCol')}</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Paid">{t('statusPaid')}</option>
                  <option value="Partial">{t('statusPartial')}</option>
                  <option value="Pending">{t('statusPending')}</option>
                  <option value="Advance">{t('statusAdvance')}</option>
                </select>
              </div>
            </div>

            {/* Balance Calculation Indicator */}
            <div
              style={{
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.82rem'
              }}
            >
              <span>
                {t('expectedAmount')}: <strong>₹{currentExp.toLocaleString('en-IN')}</strong>
              </span>
              <span>
                {t('paidAmount')}: <strong>₹{currentPaid.toLocaleString('en-IN')}</strong>
              </span>
              <span style={{ color: balance > 0 ? 'var(--rose-500)' : extraAdvance > 0 ? 'var(--indigo-500)' : 'var(--emerald-500)' }}>
                {extraAdvance > 0 ? `Advance: +₹${extraAdvance.toLocaleString('en-IN')}` : `Balance: ₹${balance.toLocaleString('en-IN')}`}
              </span>
            </div>

            {/* Payment Date & Mode */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">{t('paymentDate')}</label>
                <input
                  type="date"
                  className="form-input"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('paymentMode')}</label>
                <select
                  className="form-select"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="GPay">Google Pay (GPay)</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                </select>
              </div>
            </div>

            {/* UTR Reference */}
            <div className="form-group">
              <label className="form-label">{t('referenceNo')}</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. UPI/2026/8912"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
              />
            </div>

            {/* Attached WhatsApp Screenshot Proof */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ImageIcon size={14} color="#25d366" />
                  <span>WhatsApp / UPI Screenshot Proof</span>
                </span>
                {screenshot && (
                  <button
                    type="button"
                    onClick={() => setScreenshot(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--rose-500)',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}
                  >
                    <Trash2 size={12} />
                    <span>Remove</span>
                  </button>
                )}
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => setScreenshot(event.target.result);
                    reader.readAsDataURL(file);
                  }
                }}
              />

              {screenshot ? (
                <div
                  style={{
                    position: 'relative',
                    background: '#090d16',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem',
                    textAlign: 'center'
                  }}
                >
                  <img
                    src={screenshot}
                    alt="Payment Proof"
                    style={{ maxHeight: '140px', maxWidth: '100%', borderRadius: '6px' }}
                  />
                  <div style={{ marginTop: '0.35rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    >
                      Replace Screenshot
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '1px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    <Upload size={14} color="var(--gold-400)" />
                    <span>Click to attach WhatsApp screenshot (or paste image)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Remarks with quick clickable chips */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{t('remarks')}</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter remarks (e.g. Paid through UPI, Will pay tomorrow)"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />

              {/* Quick Remark Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.6rem' }}>
                {['Paid through UPI', 'Cash handed directly', 'Will pay tomorrow', 'Will pay on 25th', 'Partial payment', 'Advance paid'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleRemarkChip(chip)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.2rem 0.6rem',
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn btn-primary">
              {t('recordPaymentBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
