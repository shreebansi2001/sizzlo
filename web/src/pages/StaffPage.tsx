import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Award, 
  TrendingUp, 
  Check, 
  Send, 
  UserPlus, 
  Building2, 
  PieChart, 
  DollarSign, 
  Download, 
  ShieldCheck, 
  ArrowRight,
  Briefcase,
  FileCheck
} from 'lucide-react';
import { 
  fetchSalesTargets, 
  bifurcateTarget, 
  quickEnrollFloor, 
  fetchCorporateLeads, 
  updateCorporateLeadStage, 
  approveCorporateDeal, 
  bulkEnrollCorporate, 
  fetchIncentiveLedger, 
  approvePayroll,
  SalesTargetDTO,
  CorporateLeadDTO,
  IncentiveLedgerDTO
} from '../api/client';
import { StaffRole } from '../types';

interface StaffPageProps {
  roles?: StaffRole[];
}

export const StaffPage: React.FC<StaffPageProps> = () => {
  const [activeTab, setActiveTab] = useState<'targets' | 'floor' | 'corporate' | 'incentives'>('targets');
  const [notice, setNotice] = useState<string | null>(null);

  // Targets state
  const [targets, setTargets] = useState<SalesTargetDTO[]>([]);
  const [masterTargetInput, setMasterTargetInput] = useState('2000000');
  const [floorQuotaInput, setFloorQuotaInput] = useState('1000000');
  const [corporateQuotaInput, setCorporateQuotaInput] = useState('1000000');

  // Floor quick enroll state
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('SIGNATURE');
  const [paymentMode, setPaymentMode] = useState('PAYMENT_LINK');
  const [captainId, setCaptainId] = useState('CPT-04');
  const [captainName, setCaptainName] = useState('Captain Rahul Dave');

  // Corporate leads state
  const [corporateLeads, setCorporateLeads] = useState<CorporateLeadDTO[]>([]);

  // Incentives state
  const [incentives, setIncentives] = useState<IncentiveLedgerDTO[]>([]);

  const loadData = async () => {
    try {
      const [tList, cList, iList] = await Promise.all([
        fetchSalesTargets(),
        fetchCorporateLeads(),
        fetchIncentiveLedger()
      ]);
      setTargets(tList);
      setCorporateLeads(cList);
      setIncentives(iList);
    } catch (_) {}
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBifurcate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await bifurcateTarget(
        parseFloat(masterTargetInput),
        parseFloat(floorQuotaInput),
        parseFloat(corporateQuotaInput)
      );
      if (res.success) {
        setNotice('Master target successfully bifurcated into Floor & Corporate Quotas!');
        await loadData();
      }
    } catch (e: any) {
      setNotice(`Error: ${e.message}`);
    }
    setTimeout(() => setNotice(null), 3500);
  };

  const handleFloorEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerMobile || !customerName) {
      setNotice('Please enter customer mobile and name');
      return;
    }
    try {
      const res = await quickEnrollFloor({
        customerMobile,
        customerName,
        planTier: selectedPlan,
        captainId,
        captainName,
        paymentMode
      });
      if (res.success) {
        setNotice(`Plan enrolled! Commission credited to ${captainName}. SMS sent to customer.`);
        setCustomerName('');
        setCustomerMobile('');
        await loadData();
      }
    } catch (e: any) {
      setNotice(`Enrollment error: ${e.message}`);
    }
    setTimeout(() => setNotice(null), 4000);
  };

  const handleStageChange = async (leadId: number, nextStage: string) => {
    try {
      await updateCorporateLeadStage(leadId, nextStage);
      await loadData();
    } catch (_) {}
  };

  const handleApproveCorporate = async (leadId: number) => {
    try {
      const res = await approveCorporateDeal(leadId);
      if (res.success) {
        setNotice('Corporate Deal audited & approved by Sales TL! Quota credited.');
        await loadData();
      }
    } catch (e: any) {
      setNotice(`Approval error: ${e.message}`);
    }
    setTimeout(() => setNotice(null), 3500);
  };

  const handleBulkEnrollEmployees = async (leadId: number) => {
    // Generate dummy roster based on corporate employees
    const employees = [
      { name: 'Amit Sharma', mobile: '+91 98251 00001' },
      { name: 'Pooja Verma', mobile: '+91 98251 00002' },
      { name: 'Rohan Mehta', mobile: '+91 98251 00003' },
      { name: 'Neha Joshi', mobile: '+91 98251 00004' },
      { name: 'Kavita Patel', mobile: '+91 98251 00005' },
    ];
    try {
      const res = await bulkEnrollCorporate(leadId, employees);
      if (res.success) {
        setNotice(`Bulk Roster Uploaded! 5 employee subscriptions activated and SMS sent.`);
        await loadData();
      }
    } catch (e: any) {
      setNotice(`Bulk enroll error: ${e.message}`);
    }
    setTimeout(() => setNotice(null), 3500);
  };

  const handleApprovePayroll = async () => {
    try {
      const res = await approvePayroll();
      if (res.success) {
        setNotice('Monthly Incentive Payroll APPROVED & Exported as CSV for HR payout!');
        await loadData();
      }
    } catch (e: any) {
      setNotice(`Payroll approval error: ${e.message}`);
    }
    setTimeout(() => setNotice(null), 4000);
  };

  const currentTarget = targets[0] || {
    masterRevenueTarget: 2000000,
    floorSalesQuota: 1000000,
    corporateSalesQuota: 1000000,
    achievedFloorRevenue: 750000,
    achievedCorporateRevenue: 900000,
    totalAchievedRevenue: 1650000,
    payrollApproved: false
  };

  return (
    <div>
      {/* Toast Alert */}
      {notice && (
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
          {notice}
        </div>
      )}

      {/* Header and Sub Navigation */}
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
            Sales Operations &amp; Incentive Ledger Hub
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            SRS Chapter 14-17: Team Lead Quota Bifurcation, Floor Quick-Enroll, Corporate B2B Funnel &amp; Payroll Commission Engine
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
            onClick={() => setActiveTab('targets')}
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
              background: activeTab === 'targets' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'targets' ? '#070A09' : 'var(--text-muted)'
            }}
          >
            <PieChart size={14} /> Quotas &amp; Bifurcation
          </button>

          <button
            onClick={() => setActiveTab('floor')}
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
              background: activeTab === 'floor' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'floor' ? '#070A09' : 'var(--text-muted)'
            }}
          >
            <UserPlus size={14} /> Floor Quick-Enroll
          </button>

          <button
            onClick={() => setActiveTab('corporate')}
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
              background: activeTab === 'corporate' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'corporate' ? '#070A09' : 'var(--text-muted)'
            }}
          >
            <Building2 size={14} /> Corporate B2B Funnel
          </button>

          <button
            onClick={() => setActiveTab('incentives')}
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
              background: activeTab === 'incentives' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'incentives' ? '#070A09' : 'var(--text-muted)'
            }}
          >
            <DollarSign size={14} /> Incentive Ledger &amp; Payroll
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: TARGETS BIFURCATION (SRS CHAPTER 15)              */}
      {/* ======================================================== */}
      {activeTab === 'targets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Target Progress Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <div className="kpi-card">
              <span className="kpi-label">MASTER MONTHLY TARGET</span>
              <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: 'var(--primary)' }}>
                ₹{(currentTarget.masterRevenueTarget / 100000).toFixed(1)} Lakhs
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Assigned by Super Admin</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">FLOOR SALES ACHIEVED</span>
              <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: '#10B981' }}>
                ₹{(currentTarget.achievedFloorRevenue / 100000).toFixed(1)}L / ₹{(currentTarget.floorSalesQuota / 100000).toFixed(1)}L
              </div>
              <span style={{ fontSize: 11, color: '#10B981', marginTop: 4 }}>
                {Math.round((currentTarget.achievedFloorRevenue / (currentTarget.floorSalesQuota || 1)) * 100)}% Floor Quota hit
              </span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">CORPORATE B2B ACHIEVED</span>
              <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: '#3B82F6' }}>
                ₹{(currentTarget.achievedCorporateRevenue / 100000).toFixed(1)}L / ₹{(currentTarget.corporateSalesQuota / 100000).toFixed(1)}L
              </div>
              <span style={{ fontSize: 11, color: '#3B82F6', marginTop: 4 }}>
                {Math.round((currentTarget.achievedCorporateRevenue / (currentTarget.corporateSalesQuota || 1)) * 100)}% Corporate Quota hit
              </span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">CUMULATIVE ACHIEVEMENT</span>
              <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: 'var(--gold-dark)' }}>
                {Math.round((currentTarget.totalAchievedRevenue / (currentTarget.masterRevenueTarget || 1)) * 100)}%
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                TL 1.5% Override Unlocked
              </span>
            </div>
          </div>

          {/* Target Bifurcation Tool */}
          <div style={{
            background: 'var(--surface)',
            borderRadius: 20,
            border: '1px solid var(--border)',
            padding: 24,
            boxShadow: 'var(--shadow-card)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>
              Sales Team Lead (TL) Target Bifurcation Tool
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
              Divide the monthly subscription target between Restaurant Outlets (Floor Captains) and Enterprise BDEs.
            </p>

            <form onSubmit={handleBifurcate} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) auto', gap: 16, alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                  MASTER MONTHLY TARGET (₹)
                </label>
                <input
                  type="number"
                  value={masterTargetInput}
                  onChange={(e) => setMasterTargetInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 14,
                    fontWeight: 700
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#10B981', marginBottom: 6 }}>
                  CHANNEL A: FLOOR QUOTA (₹)
                </label>
                <input
                  type="number"
                  value={floorQuotaInput}
                  onChange={(e) => setFloorQuotaInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 14,
                    fontWeight: 700
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#3B82F6', marginBottom: 6 }}>
                  CHANNEL B: CORPORATE QUOTA (₹)
                </label>
                <input
                  type="number"
                  value={corporateQuotaInput}
                  onChange={(e) => setCorporateQuotaInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 14,
                    fontWeight: 700
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  background: 'var(--primary)',
                  color: '#070A09',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  height: 42
                }}
              >
                Save Bifurcation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: FLOOR QUICK-ENROLL (SRS CHAPTER 16.1)             */}
      {/* ======================================================== */}
      {activeTab === 'floor' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: 20,
            border: '1px solid var(--border)',
            padding: 24,
            boxShadow: 'var(--shadow-card)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>
              Restaurant Captain 3-Field Quick-Enroll Screen
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
              Pitch and enroll seated dining guests into Sizzlo VIP Subscriptions directly at the table.
            </p>

            <form onSubmit={handleFloorEnroll} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                    CUSTOMER FULL NAME
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Shah"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                    10-DIGIT MOBILE NUMBER
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98250 XXXXX"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                  SELECT ANNUAL SUBSCRIPTION PLAN
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    { tier: 'CLASSIC', price: '₹5,000 / yr', comm: '₹200 payout' },
                    { tier: 'SIGNATURE', price: '₹10,000 / yr', comm: '₹400 payout' },
                    { tier: 'ELITE', price: '₹15,000 / yr', comm: '₹700 payout' }
                  ].map((p) => (
                    <div
                      key={p.tier}
                      onClick={() => setSelectedPlan(p.tier)}
                      style={{
                        padding: 14,
                        borderRadius: 12,
                        cursor: 'pointer',
                        border: selectedPlan === p.tier ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: selectedPlan === p.tier ? 'rgba(255, 138, 0, 0.12)' : 'var(--background)',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 800, color: selectedPlan === p.tier ? 'var(--primary)' : 'var(--text-main)' }}>
                        {p.tier}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.price}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#10B981', marginTop: 4 }}>{p.comm}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                    PAYMENT COLLECTION METHOD
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13
                    }}
                  >
                    <option value="PAYMENT_LINK">Instant SMS/WhatsApp Razorpay Link</option>
                    <option value="COUNTER_SETTLEMENT">Settle at Cashier Desk (Cash/Card/QR)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                    TAGGED CAPTAIN EMPLOYEE ID
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${captainId} · ${captainName}`}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border)',
                      color: 'var(--primary)',
                      fontSize: 13,
                      fontWeight: 700
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: 10,
                  padding: '12px 20px',
                  borderRadius: 10,
                  background: 'var(--primary)',
                  color: '#070A09',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <Check size={18} /> Enroll Customer &amp; Send Activation Link
              </button>
            </form>
          </div>

          {/* Captain Personal Commission Tracker */}
          <div style={{
            background: 'var(--surface)',
            borderRadius: 20,
            border: '1px solid var(--border)',
            padding: 24,
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Award size={24} color="var(--primary)" />
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>
                    Captain Personal Tracker
                  </h4>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{captainName}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                <div style={{ padding: 14, borderRadius: 12, background: 'var(--background)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>PLANS ENROLLED TODAY</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#10B981', marginTop: 4 }}>3 Plans</div>
                </div>

                <div style={{ padding: 14, borderRadius: 12, background: 'var(--background)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>MONTHLY TARGET PROGRESS</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
                    18 / 25 Plans <span style={{ fontSize: 13, color: '#10B981' }}>(72%)</span>
                  </div>
                </div>

                <div style={{ padding: 14, borderRadius: 12, background: 'var(--background)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ESTIMATED COMMISSIONS EARNED</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>₹8,400</div>
                  <div style={{ fontSize: 11, color: 'var(--gold-dark)', marginTop: 2 }}>
                    7 more plans to unlock 20% quota bonus!
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20, padding: 12, borderRadius: 10, background: 'rgba(255, 138, 0, 0.08)', border: '1px dashed var(--primary)', fontSize: 11, color: 'var(--primary)' }}>
              <strong>In-Store Opportunity Prompt:</strong> 4 seated tables have no active subscription. Pitch Signature for immediate 10% bill savings!
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CORPORATE B2B FUNNEL (SRS CHAPTER 16.2)           */}
      {/* ======================================================== */}
      {activeTab === 'corporate' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: 20,
            border: '1px solid var(--border)',
            padding: 24,
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>
                  Corporate Enterprise Sales Pipeline (B2B Kanban)
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Track corporate packages, audit signed contracts, and bulk-enroll company rosters
                </p>
              </div>

              <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', padding: '6px 14px', borderRadius: 20 }}>
                {corporateLeads.length} Active Deals
              </span>
            </div>

            {/* Kanban Pipeline Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {['NEW_LEAD', 'PROPOSAL_SENT', 'NEGOTIATION', 'CLOSED_WON'].map((stage) => {
                const stageLeads = corporateLeads.filter(l => l.stage === stage);
                return (
                  <div
                    key={stage}
                    style={{
                      background: 'var(--background)',
                      borderRadius: 14,
                      padding: 14,
                      border: '1px solid var(--border)',
                      minHeight: 350
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        {stage.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)' }}>
                        {stageLeads.length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {stageLeads.map((lead) => (
                        <div
                          key={lead.id}
                          style={{
                            background: 'var(--surface)',
                            borderRadius: 12,
                            padding: 14,
                            border: '1px solid var(--border)'
                          }}
                        >
                          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>
                            {lead.companyName}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            GST: {lead.gstNumber || 'N/A'}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', marginTop: 8 }}>
                            {lead.totalEmployees} Employees · {lead.planTier}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#10B981', marginTop: 4 }}>
                            Deal: ₹{lead.dealValue.toLocaleString('en-IN')}
                          </div>

                          {/* Stage Transition Controls */}
                          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {stage === 'NEW_LEAD' && (
                              <button
                                onClick={() => handleStageChange(lead.id, 'PROPOSAL_SENT')}
                                style={{ padding: '6px', fontSize: 11, fontWeight: 700, borderRadius: 6, background: 'var(--surface-alt)', border: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer' }}
                              >
                                Send Proposal &rarr;
                              </button>
                            )}

                            {stage === 'PROPOSAL_SENT' && (
                              <button
                                onClick={() => handleStageChange(lead.id, 'NEGOTIATION')}
                                style={{ padding: '6px', fontSize: 11, fontWeight: 700, borderRadius: 6, background: 'var(--surface-alt)', border: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer' }}
                              >
                                Enter Negotiation &rarr;
                              </button>
                            )}

                            {stage === 'NEGOTIATION' && (
                              <button
                                onClick={() => handleStageChange(lead.id, 'CLOSED_WON')}
                                style={{ padding: '6px', fontSize: 11, fontWeight: 700, borderRadius: 6, background: '#10B981', border: 'none', color: '#070A09', cursor: 'pointer' }}
                              >
                                Mark Deal Won &rarr;
                              </button>
                            )}

                            {stage === 'CLOSED_WON' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {!lead.approvedByTl ? (
                                  <button
                                    onClick={() => handleApproveCorporate(lead.id)}
                                    style={{ padding: '6px', fontSize: 11, fontWeight: 700, borderRadius: 6, background: 'var(--primary)', border: 'none', color: '#070A09', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                                  >
                                    <FileCheck size={12} /> TL Deal Audit
                                  </button>
                                ) : (
                                  <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981' }}>
                                    ✓ TL Audited &amp; Approved
                                  </span>
                                )}

                                <button
                                  onClick={() => handleBulkEnrollEmployees(lead.id)}
                                  style={{ padding: '6px', fontSize: 11, fontWeight: 700, borderRadius: 6, background: 'var(--surface-alt)', border: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                                >
                                  <Users size={12} /> Bulk Enroll Roster
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: INCENTIVE LEDGER & PAYROLL (SRS CHAPTER 17)        */}
      {/* ======================================================== */}
      {activeTab === 'incentives' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: 20,
            border: '1px solid var(--border)',
            padding: 24,
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>
                  Monthly Automated Commission Ledger &amp; Payroll Sign-Off
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Tiered commissions computed via verified subscriptions, slab bonuses, and TL overrides
                </p>
              </div>

              <button
                onClick={handleApprovePayroll}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 10,
                  background: 'var(--primary)',
                  border: 'none',
                  color: '#070A09',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 138, 0, 0.25)'
                }}
              >
                <Download size={16} /> Approve &amp; Export for Payroll CSV
              </button>
            </div>

            {/* Ledger Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Staff Name &amp; ID</th>
                    <th>Role &amp; Outlet / Account</th>
                    <th>Actual Sales</th>
                    <th>Target Quota</th>
                    <th>Achievement %</th>
                    <th>Base Commission</th>
                    <th>Bonus / Override</th>
                    <th>Total Payout</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {incentives.map((i, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{i.staffName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{i.staffId}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{i.role}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{i.outletOrAccount}</div>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {i.role.includes('Floor') ? `${i.plansSoldOrDealValue} Plans` : `₹${(i.plansSoldOrDealValue / 100000).toFixed(1)}L`}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {i.role.includes('Floor') ? `${i.target} Plans` : `₹${(i.target / 100000).toFixed(1)}L`}
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: i.achievementPercent >= 100 ? '#10B981' : 'var(--warning)'
                        }}>
                          {i.achievementPercent}%
                        </span>
                      </td>
                      <td>₹{i.baseCommission.toLocaleString('en-IN')}</td>
                      <td style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>
                        ₹{i.bonus.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, fontSize: 15, color: '#10B981' }}>
                          ₹{i.totalCommission.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 9999,
                          background: i.status === 'APPROVED_FOR_PAYROLL' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 138, 0, 0.15)',
                          color: i.status === 'APPROVED_FOR_PAYROLL' ? '#10B981' : 'var(--primary)'
                        }}>
                          {i.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
