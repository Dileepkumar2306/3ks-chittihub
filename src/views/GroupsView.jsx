import React, { useState } from 'react';
import { useChits } from '../context/ChitContext';
import {
  Layers,
  PlusCircle,
  Users,
  Calendar,
  IndianRupee,
  Clock,
  ArrowRight,
  Edit2,
  Trash2,
  X,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const GroupsView = () => {
  const {
    data,
    addGroup,
    updateGroup,
    deleteGroup,
    setActiveTab,
    setSelectedGroupId,
    getGroupStats,
    t
  } = useChits();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formMembers, setFormMembers] = useState(20);
  const [formMonths, setFormMonths] = useState(20);
  const [formMonthlyAmount, setFormMonthlyAmount] = useState(5000);
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState('');
  const [formStatus, setFormStatus] = useState('Active');
  const [formCurrentMonth, setFormCurrentMonth] = useState(1);

  const openCreateModal = () => {
    setEditingGroup(null);
    setFormName('');
    setFormMembers(20);
    setFormMonths(20);
    setFormMonthlyAmount(5000);
    setFormStartDate(new Date().toISOString().split('T')[0]);
    // Auto compute end date: start + 20 months
    const d = new Date();
    d.setMonth(d.getMonth() + 20);
    setFormEndDate(d.toISOString().split('T')[0]);
    setFormStatus('Active');
    setFormCurrentMonth(1);
    setModalOpen(true);
  };

  const openEditModal = (group) => {
    setEditingGroup(group);
    setFormName(group.name);
    setFormMembers(group.memberCount);
    setFormMonths(group.monthsCount);
    setFormMonthlyAmount(group.monthlyAmount);
    setFormStartDate(group.startDate);
    setFormEndDate(group.endDate || '');
    setFormStatus(group.status);
    setFormCurrentMonth(group.currentMonth || 1);
    setModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Please enter group name.');
      return;
    }

    const payload = {
      name: formName,
      memberCount: Number(formMembers),
      monthsCount: Number(formMonths),
      monthlyAmount: Number(formMonthlyAmount),
      startDate: formStartDate,
      endDate: formEndDate,
      status: formStatus,
      currentMonth: Number(formCurrentMonth)
    };

    if (editingGroup) {
      updateGroup(editingGroup.id, payload);
    } else {
      addGroup(payload);
    }

    setModalOpen(false);
  };

  const handleSelectGroup = (id) => {
    setSelectedGroupId(id);
    setActiveTab('group-details');
  };

  return (
    <div className="page-container">
      {/* Header & Create Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {t('groupsTitle')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {t('groupsSubtitle')}
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={openCreateModal}>
          <PlusCircle size={17} />
          <span>{t('createGroup')}</span>
        </button>
      </div>

      {/* Chit Groups Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {data.groups.map((group) => {
          const stats = getGroupStats(group.id);
          const percent = stats.totalExpected > 0 ? Math.min(100, Math.round((stats.totalCollected / stats.totalExpected) * 100)) : 0;
          const totalPool = group.memberCount * group.monthlyAmount;

          return (
            <div key={group.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Header: Title and Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {group.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span>Month {group.currentMonth || 1} of {group.monthsCount}</span>
                      <span>•</span>
                      <span>{group.memberCount} members</span>
                    </div>
                  </div>

                  <span className={`status-pill ${group.status === 'Active' ? 'status-active' : 'status-completed'}`}>
                    {group.status === 'Active' ? t('active') : t('completed')}
                  </span>
                </div>

                {/* Key Metrics */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '1rem'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      {t('monthlyAmount')}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold-400)' }}>
                      ₹{group.monthlyAmount.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      {t('totalPoolValue')} / mo
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ₹{totalPool.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      {t('kpiTotalCollected')}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399' }}>
                      ₹{stats.totalCollected.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      {t('kpiTotalPending')}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fb7185' }}>
                      ₹{stats.totalPending.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    <span>{t('groupProgress')}</span>
                    <span>{percent}% Collected</span>
                  </div>
                  <div className="progress-bar-wrap" style={{ margin: 0 }}>
                    <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => openEditModal(group)}
                    title={t('editGroup')}
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn-icon"
                    style={{ color: 'var(--rose-500)' }}
                    onClick={() => setDeleteTargetId(group.id)}
                    title={t('deleteGroup')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleSelectGroup(group.id)}
                >
                  <span>{t('viewDetails')}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Group Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                <Layers size={20} color="var(--gold-400)" />
                <span>{editingGroup ? t('editGroup') : t('createGroup')}</span>
              </div>
              <button type="button" className="btn-icon" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {/* Group Name */}
                <div className="form-group">
                  <label className="form-label">{t('groupName')}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Group A - Sri Venkateswara (1 Lakh)"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                {/* Members & Months */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">{t('groupMembers')}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formMembers}
                      onChange={(e) => setFormMembers(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('groupMonths')}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formMonths}
                      onChange={(e) => setFormMonths(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Monthly Amount & Current Month */}
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
                    <label className="form-label">{t('currentMonthNum')}</label>
                    <input
                      type="number"
                      className="form-input"
                      min={1}
                      max={formMonths}
                      value={formCurrentMonth}
                      onChange={(e) => setFormCurrentMonth(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Calculated Pool Info */}
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(230, 175, 46, 0.1)',
                    border: '1px solid rgba(230, 175, 46, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem',
                    fontSize: '0.85rem'
                  }}
                >
                  Total monthly pool value: <strong>₹{(Number(formMembers) * Number(formMonthlyAmount)).toLocaleString('en-IN')}</strong> ({formMembers} × ₹{Number(formMonthlyAmount).toLocaleString('en-IN')})
                </div>

                {/* Start Date & End Date */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">{t('startDate')}</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('endDate')}</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t('groupStatus')}</label>
                  <select
                    className="form-select"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                  >
                    <option value="Active">{t('active')}</option>
                    <option value="Completed">{t('completed')}</option>
                  </select>
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) {
            deleteGroup(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="Delete Chit Group"
        message="Deleting this chit group will also remove its associated members and recorded payments. Are you sure you want to proceed?"
      />
    </div>
  );
};
