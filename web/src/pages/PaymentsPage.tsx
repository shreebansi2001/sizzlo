import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  RefreshCw, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Globe, 
  FileText, 
  ShieldCheck, 
  AlertTriangle,
  Receipt,
  Download,
  Send,
  MessageCircle,
  Link as LinkIcon
} from 'lucide-react';
import { 
  fetchPendingBills, 
  approveBill, 
  rejectBill, 
  fetchShiftSummary, 
  fetchRazorpayTransactions,
  fetchRazorpaySummary,
  BillSettlementDTO, 
  ShiftSummaryDTO,
  RazorpayTransactionDTO,
  RazorpaySummaryDTO
} from '../api/client';
import { PendingPayment, Member } from '../types';
import { DEFAULT_USERS_DATASET } from '../data/defaultUsers';
import axios from 'axios';

const safeCurrency = (val: any): string => {
  const num = Number(val);
  return isNaN(num) ? '₹0' : `₹${num.toLocaleString('en-IN')}`;
};

const safeNumber = (val: any): string => {
  const num = Number(val);
  return isNaN(num) ? '0' : num.toLocaleString('en-IN');
};

interface PaymentsPageProps {
  payments?: PendingPayment[];
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({ payments: initialPayments }) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'shift' | 'dues' | 'razorpay'>('queue');
  const [pendingBills, setPendingBills] = useState<BillSettlementDTO[]>([]);
  const [shiftSummary, setShiftSummary] = useState<ShiftSummaryDTO | null>(null);
  const [razorpayTransactions, setRazorpayTransactions] = useState<RazorpayTransactionDTO[]>([]);
  const [razorpaySummary, setRazorpaySummary] = useState<RazorpaySummaryDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [modeFilter, setModeFilter] = useState<string>('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [inspectingBill, setInspectingBill] = useState<BillSettlementDTO | null>(null);

  // Dues state
  const [paymentList, setPaymentList] = useState<PendingPayment[]>(initialPayments || []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bills, shift, rzpTxns, rzpSum] = await Promise.all([
        fetchPendingBills(),
        fetchShiftSummary(),
        fetchRazorpayTransactions(),
        fetchRazorpaySummary()
      ]);
      setPendingBills(bills);
      setShiftSummary(shift);
      setRazorpayTransactions(rzpTxns);
      setRazorpaySummary(rzpSum);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Polling every 5s for live cashier updates
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    axios.get('/api/members', { timeout: 2000 })
      .then(res => {
        const membersToUse = (res.data?.success && res.data.data?.length) ? res.data.data : DEFAULT_USERS_DATASET;
        const duesMembers = membersToUse
          .filter((m: Member) => (m.pendingDues && m.pendingDues > 0) || m.status === 'Renewal Due')
          .map((m: Member) => ({
            id: m.membershipId,
            name: m.fullName,
            mobile: m.mobile,
            pending: m.pendingDues > 0 ? m.pendingDues : 10000,
            dueDate: m.expiryDate,
            reminder: 'Ready to send',
          }));
        setPaymentList(duesMembers);
      })
      .catch(() => {
        const duesMembers = DEFAULT_USERS_DATASET
          .filter((m: Member) => (m.pendingDues && m.pendingDues > 0) || m.status === 'Renewal Due')
          .map((m: Member) => ({
            id: m.membershipId,
            name: m.fullName,
            mobile: m.mobile,
            pending: m.pendingDues > 0 ? m.pendingDues : 10000,
            dueDate: m.expiryDate,
            reminder: 'Ready to send',
          }));
        setPaymentList(duesMembers);
      });
  }, []);

  const handleApprove = async (billId: number, invoiceNo: string) => {
    try {
      const res = await approveBill(billId, 'CSH-01');
      if (res.success) {
        setActionNotice(`Bill #${invoiceNo} APPROVED! Coupon burned permanently & loyalty points credited to customer.`);
        await loadData();
      } else {
        setActionNotice(`Error: ${res.message}`);
      }
    } catch (e: any) {
      setActionNotice(`Approval failed: ${e.message}`);
    }
    setTimeout(() => setActionNotice(null), 4500);
  };

  const handleReject = async (billId: number, invoiceNo: string) => {
    const reason = window.prompt(`Reason for rejecting Bill #${invoiceNo}:`, 'Discrepancy in POS invoice amount');
    if (!reason) return;
    try {
      const res = await rejectBill(billId, reason);
      if (res.success) {
        setActionNotice(`Bill #${invoiceNo} has been rejected.`);
        await loadData();
      }
    } catch (e: any) {
      setActionNotice(`Rejection failed: ${e.message}`);
    }
    setTimeout(() => setActionNotice(null), 4000);
  };

  const filteredBills = pendingBills.filter(b => {
    if (modeFilter === 'ALL') return true;
    return b.paymentMode === modeFilter;
  });

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'CASH': return <Banknote size={16} color="#10B981" />;
      case 'CARD': return <CreditCard size={16} color="#3B82F6" />;
      case 'ONLINE': return <Globe size={16} color="#A855F7" />;
      case 'STORE_QR': return <QrCode size={16} color="#FF8A00" />;
      default: return <Receipt size={16} color="var(--primary)" />;
    }
  };

  return (
    <div>
      {/* Top Banner Alert */}
      {actionNotice && (
        <div style={{
          background: 'rgba(232, 184, 74, 0.15)',
          border: '1px solid var(--gold)',
          color: 'var(--primary)',
          padding: '12px 18px',
          borderRadius: 12,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          fontWeight: 600
        }}>
          <Check size={16} color="var(--gold-dark)" />
          {actionNotice}
        </div>
      )}

      {/* Header & Sub-Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
            Cashier Operations &amp; Payment Settlement Desk
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            SRS Chapter 10 &amp; 18: Non-Integrated POS Standalone Verification, Coupon Burn &amp; Points Crediting
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{
          display: 'flex',
          gap: 6,
          background: 'var(--surface)',
          padding: 4,
          borderRadius: 12,
          border: '1px solid var(--border)'
        }}>
          <button
            onClick={() => setActiveTab('queue')}
            style={{
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: activeTab === 'queue' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'queue' ? '#070A09' : 'var(--text-muted)'
            }}
          >
            <Receipt size={14} /> Settlement Queue
            {pendingBills.length > 0 && (
              <span style={{
                background: activeTab === 'queue' ? '#070A09' : '#EF4444',
                color: activeTab === 'queue' ? 'var(--primary)' : '#FFF',
                borderRadius: 9999,
                fontSize: 10,
                padding: '1px 6px',
                fontWeight: 800
              }}>
                {pendingBills.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('shift')}
            style={{
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: activeTab === 'shift' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'shift' ? '#070A09' : 'var(--text-muted)'
            }}
          >
            <FileText size={14} /> Shift Closeout
          </button>

          <button
            onClick={() => setActiveTab('dues')}
            style={{
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: activeTab === 'dues' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'dues' ? '#070A09' : 'var(--text-muted)'
            }}
          >
            <ShieldCheck size={14} /> Subscriber Dues
          </button>

          <button
            onClick={() => setActiveTab('razorpay')}
            style={{
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: activeTab === 'razorpay' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'razorpay' ? '#070A09' : 'var(--text-muted)'
            }}
          >
            <Globe size={14} /> Razorpay Gateway
            <span style={{
              background: activeTab === 'razorpay' ? '#070A09' : '#10B981',
              color: activeTab === 'razorpay' ? '#10B981' : '#FFF',
              borderRadius: 9999,
              fontSize: 9,
              padding: '1px 5px',
              fontWeight: 800
            }}>
              LIVE
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: LIVE CASHIER SETTLEMENT QUEUE (SRS CHAPTER 10 & 18) */}
      {/* ======================================================== */}
      {activeTab === 'queue' && (
        <div>
          {/* Top Quick Status & Mode Filters */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 20
          }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { label: 'All Modes', val: 'ALL' },
                { label: 'Cash Payments', val: 'CASH' },
                { label: 'Card EDC Swipes', val: 'CARD' },
                { label: 'Store Counter QR', val: 'STORE_QR' },
                { label: 'Online In-App', val: 'ONLINE' },
              ].map(f => (
                <button
                  key={f.val}
                  onClick={() => setModeFilter(f.val)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: modeFilter === f.val ? '1px solid var(--primary)' : '1px solid var(--border)',
                    background: modeFilter === f.val ? 'rgba(255, 138, 0, 0.15)' : 'var(--surface)',
                    color: modeFilter === f.val ? 'var(--primary)' : 'var(--text-muted)'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              onClick={loadData}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'var(--surface-alt)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh Live Queue
            </button>
          </div>

          {/* Pending Bills Grid / Table */}
          {filteredBills.length === 0 ? (
            <div style={{
              background: 'var(--surface)',
              borderRadius: 20,
              border: '1px solid var(--border)',
              padding: '60px 20px',
              textAlign: 'center'
            }}>
              <Check size={40} color="#10B981" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>
                Cashier Queue is All Clear!
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 450, margin: '8px auto 0' }}>
                No dining bills currently pending verification. When customers enter their POS Invoice Number in the Sizzlo mobile app, they appear here instantly.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
              {filteredBills.map((b) => (
                <div
                  key={b.id}
                  style={{
                    background: 'var(--surface)',
                    borderRadius: 16,
                    border: '1px solid var(--border)',
                    padding: 20,
                    boxShadow: 'var(--shadow-card)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Top Header Card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          background: 'rgba(255, 138, 0, 0.15)',
                          color: 'var(--primary)',
                          padding: '2px 8px',
                          borderRadius: 6
                        }}>
                          POS #{b.posInvoiceNumber}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {b.outletName}
                        </span>
                      </div>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginTop: 6 }}>
                        {b.customerName}
                      </h4>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {b.customerMobile}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 10px',
                      borderRadius: 8,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border)'
                    }}>
                      {getModeIcon(b.paymentMode)}
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)' }}>
                        {b.paymentMode.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div style={{
                    background: 'var(--background)',
                    padding: 12,
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    marginBottom: 14
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                      <span>Gross Bill Amount:</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{safeCurrency(b.grossAmount)}</span>
                    </div>

                    {b.couponCode && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#10B981', marginBottom: 4 }}>
                        <span>Coupon [{b.couponCode}]:</span>
                        <span style={{ fontWeight: 700 }}>-{safeCurrency(b.discountAmount)}</span>
                      </div>
                    )}

                    {b.tableAdvanceDeduction && b.tableAdvanceDeduction > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#10B981', marginBottom: 4 }}>
                        <span>Table Holding Advance {b.bookingReference ? `[${b.bookingReference}]` : ''}:</span>
                        <span style={{ fontWeight: 700 }}>-₹{b.tableAdvanceDeduction.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {b.receiptImageUrl && (
                      <div style={{ marginTop: 6, marginBottom: 6, padding: '6px 10px', borderRadius: 8, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, color: '#3B82F6', fontWeight: 600 }}>📸 POS Receipt Attached</span>
                        <button
                          type="button"
                          onClick={() => setInspectingBill(b)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: 11,
                            color: '#3B82F6',
                            fontWeight: 800,
                            textDecoration: 'underline',
                            cursor: 'pointer'
                          }}
                        >
                          Inspect Receipt
                        </button>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, color: 'var(--primary)', borderTop: '1px solid var(--border)', paddingTop: 6, marginTop: 4 }}>
                      <span>Net Payable:</span>
                      <span style={{ fontSize: 16 }}>{safeCurrency(b.netPayable)}</span>
                    </div>
                  </div>

                  {/* Mode Specific Verification Hint */}
                  {b.paymentMode === 'STORE_QR' && (
                    <div style={{
                      background: 'rgba(255, 138, 0, 0.1)',
                      border: '1px dashed var(--primary)',
                      borderRadius: 10,
                      padding: '8px 12px',
                      marginBottom: 14,
                      fontSize: 11,
                      color: 'var(--primary)'
                    }}>
                      <strong>Verify Counter UTR:</strong> {b.upiUtr || 'Pending UTR Entry'}
                    </div>
                  )}

                  {b.paymentMode === 'CASH' && (
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px dashed #10B981',
                      borderRadius: 10,
                      padding: '8px 12px',
                      marginBottom: 14,
                      fontSize: 11,
                      color: '#10B981'
                    }}>
                      <strong>Action:</strong> Verify physical cash of ₹{b.netPayable} received from server.
                    </div>
                  )}

                  {b.paymentMode === 'CARD' && (
                    <div style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px dashed #3B82F6',
                      borderRadius: 10,
                      padding: '8px 12px',
                      marginBottom: 14,
                      fontSize: 11,
                      color: '#3B82F6'
                    }}>
                      <strong>Action:</strong> Check printed EDC card charge slip matches POS #{b.posInvoiceNumber}.
                    </div>
                  )}

                  {/* Approval / Rejection Action Buttons */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <button
                      onClick={() => handleReject(b.id, b.posInvoiceNumber)}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                        background: 'var(--surface-alt)',
                        color: 'var(--danger)',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <X size={14} /> Flag Discrepancy
                    </button>

                    <button
                      onClick={() => handleApprove(b.id, b.posInvoiceNumber)}
                      style={{
                        flex: 1.5,
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: 'none',
                        background: 'var(--primary)',
                        color: '#070A09',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        boxShadow: '0 4px 12px rgba(255, 138, 0, 0.25)'
                      }}
                    >
                      <Check size={16} /> Approve &amp; Burn Coupon
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: SHIFT RECONCILIATION CLOSEOUT (SRS CHAPTER 18.2)   */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* TAB 2: SHIFT RECONCILIATION CLOSEOUT (SRS CHAPTER 18.2)   */}
      {/* ======================================================== */}
      {activeTab === 'shift' && (() => {
        const raw = (shiftSummary || {}) as any;
        const cashRev = Number(raw.cashRevenue ?? raw.cashCollected ?? 0);
        const cardRev = Number(raw.cardRevenue ?? raw.cardEdcSlips ?? 0);
        const qrRev = Number(raw.qrRevenue ?? raw.storeCounterQrTotal ?? 0);
        const onlineRev = Number(raw.onlineRevenue ?? raw.onlineGatewayTotal ?? 0);
        const discountRev = Number(raw.totalDiscounts ?? raw.totalPromotionalDiscount ?? 0);
        const totalTx = Number(raw.totalTransactions ?? raw.approvedCount ?? 0);
        const shiftDate = raw.shiftDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const recStatus = raw.reconciliationStatus || 'Balanced (0.00 Variance)';
        const newSubs = Number(raw.newSubscriptionsEnrolled ?? 0);

        return (
          <div>
            <div style={{
              background: 'var(--surface)',
              borderRadius: 20,
              border: '1px solid var(--border)',
              padding: 24,
              marginBottom: 24,
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>
                    End-of-Shift Reconciliation Report
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Operational Date: {shiftDate} · Shift Counter Desk #1
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 800,
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10B981',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    Status: {recStatus}
                  </span>

                  <button
                    onClick={() => alert('Shift reconciliation PDF exported.')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 8,
                      background: 'var(--primary)',
                      border: 'none',
                      color: '#070A09',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={14} /> Export Shift PDF
                  </button>
                </div>
              </div>

              {/* Metrics Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div className="kpi-card">
                  <span className="kpi-label">TOTAL SIZZLO BILLS</span>
                  <div className="kpi-value" style={{ marginTop: 6, fontSize: 24 }}>{totalTx}</div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Verified dining settlements</span>
                </div>

                <div className="kpi-card">
                  <span className="kpi-label">CASH COLLECTED</span>
                  <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: '#10B981' }}>
                    {safeCurrency(cashRev)}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Physical cash in drawer</span>
                </div>

                <div className="kpi-card">
                  <span className="kpi-label">CARD EDC SLIPS</span>
                  <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: '#3B82F6' }}>
                    {safeCurrency(cardRev)}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Counter EDC machine total</span>
                </div>

                <div className="kpi-card">
                  <span className="kpi-label">STORE COUNTER QR</span>
                  <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: '#FF8A00' }}>
                    {safeCurrency(qrRev)}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>UPI Soundbox / QR transfers</span>
                </div>

                <div className="kpi-card">
                  <span className="kpi-label">ONLINE GATEWAY</span>
                  <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: '#A855F7' }}>
                    {safeCurrency(onlineRev)}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>In-App Razorpay settlements</span>
                </div>

                <div className="kpi-card">
                  <span className="kpi-label">COUPON DISCOUNTS</span>
                  <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: '#EF4444' }}>
                    {safeCurrency(discountRev)}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Burned subscriber vouchers</span>
                </div>

                <div className="kpi-card">
                  <span className="kpi-label">FLOOR SUBSCRIPTIONS</span>
                  <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: 'var(--primary)' }}>
                    {newSubs}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Enrolled by captains today</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* TAB 3: SUBSCRIBER DUES & REMINDERS                        */}
      {/* ======================================================== */}
      {activeTab === 'dues' && (
        <div style={{
          background: 'var(--surface)',
          borderRadius: 20,
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>Outstanding Subscriber Dues</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Automated payment collection reminders via WhatsApp, SMS, and Email</p>
            </div>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              background: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--danger)',
              padding: '4px 10px',
              borderRadius: 20
            }}>
              {paymentList.length} Pending Accounts
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Amount Due</th>
                  <th>Plan Tier</th>
                  <th>Due Date</th>
                  <th>Reminder Status</th>
                  <th>Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentList.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Check size={24} color="#10B981" style={{ display: 'block', margin: '0 auto 8px' }} />
                      No subscriber dues currently pending. All user accounts are fully settled and cleared!
                    </td>
                  </tr>
                ) : (
                  paymentList.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.id} · {p.mobile}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--danger)' }}>
                        {safeCurrency(p.pending)}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        background: 'rgba(255, 138, 0, 0.15)',
                        color: 'var(--primary)',
                        padding: '3px 8px',
                        borderRadius: 6
                      }}>
                        VIP Annual
                      </span>
                    </td>
                    <td style={{ fontSize: 13, fontWeight: 600 }}>{p.dueDate}</td>
                    <td>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: p.reminder.includes('today') ? 'var(--warning)' : 'var(--text-muted)'
                      }}>
                        {p.reminder}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => {
                            setActionNotice(`SMS reminder sent to ${p.name}`);
                            setTimeout(() => setActionNotice(null), 3000);
                          }}
                          style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#10B981',
                            padding: '6px 10px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 700
                          }}
                        >
                          <MessageCircle size={12} /> WhatsApp Nudge
                        </button>

                        <button
                          onClick={() => {
                            setPaymentList(paymentList.filter(item => item.id !== p.id));
                            setActionNotice(`Payment settled for ${p.name}`);
                            setTimeout(() => setActionNotice(null), 3000);
                          }}
                          style={{
                            background: 'var(--primary)',
                            color: '#070A09',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 700
                          }}
                        >
                          <Check size={12} /> Mark Settled
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: RAZORPAY GATEWAY & RECONCILIATION LEDGER */}
      {/* ======================================================== */}
      {activeTab === 'razorpay' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Gateway Status Header Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 16,
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 10px #10B981'
                }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#10B981', letterSpacing: '0.02em' }}>
                  RAZORPAY GATEWAY CONNECTED &amp; ACTIVE
                </h3>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Key ID: <code style={{ color: 'var(--primary)', background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: 4 }}>{razorpaySummary?.keyId || 'rzp_test_SIZZLO_VIP2026'}</code> · Webhook Auto-Clearance Active · Zero Manual Approval Required for Mode 3
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={async () => {
                  try {
                    await axios.post('/api/payments/razorpay/webhook', {
                      event: 'payment.captured',
                      amount: 10000
                    });
                    setActionNotice('Test Webhook dispatched! Simulated instant payment captured.');
                    await loadData();
                    setTimeout(() => setActionNotice(null), 4000);
                  } catch (e: any) {
                    setActionNotice('Webhook test trigger error');
                  }
                }}
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10B981',
                  padding: '8px 16px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <RefreshCw size={13} /> Test Webhook Ping
              </button>
            </div>
          </div>

          {/* Metric KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16
          }}>
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 20
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                TOTAL RAZORPAY VOLUME
              </span>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', marginTop: 8 }}>
                {safeCurrency(razorpaySummary?.totalVolumeInRupees ?? 0)}
              </div>
              <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>
                ● 100% Verified in Escrow
              </span>
            </div>

            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 20
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                ONLINE TRANSACTIONS
              </span>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#FFFFFF', marginTop: 8 }}>
                {razorpayTransactions.length}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Subscriptions &amp; Dine-in Bills
              </span>
            </div>

            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 20
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                PAYMENT CHANNELS
              </span>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginTop: 8 }}>
                UPI / Cards / NetBanking
              </div>
              <span style={{ fontSize: 11, color: '#10B981' }}>
                Instant App Webhook Routing
              </span>
            </div>

            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 20
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                CASHIER CLEARANCE
              </span>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#10B981', marginTop: 8 }}>
                AUTO-SETTLED
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Bypasses physical till delay
              </span>
            </div>
          </div>

          {/* Transactions Table */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>
                  Razorpay Real-Time Transactions &amp; Audit Log
                </h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Live synchronized orders, payment IDs, and automatic loyalty allocations
                </p>
              </div>
              <button
                onClick={loadData}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--primary)',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700, fontSize: 11 }}>ORDER &amp; PAYMENT ID</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700, fontSize: 11 }}>CUSTOMER</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700, fontSize: 11 }}>PURPOSE / TYPE</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700, fontSize: 11 }}>METHOD</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700, fontSize: 11 }}>AMOUNT</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700, fontSize: 11 }}>STATUS</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700, fontSize: 11 }}>TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {razorpayTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No online Razorpay transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  razorpayTransactions.map((tx, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 12 }}>{tx.orderId}</div>
                        <div style={{ color: 'var(--primary)', fontSize: 11, fontFamily: 'monospace' }}>{tx.paymentId}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{tx.customerName || 'User'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tx.customerMobile || '+91 98250 12345'}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 800,
                          background: tx.type === 'SUBSCRIPTION' ? 'rgba(217, 119, 6, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                          color: tx.type === 'SUBSCRIPTION' ? '#F59E0B' : '#60A5FA',
                          border: `1px solid ${tx.type === 'SUBSCRIPTION' ? 'rgba(217, 119, 6, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`
                        }}>
                          {tx.type} {tx.planId ? `(${tx.planId})` : tx.posInvoiceNumber ? `(${tx.posInvoiceNumber})` : ''}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12 }}>
                        {tx.channel || 'GATEWAY_UPI'}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--primary)' }}>
                        {safeCurrency(tx.amount)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 800,
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10B981',
                          border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}>
                          {tx.status || 'CAPTURED'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 11 }}>
                        {tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* POS Receipt Image Inspection Modal */}
      {inspectingBill && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(6px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 24,
            maxWidth: 600,
            width: '100%',
            padding: 24,
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                  POS Physical Receipt Inspection
                </h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Invoice #{inspectingBill.posInvoiceNumber} · {inspectingBill.customerName} ({inspectingBill.outletName})
                </span>
              </div>
              <button 
                onClick={() => setInspectingBill(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: '#0a0a0a',
              borderRadius: 16,
              overflow: 'hidden',
              textAlign: 'center',
              marginBottom: 16,
              border: '1px solid var(--border)',
              padding: 10
            }}>
              <img
                src={inspectingBill.receiptImageUrl}
                alt="POS Receipt"
                style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: 8 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18, background: 'var(--surface-alt)', padding: 12, borderRadius: 12 }}>
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Gross Bill</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>₹{inspectingBill.grossAmount.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Coupon Discount</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>-₹{inspectingBill.discountAmount.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Net Claimed</span>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#10B981' }}>₹{inspectingBill.netPayable.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  handleReject(inspectingBill.id, inspectingBill.posInvoiceNumber);
                  setInspectingBill(null);
                }}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#EF4444',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Reject Receipt
              </button>
              <button
                type="button"
                onClick={() => {
                  handleApprove(inspectingBill.id, inspectingBill.posInvoiceNumber);
                  setInspectingBill(null);
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  background: 'var(--primary)',
                  border: 'none',
                  color: '#070A09',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Approve &amp; Burn Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
