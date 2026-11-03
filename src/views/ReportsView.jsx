import React, { useState } from 'react';
import { useChits } from '../context/ChitContext';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Filter,
  Calendar,
  Layers,
  IndianRupee,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ReportsView = () => {
  const { data, getGroupStats, getMemberBalance, t } = useChits();

  const [reportType, setReportType] = useState('group'); // 'group', 'member', 'monthly', 'pending', 'history'
  const [selectedGroupId, setSelectedGroupId] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('ALL');

  // Trigger Print (Save as PDF)
  const handlePrint = () => {
    window.print();
  };

  // Export to CSV
  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `3KS_Chits_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;

    if (reportType === 'group') {
      headers = ['Group Name', 'Status', 'Members', 'Months', 'Monthly Amount (INR)', 'Total Expected (INR)', 'Total Collected (INR)', 'Total Pending (INR)'];
      rows = data.groups.map((g) => {
        const stats = getGroupStats(g.id);
        return [
          `"${g.name}"`,
          g.status,
          g.memberCount,
          g.monthsCount,
          g.monthlyAmount,
          stats.totalExpected,
          stats.totalCollected,
          stats.totalPending
        ];
      });
    } else if (reportType === 'member') {
      headers = ['Member Code', 'Member Name', 'Mobile', 'Group', 'Monthly Amount (INR)', 'Total Due (INR)', 'Total Paid (INR)', 'Pending Balance (INR)', 'Remarks'];
      const list = selectedGroupId === 'ALL' ? data.members : data.members.filter((m) => m.groupId === selectedGroupId);
      rows = list.map((m) => {
        const group = data.groups.find((g) => g.id === m.groupId);
        const b = getMemberBalance(m.id);
        return [
          m.memberCode,
          `"${m.name}"`,
          m.mobile,
          `"${group?.name || ''}"`,
          m.monthlyAmount,
          b.totalDue,
          b.totalPaid,
          b.pendingBalance,
          `"${m.remarks || ''}"`
        ];
      });
    } else if (reportType === 'pending') {
      headers = ['Member Code', 'Member Name', 'Mobile', 'Group', 'Pending Amount (INR)', 'Monthly Amount (INR)', 'Remarks'];
      const pendingList = data.members
        .map((m) => ({ ...m, ...getMemberBalance(m.id), group: data.groups.find((g) => g.id === m.groupId) }))
        .filter((m) => m.pendingBalance > 0 && (selectedGroupId === 'ALL' || m.groupId === selectedGroupId));

      rows = pendingList.map((m) => [
        m.memberCode,
        `"${m.name}"`,
        m.mobile,
        `"${m.group?.name || ''}"`,
        m.pendingBalance,
        m.monthlyAmount,
        `"${m.remarks || ''}"`
      ]);
    } else {
      // Monthly or Complete History
      headers = ['Transaction ID', 'Group', 'Member', 'Month', 'Expected (INR)', 'Paid (INR)', 'Status', 'Date', 'Mode', 'Ref No', 'Remarks'];
      let payList = data.payments;
      if (selectedGroupId !== 'ALL') payList = payList.filter((p) => p.groupId === selectedGroupId);
      if (selectedMonth !== 'ALL') payList = payList.filter((p) => Number(p.monthNumber) === Number(selectedMonth));

      rows = payList.map((p) => {
        const group = data.groups.find((g) => g.id === p.groupId);
        const member = data.members.find((m) => m.id === p.memberId);
        return [
          p.id,
          `"${group?.name || ''}"`,
          `"${member?.name || ''}"`,
          `Month ${p.monthNumber}`,
          p.expectedAmount,
          p.paidAmount,
          p.status,
          p.paidDate || '',
          p.paymentMode || '',
          p.referenceNo || '',
          `"${p.remarks || ''}"`
        ];
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container">
      {/* Printable Official Header (Shown only during PDF generation/print) */}
      <div className="print-only-header" style={{ display: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: '#0b1120' }}>3KS CHITS</h1>
            <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>Financial Savings, Chit Fund & Ledger Management</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.82rem', color: '#6b7280' }}>
            <div>Date: {new Date().toLocaleDateString('en-IN')}</div>
            <div>Report: {reportType.toUpperCase()} STATEMENT</div>
          </div>
        </div>
      </div>

      {/* Screen Controls & Header */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {t('reportsTitle')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {t('reportsSubtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} />
            <span>{t('exportCsv')}</span>
          </button>
          <button type="button" className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>{t('printPdf')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Tab Navigation */}
      <div className="card no-print" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        {/* Report Type Selector Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {[
            { id: 'group', label: t('repGroupWise') },
            { id: 'member', label: t('repMemberWise') },
            { id: 'pending', label: t('repPending') },
            { id: 'monthly', label: t('repMonthly') },
            { id: 'history', label: t('repHistory') }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setReportType(tab.id)}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: reportType === tab.id ? '1px solid var(--gold-400)' : '1px solid var(--border-color)',
                background: reportType === tab.id ? 'var(--gold-glow)' : 'rgba(15, 23, 42, 0.6)',
                color: reportType === tab.id ? 'var(--gold-400)' : 'var(--text-secondary)',
                fontWeight: reportType === tab.id ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scope Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label">{t('filterByGroup')}</label>
            <select
              className="form-select"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              <option value="ALL">All Chit Groups</option>
              {data.groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {(reportType === 'monthly' || reportType === 'history') && (
            <div>
              <label className="form-label">{t('selectMonth')}</label>
              <select
                className="form-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="ALL">All Months</option>
                {Array.from({ length: 20 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Month {m}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Render Table based on active Report Type */}
      <div className="card">
        {/* GROUP WISE REPORT */}
        {reportType === 'group' && (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>{t('groupName')}</th>
                  <th>{t('groupStatus')}</th>
                  <th>{t('groupMembers')}</th>
                  <th>{t('groupMonths')}</th>
                  <th>{t('monthlyAmount')}</th>
                  <th>{t('kpiTotalExpected')}</th>
                  <th>{t('kpiTotalCollected')}</th>
                  <th>{t('kpiTotalPending')}</th>
                </tr>
              </thead>
              <tbody>
                {data.groups.map((group) => {
                  const stats = getGroupStats(group.id);
                  return (
                    <tr key={group.id}>
                      <td style={{ fontWeight: 700 }}>{group.name}</td>
                      <td>
                        <span className={`status-pill ${group.status === 'Active' ? 'status-active' : 'status-completed'}`}>
                          {group.status}
                        </span>
                      </td>
                      <td>{group.memberCount}</td>
                      <td>{group.monthsCount}</td>
                      <td>₹{group.monthlyAmount.toLocaleString('en-IN')}</td>
                      <td>₹{stats.totalExpected.toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 700, color: '#34d399' }}>
                        ₹{stats.totalCollected.toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontWeight: 700, color: '#fb7185' }}>
                        ₹{stats.totalPending.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* MEMBER WISE REPORT */}
        {reportType === 'member' && (
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
                </tr>
              </thead>
              <tbody>
                {data.members
                  .filter((m) => selectedGroupId === 'ALL' || m.groupId === selectedGroupId)
                  .map((m) => {
                    const group = data.groups.find((g) => g.id === m.groupId);
                    const b = getMemberBalance(m.id);
                    return (
                      <tr key={m.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{m.memberCode}</td>
                        <td style={{ fontWeight: 600 }}>{m.name}</td>
                        <td>{m.mobile}</td>
                        <td>{group?.name || '-'}</td>
                        <td>₹{m.monthlyAmount.toLocaleString('en-IN')}</td>
                        <td>₹{b.totalDue.toLocaleString('en-IN')}</td>
                        <td style={{ color: '#34d399', fontWeight: 600 }}>
                          ₹{b.totalPaid.toLocaleString('en-IN')}
                        </td>
                        <td style={{ fontWeight: 700, color: b.pendingBalance > 0 ? '#fb7185' : '#34d399' }}>
                          ₹{b.pendingBalance.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* PENDING DUES REPORT */}
        {reportType === 'pending' && (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>{t('memberId')}</th>
                  <th>{t('memberName')}</th>
                  <th>{t('mobileNumber')}</th>
                  <th>Chit Group</th>
                  <th>{t('monthlyAmount')}</th>
                  <th>{t('totalPaid')}</th>
                  <th>{t('balanceAmount')} (Pending)</th>
                  <th>{t('remarksCol')}</th>
                </tr>
              </thead>
              <tbody>
                {data.members
                  .map((m) => ({ ...m, ...getMemberBalance(m.id), group: data.groups.find((g) => g.id === m.groupId) }))
                  .filter((m) => m.pendingBalance > 0 && (selectedGroupId === 'ALL' || m.groupId === selectedGroupId))
                  .map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{m.memberCode}</td>
                      <td style={{ fontWeight: 700 }}>{m.name}</td>
                      <td>{m.mobile}</td>
                      <td>{m.group?.name || '-'}</td>
                      <td>₹{m.monthlyAmount.toLocaleString('en-IN')}</td>
                      <td>₹{m.totalPaid.toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 800, color: '#fb7185' }}>
                        ₹{m.pendingBalance.toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{m.remarks || '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MONTHLY / COMPLETE HISTORY REPORT */}
        {(reportType === 'monthly' || reportType === 'history') && (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>{t('memberName')}</th>
                  <th>Chit Group</th>
                  <th>{t('monthCol')}</th>
                  <th>{t('expectedAmount')}</th>
                  <th>{t('paidAmount')}</th>
                  <th>{t('statusCol')}</th>
                  <th>{t('paymentMode')}</th>
                  <th>Ref No</th>
                  <th>{t('remarksCol')}</th>
                </tr>
              </thead>
              <tbody>
                {data.payments
                  .filter((p) => selectedGroupId === 'ALL' || p.groupId === selectedGroupId)
                  .filter((p) => selectedMonth === 'ALL' || Number(p.monthNumber) === Number(selectedMonth))
                  .map((p) => {
                    const group = data.groups.find((g) => g.id === p.groupId);
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
                        <td style={{ fontSize: '0.82rem' }}>{p.paidDate || '-'}</td>
                        <td style={{ fontWeight: 600 }}>{member?.name || '-'}</td>
                        <td style={{ fontSize: '0.82rem' }}>{group?.name || '-'}</td>
                        <td style={{ fontWeight: 700 }}>Month {p.monthNumber}</td>
                        <td>₹{(p.expectedAmount || 0).toLocaleString('en-IN')}</td>
                        <td style={{ fontWeight: 700, color: p.paidAmount > 0 ? '#34d399' : 'inherit' }}>
                          ₹{(p.paidAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span className={`status-pill ${statusClass}`}>{p.status}</span>
                        </td>
                        <td>{p.paymentMode || '-'}</td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.referenceNo || '-'}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.remarks || '-'}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
