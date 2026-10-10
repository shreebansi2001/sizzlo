import React, { useState, useEffect, useMemo } from 'react';
import { 
  Check, X, RefreshCw, CreditCard, Banknote, QrCode, Globe, FileText, 
  ShieldCheck, AlertTriangle, Receipt, Download, Send, MessageCircle, 
  Plus, Search, Calendar, ChevronLeft, ChevronRight, Filter, Eye,
  ArrowUpRight, Clock, User, Phone, Mail, Award, Crown, Sparkles, CheckCircle2,
  DollarSign, Wallet, Printer, ExternalLink, ArrowDownLeft
} from 'lucide-react';
import axios from 'axios';
import { 
  fetchPendingBills, 
  approveBill, 
  rejectBill, 
  fetchShiftSummary, 
  fetchRazorpaySummary,
  BillSettlementDTO, 
  ShiftSummaryDTO,
  RazorpaySummaryDTO
} from '../api/client';
import { PendingPayment, Member, PaymentRecord } from '../types';

const safeCurrency = (val: any): string => {
  const num = Number(val);
  return isNaN(num) ? '₹0' : `₹${num.toLocaleString('en-IN')}`;
};

interface PaymentsPageProps {
  payments?: PendingPayment[];
}

export const PaymentsPage: React.FC<PaymentsPageProps> = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'subscriptions' | 'pos_settlements' | 'events' | 'dues' | 'gateway'>('all');
  
  // Data States
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [pendingBills, setPendingBills] = useState<BillSettlementDTO[]>([]);
  const [allBills, setAllBills] = useState<BillSettlementDTO[]>([]);
  const [shiftSummary, setShiftSummary] = useState<ShiftSummaryDTO | null>(null);
  const [razorpaySummary, setRazorpaySummary] = useState<RazorpaySummaryDTO | null>(null);
  const [duesList, setDuesList] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);

  // Manual Offline Entry Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    customerName: '',
    customerMobile: '',
    customerEmail: '',
    membershipId: '',
    paymentType: 'SUBSCRIPTION',
    planId: 'SIGNATURE',
    planName: 'Sizzlo Signature VIP Pass (Annual)',
    amount: 10000,
    paymentMode: 'CASH',
    outletName: 'Yanki Sizzlerr - CG Road',
    notes: 'In-person front desk counter collection'
  });
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Refund Confirmation Modal
  const [refundTarget, setRefundTarget] = useState<PaymentRecord | null>(null);
  const [refundReason, setRefundReason] = useState('Customer cancelled / billing dispute');
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recRes, billsQueue, allBillsRes, shift, rzpSum, membersRes] = await Promise.all([
        axios.get('/api/payments/records', { timeout: 3500 }).catch(() => ({ data: { success: true, data: [] } })),
        fetchPendingBills().catch(() => []),
        axios.get('/api/bills/all', { timeout: 3500 }).catch(() => ({ data: { success: true, data: [] } })),
        fetchShiftSummary().catch(() => null),
        fetchRazorpaySummary().catch(() => null),
        axios.get('/api/members', { timeout: 3500 }).catch(() => ({ data: { success: true, data: [] } }))
      ]);

      if (recRes.data?.success && Array.isArray(recRes.data.data)) {
        setPaymentRecords(recRes.data.data);
      }
      setPendingBills(billsQueue || []);
      if (allBillsRes.data?.success && Array.isArray(allBillsRes.data.data)) {
        setAllBills(allBillsRes.data.data);
      }
      setShiftSummary(shift);
      setRazorpaySummary(rzpSum);

      if (membersRes.data?.success && Array.isArray(membersRes.data.data)) {
        const dues = membersRes.data.data
          .filter((m: Member) => (m.pendingDues && m.pendingDues > 0) || m.status === 'Renewal Due')
          .map((m: Member) => ({
            id: m.membershipId,
            name: m.fullName,
            mobile: m.mobile,
            pending: m.pendingDues || 0,
            dueDate: m.expiryDate || 'Immediate',
            reminder: 'Ready to send',
          }));
        setDuesList(dues);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Filtered Payments computation
  const filteredPayments = useMemo(() => {
    return paymentRecords.filter((p) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || 
        (p.paymentId || '').toLowerCase().includes(term) ||
        (p.orderId || '').toLowerCase().includes(term) ||
        (p.customerName || '').toLowerCase().includes(term) ||
        (p.customerMobile || '').includes(term) ||
        (p.membershipId || '').toLowerCase().includes(term) ||
        (p.invoiceNumber || '').toLowerCase().includes(term);

      let matchesTab = true;
      if (activeTab === 'subscriptions') matchesTab = p.paymentType === 'SUBSCRIPTION';
      else if (activeTab === 'events') matchesTab = p.paymentType === 'EVENT_BOOKING';
      else if (activeTab === 'pos_settlements') matchesTab = p.paymentType === 'BILL_SETTLEMENT';

      const mode = (p.paymentMode || '').toUpperCase();
      let matchesMode = true;
      if (modeFilter === 'UPI') matchesMode = mode.includes('UPI');
      else if (modeFilter === 'CARD') matchesMode = mode.includes('CARD');
      else if (modeFilter === 'CASH') matchesMode = mode.includes('CASH');
      else if (modeFilter === 'QR') matchesMode = mode.includes('QR');
      else if (modeFilter === 'RAZORPAY') matchesMode = mode.includes('RAZORPAY');

      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

      return matchesSearch && matchesTab && matchesMode && matchesStatus;
    });
  }, [paymentRecords, activeTab, searchTerm, modeFilter, statusFilter]);

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab, modeFilter, statusFilter, pageSize]);

  // Pagination Computations
  const totalItems = filteredPayments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedRecords = useMemo(() => {
    return filteredPayments.slice(startIndex, endIndex);
  }, [filteredPayments, startIndex, endIndex]);

  // Summary Metrics calculations
  const totalCollectedSum = useMemo(() => {
    return paymentRecords
      .filter(p => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [paymentRecords]);

  const subscriptionRevenue = useMemo(() => {
    return paymentRecords
      .filter(p => p.status === 'SUCCESS' && p.paymentType === 'SUBSCRIPTION')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [paymentRecords]);

  const onlineGatewayVolume = useMemo(() => {
    return paymentRecords
      .filter(p => p.status === 'SUCCESS' && !p.paymentMode?.toUpperCase().includes('CASH'))
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [paymentRecords]);

  const cashCollections = useMemo(() => {
    return paymentRecords
      .filter(p => p.status === 'SUCCESS' && p.paymentMode?.toUpperCase().includes('CASH'))
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [paymentRecords]);

  const totalDuesSum = useMemo(() => {
    return duesList.reduce((sum, d) => sum + (Number(d.pending) || 0), 0);
  }, [duesList]);

  const handleApproveBill = async (billId: number) => {
    try {
      const res = await approveBill(billId);
      if (res) {
        setActionNotice(`✅ Bill #${billId} approved & settlement confirmed!`);
        loadData();
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (e: any) {
      setActionNotice(`Failed to approve: ${e.message}`);
    }
  };

  const handleRejectBill = async (billId: number) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    try {
      const res = await rejectBill(billId, reason);
      if (res) {
        setActionNotice(`❌ Bill #${billId} rejected.`);
        loadData();
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (e: any) {
      setActionNotice(`Failed to reject: ${e.message}`);
    }
  };

  const handleSaveManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingManual(true);
    try {
      const res = await axios.post('/api/payments/manual-entry', manualForm, { timeout: 3500 });
      if (res.data?.success) {
        setActionNotice(`🎉 Payment of ${safeCurrency(manualForm.amount)} recorded successfully!`);
        setShowManualModal(false);
        setManualForm({
          customerName: '',
          customerMobile: '',
          customerEmail: '',
          membershipId: '',
          paymentType: 'SUBSCRIPTION',
          planId: 'SIGNATURE',
          planName: 'Sizzlo Signature VIP Pass (Annual)',
          amount: 10000,
          paymentMode: 'CASH',
          outletName: 'Yanki Sizzlerr - CG Road',
          notes: 'In-person front desk counter collection'
        });
        loadData();
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (err: any) {
      setActionNotice(`Failed to record payment: ${err.message}`);
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!refundTarget) return;
    setIsProcessingRefund(true);
    try {
      const res = await axios.post(`/api/payments/${refundTarget.paymentId}/refund?reason=${encodeURIComponent(refundReason)}`, {}, { timeout: 3500 });
      if (res.data?.success) {
        setActionNotice(`💸 Payment ${refundTarget.paymentId} marked as REFUNDED.`);
        setRefundTarget(null);
        loadData();
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (err: any) {
      setActionNotice(`Refund failed: ${err.message}`);
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Payment ID', 'Order ID', 'Invoice #', 'Customer Name', 'Mobile', 'Type', 'Plan / Purpose', 'Amount (₹)', 'Payment Mode', 'Status', 'Outlet', 'Timestamp'];
    const rows = filteredPayments.map(p => [
      `"${p.paymentId}"`,
      `"${p.orderId || ''}"`,
      `"${p.invoiceNumber || ''}"`,
      `"${p.customerName}"`,
      `"${p.customerMobile}"`,
      `"${p.paymentType}"`,
      `"${p.planName || p.planId || ''}"`,
      `"${p.amount}"`,
      `"${p.paymentMode}"`,
      `"${p.status}"`,
      `"${p.outletName || ''}"`,
      `"${p.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sizzlo_Payments_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getModeBadge = (mode: string) => {
    const m = (mode || 'UPI').toUpperCase();
    if (m.includes('UPI')) return { label: 'UPI / QR', icon: QrCode, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
    if (m.includes('CARD')) return { label: 'Card / POS', icon: CreditCard, color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.15)' };
    if (m.includes('CASH')) return { label: 'Cash Counter', icon: Banknote, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' };
    return { label: 'Razorpay Net', icon: Globe, color: 'var(--gold)', bg: 'rgba(232, 184, 74, 0.15)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Toast Notice */}
      {actionNotice && (
        <div style={{
          background: 'rgba(232, 184, 74, 0.15)',
          border: '1px solid var(--gold)',
          color: 'var(--primary)',
          padding: '12px 18px',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          fontWeight: 600
        }}>
          <Sparkles size={16} color="var(--gold-dark)" />
          {actionNotice}
        </div>
      )}

      {/* 5 Top Executive Financial KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <div className="kpi-card" style={{ background: 'var(--surface)', borderRadius: 16, padding: 18, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-label" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL REVENUE COLLECTED</span>
            <Wallet size={16} color="var(--primary)" />
          </div>
          <div className="kpi-value" style={{ marginTop: 8, fontSize: 26, fontWeight: 800, color: '#FFFFFF' }}>
            {safeCurrency(totalCollectedSum)}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>All settled channels</span>
        </div>

        <div className="kpi-card" style={{ background: 'var(--surface)', borderRadius: 16, padding: 18, border: '1px solid rgba(232, 184, 74, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-label" style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>SUBSCRIPTION REVENUE</span>
            <Crown size={16} color="var(--gold)" />
          </div>
          <div className="kpi-value" style={{ marginTop: 8, fontSize: 26, fontWeight: 800, color: 'var(--gold)' }}>
            {safeCurrency(subscriptionRevenue)}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Annual VIP Pass sales</span>
        </div>

        <div className="kpi-card" style={{ background: 'var(--surface)', borderRadius: 16, padding: 18, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-label" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>ONLINE / GATEWAY VOLUME</span>
            <Globe size={16} color="#10B981" />
          </div>
          <div className="kpi-value" style={{ marginTop: 8, fontSize: 26, fontWeight: 800, color: '#10B981' }}>
            {safeCurrency(onlineGatewayVolume)}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Razorpay, UPI &amp; Cards</span>
        </div>

        <div className="kpi-card" style={{ background: 'var(--surface)', borderRadius: 16, padding: 18, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-label" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>CASH &amp; COUNTER POS</span>
            <Banknote size={16} color="#F59E0B" />
          </div>
          <div className="kpi-value" style={{ marginTop: 8, fontSize: 26, fontWeight: 800, color: '#F59E0B' }}>
            {safeCurrency(cashCollections)}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Physical outlet collections</span>
        </div>

        <div className="kpi-card" style={{ background: 'var(--surface)', borderRadius: 16, padding: 18, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-label" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>PENDING APPROVALS / DUES</span>
            <AlertTriangle size={16} color="#F87171" />
          </div>
          <div className="kpi-value" style={{ marginTop: 8, fontSize: 26, fontWeight: 800, color: pendingBills.length > 0 ? '#F87171' : '#FFFFFF' }}>
            {pendingBills.length} Bills / {safeCurrency(totalDuesSum)}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Cashier queue &amp; renewals</span>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 12, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Transactions Ledger', count: paymentRecords.length },
            { id: 'subscriptions', label: 'VIP Plan Purchases', count: paymentRecords.filter(p => p.paymentType === 'SUBSCRIPTION').length },
            { id: 'pos_settlements', label: 'Dine-In Bill Settlements', count: pendingBills.length + allBills.length },
            { id: 'events', label: 'Event & Brunch Passes', count: paymentRecords.filter(p => p.paymentType === 'EVENT_BOOKING').length },
            { id: 'dues', label: 'Pending Dues & Collections', count: duesList.length },
            { id: 'gateway', label: 'Razorpay Gateway & Telemetry', count: null },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                border: 'none',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                background: activeTab === t.id ? 'var(--primary)' : 'transparent',
                color: activeTab === t.id ? '#070A09' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s ease'
              }}
            >
              {t.label} {t.count !== null && <span style={{ opacity: 0.8, fontSize: 11 }}>({t.count})</span>}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowManualModal(true)}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              background: 'var(--primary)',
              border: 'none',
              color: '#000',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Plus size={14} /> Record Offline Payment
          </button>

          <button
            onClick={handleExportCSV}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR (for ledger tabs) */}
      {activeTab !== 'dues' && activeTab !== 'gateway' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-input" style={{ width: 280 }}>
              <Search size={16} color="#94A3B8" />
              <input 
                type="text" 
                placeholder="Search Txn ID, order, name, phone, invoice..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Mode Filter */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--surface-alt)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
              {['ALL', 'UPI', 'CARD', 'CASH', 'RAZORPAY'].map(m => (
                <button
                  key={m}
                  onClick={() => setModeFilter(m)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: 'none',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: modeFilter === m ? 'var(--primary)' : 'transparent',
                    color: modeFilter === m ? '#070A09' : 'var(--text-muted)'
                  }}
                >
                  {m === 'ALL' ? 'All Modes' : m}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--surface-alt)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
              {['ALL', 'SUCCESS', 'PENDING', 'REFUNDED'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: 'none',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: statusFilter === s ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: statusFilter === s ? '#FFFFFF' : 'var(--text-muted)'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1, 2, 4: UNIFIED PAYMENTS LEDGER */}
      {(activeTab === 'all' || activeTab === 'subscriptions' || activeTab === 'events') && (
        <div className="data-table-card" style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '140px' }}>Payment ID / Ref</th>
                <th>Customer Details</th>
                <th>Payment Type &amp; Item</th>
                <th>Mode of Payment</th>
                <th>Amount Paid</th>
                <th>Status</th>
                <th>Outlet / Channel</th>
                <th>Timestamp</th>
                <th style={{ textAlign: 'center' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '60px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <Receipt size={24} />
                      </div>
                      <p style={{ color: '#FFFFFF', fontWeight: 600, fontSize: 15, margin: 0 }}>
                        {loading ? 'Fetching transactions...' : 'No Payment Transactions Found'}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0, maxWidth: 360 }}>
                        {loading ? 'Please wait.' : 'Payments made via Mobile App (Razorpay/UPI) or offline counter settlements will appear here in real-time.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((p) => {
                  const modeBadge = getModeBadge(p.paymentMode);
                  const isSuccess = p.status === 'SUCCESS';
                  const isRefunded = p.status === 'REFUNDED';

                  return (
                    <tr key={p.id || p.paymentId}>
                      <td>
                        <div>
                          <span style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace', fontSize: 12 }}>
                            {p.paymentId}
                          </span>
                          {p.invoiceNumber && (
                            <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '2px 0 0', fontFamily: 'monospace' }}>
                              {p.invoiceNumber}
                            </p>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          <p style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 13, margin: 0 }}>{p.customerName || 'Patron'}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', margin: '2px 0 0' }}>{p.customerMobile}</p>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: p.paymentType === 'SUBSCRIPTION' ? 'rgba(232, 184, 74, 0.15)' : 'rgba(96, 165, 250, 0.15)',
                            color: p.paymentType === 'SUBSCRIPTION' ? 'var(--gold)' : '#60A5FA',
                            border: `1px solid ${p.paymentType === 'SUBSCRIPTION' ? 'rgba(232, 184, 74, 0.3)' : 'rgba(96, 165, 250, 0.3)'}`
                          }}>
                            {p.paymentType}
                          </span>
                          <p style={{ fontSize: 11, color: '#FFFFFF', fontWeight: 600, margin: '4px 0 0' }}>
                            {p.planName || p.planId || 'Direct Payment'}
                          </p>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 20,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          background: modeBadge.bg,
                          color: modeBadge.color
                        }}>
                          <modeBadge.icon size={12} />
                          {p.paymentMode}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, color: '#FFFFFF', fontSize: 14 }}>
                        {safeCurrency(p.amount)}
                      </td>
                      <td>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 20,
                          background: isSuccess ? 'rgba(16, 185, 129, 0.15)' : isRefunded ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: isSuccess ? '#10B981' : isRefunded ? '#EF4444' : '#F59E0B',
                          border: `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.3)' : isRefunded ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {p.outletName || 'Digital Online'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {p.createdAt ? p.createdAt.replace('T', ' ').substring(0, 16) : 'Just now'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button
                            onClick={() => setSelectedReceipt(p)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 8,
                              background: 'var(--surface-alt)',
                              border: '1px solid var(--border)',
                              color: 'var(--primary)',
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            title="View Digital Receipt"
                          >
                            <Receipt size={12} /> Receipt
                          </button>

                          {isSuccess && (
                            <button
                              onClick={() => setRefundTarget(p)}
                              style={{
                                padding: '6px 8px',
                                borderRadius: 8,
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#EF4444',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              title="Process Refund"
                            >
                              Refund
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

          {/* Pagination Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            borderTop: '1px solid var(--border)',
            background: 'var(--surface-alt)',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: 12
          }}>
            <div style={{ color: 'var(--text-muted)' }}>
              Showing <strong style={{ color: '#FFFFFF' }}>{totalItems === 0 ? 0 : startIndex + 1}</strong> to{' '}
              <strong style={{ color: '#FFFFFF' }}>{endIndex}</strong> of{' '}
              <strong style={{ color: 'var(--primary)' }}>{totalItems}</strong> payments
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                style={{
                  padding: '4px 10px',
                  borderRadius: 8,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: '#FFFFFF',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={validCurrentPage <= 1}
                style={{
                  padding: '5px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: validCurrentPage <= 1 ? 'rgba(255,255,255,0.2)' : '#FFFFFF',
                  cursor: validCurrentPage <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600
                }}
              >
                <ChevronLeft size={14} /> Prev
              </button>

              <span style={{ color: 'var(--text-muted)', padding: '0 8px' }}>
                Page <strong style={{ color: 'var(--primary)' }}>{validCurrentPage}</strong> of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage >= totalPages}
                style={{
                  padding: '5px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: validCurrentPage >= totalPages ? 'rgba(255,255,255,0.2)' : '#FFFFFF',
                  cursor: validCurrentPage >= totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600
                }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DINE-IN BILL SETTLEMENTS & CASHIER QUEUE */}
      {activeTab === 'pos_settlements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Pending Approval Queue */}
          <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', padding: 20, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                  Live Cashier Verification Queue ({pendingBills.length})
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Dining table settlement requests pending manager approval
                </p>
              </div>
            </div>

            {pendingBills.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                🎉 No pending table settlements. All cashier bills are cleared!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                {pendingBills.map(b => (
                  <div key={b.id} style={{ background: 'var(--surface-alt)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 14, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary)', fontSize: 13 }}>
                        Bill #{b.id} {b.posInvoiceNumber ? `· ${b.posInvoiceNumber}` : ''}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B' }}>
                        {b.paymentMode}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{b.customerName || 'Walk-in Patron'}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Cashier: {b.cashierId || 'Front Counter'} · {b.outletName}</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8, marginBottom: 14, fontSize: 12 }}>
                      <span>Gross: {safeCurrency(b.grossAmount)}</span>
                      <span>Discount: -{safeCurrency(b.discountAmount)}</span>
                      <span style={{ fontWeight: 800, color: 'var(--gold)' }}>Net: {safeCurrency(b.netPayable)}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleApproveBill(b.id)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: 8,
                          background: '#10B981',
                          border: 'none',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: 12,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4
                        }}
                      >
                        <Check size={14} /> Approve Settlement
                      </button>

                      <button
                        onClick={() => handleRejectBill(b.id)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#EF4444',
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: PENDING DUES & REMINDERS */}
      {activeTab === 'dues' && (
        <div className="data-table-card" style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Member Name &amp; Phone</th>
                <th>Outstanding Dues</th>
                <th>Due Date / Expiry</th>
                <th>Reminder Action</th>
              </tr>
            </thead>
            <tbody>
              {duesList.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    🎉 No outstanding dues or expired renewals found! All accounts in good standing.
                  </td>
                </tr>
              ) : (
                duesList.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                      {d.id}
                    </td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{d.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', margin: '2px 0 0' }}>{d.mobile}</p>
                      </div>
                    </td>
                    <td style={{ fontWeight: 800, color: '#F87171', fontSize: 14 }}>
                      {safeCurrency(d.pending)}
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.dueDate}</span>
                    </td>
                    <td>
                      <a
                        href={`https://wa.me/${(d.mobile || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Dear ${d.name}, gentle reminder from Sizzlo Club regarding your subscription renewal / dining dues of ${safeCurrency(d.pending)}. Please settle online or visit your nearest outlet to continue enjoying VIP privileges.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          background: 'rgba(37, 211, 102, 0.15)',
                          border: '1px solid rgba(37, 211, 102, 0.3)',
                          color: '#25D366',
                          fontWeight: 700,
                          fontSize: 11,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5
                        }}
                      >
                        <MessageCircle size={13} /> Send WhatsApp Payment Link
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 6: RAZORPAY GATEWAY TELEMETRY */}
      {activeTab === 'gateway' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', padding: 24, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <ShieldCheck size={20} color="var(--gold)" />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', margin: 0 }}>Razorpay Gateway Status</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>API Key ID:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                  {razorpaySummary?.keyId || 'rzp_live_S5dgGJ3fEPa3fO'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Gateway Connection:</span>
                <span style={{ fontWeight: 700, color: '#10B981' }}>● OPERATIONAL (LIVE)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Webhook URL:</span>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#FFFFFF' }}>/api/payments/razorpay/webhook</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Settlement Cadence:</span>
                <span style={{ fontWeight: 700, color: '#FFFFFF' }}>T+1 Automated Bank Settlement</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: DIGITAL TAX INVOICE / RECEIPT MODAL */}
      {selectedReceipt && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          backdropFilter: 'blur(6px)',
          padding: 20
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            width: '100%',
            maxWidth: 520,
            padding: 28,
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--gold)', letterSpacing: '0.08em' }}>
                  SIZZLO HOSPITALITY GROUP
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', margin: '4px 0 0' }}>
                  Tax Invoice &amp; Receipt
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace', margin: '2px 0 0' }}>
                  {selectedReceipt.invoiceNumber || `INV-${selectedReceipt.paymentId}`}
                </p>
              </div>

              <button
                onClick={() => setSelectedReceipt(null)}
                style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 10, padding: 6, cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Receipt Summary Card */}
            <div style={{ background: 'var(--surface-alt)', borderRadius: 14, padding: 18, border: '1px solid var(--border)', marginBottom: 18, fontSize: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 14 }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                  <p style={{ fontWeight: 700, color: '#FFFFFF', margin: '2px 0 0' }}>{selectedReceipt.customerName}</p>
                  <p style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 11, margin: 0 }}>{selectedReceipt.customerMobile}</p>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Date:</span>
                  <p style={{ fontWeight: 700, color: '#FFFFFF', margin: '2px 0 0' }}>
                    {selectedReceipt.createdAt ? selectedReceipt.createdAt.replace('T', ' ').substring(0, 16) : 'Recent'}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: 0 }}>{selectedReceipt.outletName || 'Digital'}</p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Item / Plan:</span>
                  <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{selectedReceipt.planName || selectedReceipt.planId || selectedReceipt.paymentType}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Mode:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{selectedReceipt.paymentMode}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Transaction ID:</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#FFFFFF' }}>{selectedReceipt.paymentId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: 8, marginTop: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: '#FFFFFF' }}>Net Amount Paid:</span>
                  <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--gold)' }}>{safeCurrency(selectedReceipt.amount)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => window.print()}
                style={{
                  padding: '9px 16px',
                  borderRadius: 10,
                  background: 'var(--surface-alt)',
                  border: '1px solid var(--border)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Printer size={14} /> Print Receipt
              </button>

              <button
                onClick={() => setSelectedReceipt(null)}
                style={{
                  padding: '9px 20px',
                  borderRadius: 10,
                  background: 'var(--primary)',
                  border: 'none',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MANUAL OFFLINE PAYMENT RECORDING */}
      {showManualModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          backdropFilter: 'blur(6px)',
          padding: 20
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            width: '100%',
            maxWidth: 520,
            padding: 24
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                Record Counter / Offline Payment
              </h3>
              <button
                onClick={() => setShowManualModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveManualPayment} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Customer Full Name *
                </label>
                <input
                  required
                  type="text"
                  value={manualForm.customerName}
                  onChange={(e) => setManualForm({ ...manualForm, customerName: e.target.value })}
                  placeholder="e.g. Ramesh Shah"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'var(--surface-alt)', border: '1px solid var(--border)', color: '#FFFFFF', fontSize: 12 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Customer Mobile Number *
                  </label>
                  <input
                    required
                    type="text"
                    value={manualForm.customerMobile}
                    onChange={(e) => setManualForm({ ...manualForm, customerMobile: e.target.value })}
                    placeholder="+91 98250 12345"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'var(--surface-alt)', border: '1px solid var(--border)', color: '#FFFFFF', fontSize: 12 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Amount (₹) *
                  </label>
                  <input
                    required
                    type="number"
                    value={manualForm.amount}
                    onChange={(e) => setManualForm({ ...manualForm, amount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'var(--surface-alt)', border: '1px solid var(--border)', color: '#FFFFFF', fontSize: 12, fontWeight: 700 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Payment Type
                  </label>
                  <select
                    value={manualForm.paymentType}
                    onChange={(e) => setManualForm({ ...manualForm, paymentType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'var(--surface-alt)', border: '1px solid var(--border)', color: '#FFFFFF', fontSize: 12 }}
                  >
                    <option value="SUBSCRIPTION">VIP Subscription</option>
                    <option value="BILL_SETTLEMENT">Dining Bill Settlement</option>
                    <option value="EVENT_BOOKING">Event / Brunch Booking</option>
                    <option value="BANQUET_ADVANCE">Banquet Advance</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Payment Mode
                  </label>
                  <select
                    value={manualForm.paymentMode}
                    onChange={(e) => setManualForm({ ...manualForm, paymentMode: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'var(--surface-alt)', border: '1px solid var(--border)', color: '#FFFFFF', fontSize: 12 }}
                  >
                    <option value="CASH">Cash Counter</option>
                    <option value="STORE_QR">Store QR (Paytm/GPay)</option>
                    <option value="POS_TERMINAL">Card Swipe (POS)</option>
                    <option value="UPI">Direct UPI Transfer</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  style={{ padding: '9px 16px', borderRadius: 8, background: 'var(--surface-alt)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  style={{ padding: '9px 20px', borderRadius: 8, background: 'var(--primary)', border: 'none', color: '#000', fontWeight: 800, cursor: 'pointer' }}
                >
                  {isSubmittingManual ? 'Recording...' : 'Save & Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REFUND CONFIRMATION */}
      {refundTarget && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          backdropFilter: 'blur(6px)',
          padding: 20
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 20,
            width: '100%',
            maxWidth: 440,
            padding: 24
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#EF4444', margin: 0, marginBottom: 8 }}>
              Confirm Payment Refund
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px' }}>
              Are you sure you want to mark transaction <strong>{refundTarget.paymentId}</strong> for <strong>{safeCurrency(refundTarget.amount)}</strong> as refunded?
            </p>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Refund Reason:
              </label>
              <input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: 'var(--surface-alt)', border: '1px solid var(--border)', color: '#FFFFFF', fontSize: 12 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setRefundTarget(null)}
                style={{ padding: '8px 14px', borderRadius: 8, background: 'var(--surface-alt)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                disabled={isProcessingRefund}
                onClick={handleProcessRefund}
                style={{ padding: '8px 18px', borderRadius: 8, background: '#EF4444', border: 'none', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer' }}
              >
                {isProcessingRefund ? 'Refunding...' : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
