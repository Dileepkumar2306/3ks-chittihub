import React, { useState } from 'react';
import { useChits } from '../context/ChitContext';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  Calendar,
  IndianRupee,
  CreditCard,
  User,
  ShieldCheck
} from 'lucide-react';

export const ScreenshotModal = () => {
  const {
    activeScreenshotModal,
    closeScreenshotModal,
    setSelectedMemberId,
    setActiveTab,
    verifyWhatsAppPayment,
    t
  } = useChits();

  const [zoomLevel, setZoomLevel] = useState(1);

  if (!activeScreenshotModal) return null;

  const {
    screenshotUrl,
    title = 'WhatsApp Payment Screenshot',
    memberName = 'Member',
    memberMobile = '',
    memberId = null,
    memberCode = '',
    groupName = '',
    amount = 0,
    monthNumber = 1,
    utr = '',
    paymentMode = 'UPI',
    date = '',
    messageText = '',
    status = 'Verified',
    messageId = null
  } = activeScreenshotModal;

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.6));
  const handleResetZoom = () => setZoomLevel(1);

  const handleDownload = () => {
    if (!screenshotUrl) return;
    const a = document.createElement('a');
    a.href = screenshotUrl;
    a.download = `3KS_Chits_Receipt_${(memberName || 'Payment').replace(/\s+/g, '_')}_${Date.now()}.png`;
    a.click();
  };

  const handleOpenMemberPassbook = () => {
    if (memberId) {
      setSelectedMemberId(memberId);
      setActiveTab('member-details');
      closeScreenshotModal();
    }
  };

  const handleOpenWhatsAppChat = () => {
    const cleanPhone = (memberMobile || '').replace(/\D/g, '');
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = `Hi ${memberName}, regarding your chit payment for ${groupName || '3KS Chits'} Month ${monthNumber}...`;
    window.open(`https://wa.me/${phoneWithCode}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleVerify = () => {
    if (messageId) {
      verifyWhatsAppPayment(messageId);
      closeScreenshotModal();
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{ zIndex: 9999, background: 'rgba(5, 10, 24, 0.88)', backdropFilter: 'blur(8px)' }}
      onClick={closeScreenshotModal}
    >
      <div
        className="modal-content"
        style={{
          maxWidth: '920px',
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.5rem',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(37, 211, 102, 0.15)',
                color: '#25d366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <MessageCircle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {title}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                {groupName} {monthNumber ? `• Month ${monthNumber}` : ''}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Zoom Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-sm)',
                padding: '2px',
                border: '1px solid var(--border-color)'
              }}
            >
              <button
                type="button"
                className="btn-icon"
                onClick={handleZoomOut}
                title="Zoom Out"
                style={{ padding: '6px' }}
              >
                <ZoomOut size={16} />
              </button>
              <span style={{ fontSize: '0.75rem', padding: '0 6px', color: 'var(--text-secondary)' }}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                className="btn-icon"
                onClick={handleZoomIn}
                title="Zoom In"
                style={{ padding: '6px' }}
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                className="btn-icon"
                onClick={handleResetZoom}
                title="Reset Zoom"
                style={{ padding: '6px' }}
              >
                <RotateCcw size={14} />
              </button>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleDownload}
              title="Download Screenshot"
            >
              <Download size={14} />
              <span style={{ display: 'none', md: 'inline' }}>Download</span>
            </button>

            <button
              type="button"
              className="btn-icon"
              onClick={closeScreenshotModal}
              style={{ marginLeft: '0.25rem' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body: Split View (Image on left, Verified details on right) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
            flex: 1,
            overflow: 'hidden',
            minHeight: '440px'
          }}
          className="screenshot-split-view"
        >
          {/* Left: Image Container with Zoom */}
          <div
            style={{
              background: '#090d16',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              overflow: 'auto',
              borderRight: '1px solid var(--border-color)',
              position: 'relative'
            }}
          >
            {screenshotUrl ? (
              <img
                src={screenshotUrl}
                alt="Payment Screenshot Proof"
                style={{
                  maxWidth: '100%',
                  maxHeight: '520px',
                  borderRadius: '16px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out'
                }}
              />
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                No screenshot image provided
              </div>
            )}
          </div>

          {/* Right: Payment Breakdown Card */}
          <div
            style={{
              padding: '1.5rem',
              background: 'var(--bg-card)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
          >
            {/* Status & Amount Banner */}
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: status === 'Verified' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                border: `1px solid ${status === 'Verified' ? 'var(--emerald-border)' : 'var(--amber-border)'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  Verified Amount
                </span>
                <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  ₹{Number(amount).toLocaleString('en-IN')}
                </div>
              </div>

              <span
                className={`status-pill ${status === 'Verified' ? 'status-paid' : 'status-pending'}`}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                {status === 'Verified' ? '✓ Recorded & Verified' : '⏳ Pending Review'}
              </span>
            </div>

            {/* Member Details */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--gold-400)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Subscriber Information
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.84rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Member Name</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{memberName}</div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Member Code</div>
                  <div style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{memberCode || '-'}</div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Mobile Number</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{memberMobile || '-'}</div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Chitti Group</div>
                  <div style={{ color: 'var(--gold-400)', fontWeight: 600 }}>{groupName}</div>
                </div>
              </div>
            </div>

            {/* Transaction Breakdown */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--gold-400)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Payment & Banking Details
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Mode:</span>
                  <span style={{ fontWeight: 700, color: '#a78bfa' }}>{paymentMode}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>UTR / Ref No:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>{utr || '-'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date & Time:</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{date || 'Today'}</span>
                </div>

                {monthNumber && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>For Month:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Month {monthNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* WhatsApp Note Text if present */}
            {messageText && (
              <div
                style={{
                  background: 'rgba(37, 211, 102, 0.06)',
                  border: '1px solid rgba(37, 211, 102, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#25d366', fontWeight: 700, fontSize: '0.76rem', marginBottom: '0.25rem' }}>
                  <MessageCircle size={13} />
                  <span>WhatsApp Message:</span>
                </div>
                <div>"{messageText}"</div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingTop: '0.5rem' }}>
              {status !== 'Verified' && messageId && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleVerify}
                  style={{ width: '100%' }}
                >
                  <CheckCircle2 size={16} />
                  <span>{t('whatsAppVerifyAndRecord')}</span>
                </button>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {memberId && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleOpenMemberPassbook}
                  >
                    <User size={14} />
                    <span>View Passbook</span>
                  </button>
                )}

                {memberMobile && (
                  <button
                    type="button"
                    className="btn btn-whatsapp btn-sm"
                    onClick={handleOpenWhatsAppChat}
                  >
                    <MessageCircle size={14} />
                    <span>Chat on WhatsApp</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

