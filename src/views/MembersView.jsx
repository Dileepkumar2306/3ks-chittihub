import React, { useState } from 'react';
import { useChits } from '../context/ChitContext';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ArrowRight,
  Edit2,
  Trash2,
  X,
  MessageCircle,
  FileText
} from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const MembersView = () => {
  const {
    data,
    addMember,
    updateMember,
    deleteMember,
    getMemberBalance,
    setSelectedMemberId,
    setActiveTab,
    t
  } = useChits();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, CLEAR

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formGroupId, setFormGroupId] = useState(data.groups[0]?.id || '');
  const [formJoiningDate, setFormJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [formMonthlyAmount, setFormMonthlyAmount] = useState(5000);
  const [formRemarks, setFormRemarks] = useState('');

  const openAddModal = () => {
    setEditingMember(null);
    setFormName('');
    setFormMobile('');
    const firstGroup = data.groups[0];
    setFormGroupId(firstGroup?.id || '');
    setFormJoiningDate(new Date().toISOString().split('T')[0]);
    setFormMonthlyAmount(firstGroup?.monthlyAmount || 5000);
    setFormRemarks('');
    setModalOpen(true);
  };

  const openEditModal = (m) => {
    setEditingMember(m);
    setFormName(m.name);
    setFormMobile(m.mobile);
    setFormGroupId(m.groupId);
    setFormJoiningDate(m.joiningDate || new Date().toISOString().split('T')[0]);
    setFormMonthlyAmount(m.monthlyAmount);
    setFormRemarks(m.remarks || '');
    setModalOpen(true);
  };

  const handleGroupSelect = (gId) => {
    setFormGroupId(gId);
    const grp = data.groups.find((g) => g.id === gId);
    if (grp) {
      setFormMonthlyAmount(grp.monthlyAmount);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formMobile.trim()) {
      alert('Please enter member name and mobile number.');
      return;
    }

    const payload = {
      name: formName,
      mobile: formMobile,
      groupId: formGroupId,
      joiningDate: formJoiningDate,
      monthlyAmount: Number(formMonthlyAmount),
      remarks: formRemarks
    };

    if (editingMember) {
      updateMember(editingMember.id, payload);
    } else {
      addMember(payload);
    }

    setModalOpen(false);
  };

  const handleSendWhatsApp = (member, balance) => {
    const group = data.groups.find((g) => g.id === member.groupId);
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

  // Filter members list
  const filteredMembers = data.members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.mobile.includes(searchQuery) ||
      m.memberCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup = selectedGroupFilter === 'ALL' || m.groupId === selectedGroupFilter;

    const balance = getMemberBalance(m.id);
    let matchesStatus = true;
    if (statusFilter === 'PENDING') {
      matchesStatus = balance.pendingBalance > 0;
    } else if (statusFilter === 'CLEAR') {
      matchesStatus = balance.pendingBalance === 0;
    }

    return matchesSearch && matchesGroup && matchesStatus;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {t('membersTitle')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {t('membersSubtitle')} ({filteredMembers.length} of {data.members.length})
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={openAddModal}>
          <UserPlus size={17} />
          <span>{t('addMember')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Group Filter */}
          <div>
            <select
              className="form-select"
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
            >
              <option value="ALL">All Chit Groups</option>
              {data.groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PENDING">With Overdue Balance</option>
              <option value="CLEAR">All Dues Cleared (Nil Balance)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Member Directory Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>{t('memberId')}</th>
                <th>{t('memberName')}</th>
                <th>{t('mobileNumber')}</th>
                <th>Chit Group</th>
                <th>{t('monthlyAmount')}</th>
                <th>{t('totalDue')}</th>
                <th>{t('totalPaid')}</th>
                <th>{t('balanceAmount')}</th>
                <th>{t('remarksCol')}</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    {t('noRecords')}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const group = data.groups.find((g) => g.id === member.groupId);
                  const balance = getMemberBalance(member.id);

                  return (
                    <tr key={member.id}>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
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
                      <td style={{ fontSize: '0.84rem' }}>{member.mobile}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {group?.name || '-'}
                      </td>
                      <td>₹{member.monthlyAmount.toLocaleString('en-IN')}</td>
                      <td>₹{balance.totalDue.toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 600, color: '#34d399' }}>
                        ₹{balance.totalPaid.toLocaleString('en-IN')}
                      </td>
                      <td>
                        {balance.pendingBalance > 0 ? (
                          <span style={{ fontWeight: 800, color: 'var(--rose-500)' }}>
                            ₹{balance.pendingBalance.toLocaleString('en-IN')}
                          </span>
                        ) : balance.advanceAmount > 0 ? (
                          <span style={{ fontWeight: 700, color: 'var(--indigo-500)' }}>
                            +₹{balance.advanceAmount.toLocaleString('en-IN')} Adv
                          </span>
                        ) : (
                          <span style={{ color: '#34d399', fontWeight: 600 }}>Nil (Clear)</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '140px' }}>
                        {member.remarks || '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          {/* Passbook View Link */}
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              setSelectedMemberId(member.id);
                              setActiveTab('member-details');
                            }}
                            title={t('viewPassbook')}
                          >
                            <FileText size={13} />
                            <span>Passbook</span>
                          </button>

                          {/* WhatsApp Reminder if dues */}
                          {balance.pendingBalance > 0 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-whatsapp"
                              onClick={() => handleSendWhatsApp(member, balance)}
                              title="Send WhatsApp Reminder"
                            >
                              <MessageCircle size={13} />
                            </button>
                          )}

                          {/* Edit Member */}
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => openEditModal(member)}
                            title={t('editMember')}
                          >
                            <Edit2 size={13} />
                          </button>

                          {/* Delete Member */}
                          <button
                            type="button"
                            className="btn-icon"
                            style={{ color: 'var(--rose-500)' }}
                            onClick={() => setDeleteTargetId(member.id)}
                            title={t('deleteMember')}
                          >
                            <Trash2 size={13} />
                          </button>
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

      {/* Add / Edit Member Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                <Users size={20} color="var(--gold-400)" />
                <span>{editingMember ? t('editMember') : t('addMember')}</span>
              </div>
              <button type="button" className="btn-icon" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {/* Member Name */}
                <div className="form-group">
                  <label className="form-label">{t('memberName')}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ravi Kumar"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div className="form-group">
                  <label className="form-label">{t('mobileNumber')}</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="10-digit mobile number (e.g. 9848012345)"
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                    required
                  />
                </div>

                {/* Chit Group Selection */}
                <div className="form-group">
                  <label className="form-label">{t('selectGroup')}</label>
                  <select
                    className="form-select"
                    value={formGroupId}
                    onChange={(e) => handleGroupSelect(e.target.value)}
                    required
                  >
                    {data.groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} - ₹{g.monthlyAmount}/mo
                      </option>
                    ))}
                  </select>
                </div>

                {/* Monthly Amount & Joining Date */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">{t('monthlyAmount')} (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formMonthlyAmount}
                      onChange={(e) => setFormMonthlyAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('joiningDate')}</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formJoiningDate}
                      onChange={(e) => setFormJoiningDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Remarks */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t('remarks')}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Regular payer, prefers Google Pay"
                    value={formRemarks}
                    onChange={(e) => setFormRemarks(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Member Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) {
            deleteMember(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="Delete Member"
        message="Are you sure you want to remove this member? All their historical payment records will also be deleted."
      />
    </div>
  );
};
