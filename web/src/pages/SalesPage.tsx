import React, { useState, useEffect } from 'react';
import { 
  Target, TrendingUp, Zap, Building2, BookOpen, DollarSign, 
  CheckCircle2, AlertCircle, ArrowUpRight, Search, Plus, Filter,
  Users, Award, ChevronRight, ShieldCheck, RefreshCw
} from 'lucide-react';
import { AdminAuthUser, SalesTarget, SalesStaffQuota, CorporateLead } from '../types';
import { 
  fetchSalesTargets, bifurcateTarget, quickEnrollFloor, 
  fetchCorporateLeads, updateCorporateLeadStage, approveCorporateDeal, 
  fetchIncentiveLedger, approvePayroll 
} from '../api/client';

interface SalesPageProps {
  currentUser?: AdminAuthUser | null;
  activeSection?: 'targets' | 'performance' | 'floor' | 'corporate' | 'training' | 'payroll';
  onNavigateSection?: (sec: string) => void;
}

export const SalesPage: React.FC<SalesPageProps> = ({ 
  currentUser, 
  activeSection = 'targets', 
  onNavigateSection 
}) => {
  const [section, setSection] = useState(activeSection);
  const [isLoading, setIsLoading] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Targets state
  const [targetList, setTargetList] = useState<any[]>([]);
  const [masterRevenue, setMasterRevenue] = useState(2500000);
  const [floorQuota, setFloorQuota] = useState(1500000);
  const [corpQuota, setCorpQuota] = useState(1000000);

  // Corporate Leads
  const [corporateLeads, setCorporateLeads] = useState<any[]>([]);
  const [searchLead, setSearchLead] = useState('');

  // Floor Quick Enroll
  const [enrollForm, setEnrollForm] = useState({
    customerName: '',
    customerMobile: '',
    customerEmail: '',
    planTier: 'SIGNATURE',
    billInvoiceNo: 'POS-10492',
    outletName: currentUser?.branchName || 'Bodakdev Signature',
    amountPaid: 2999
  });

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  useEffect(() => {
    setSection(activeSection);
  }, [activeSection]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [targets, leads] = await Promise.all([
        fetchSalesTargets(),
        fetchCorporateLeads()
      ]);
      setTargetList(targets || []);
      setCorporateLeads(leads || []);
    } catch (_) {}
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSetTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bifurcateTarget(masterRevenue, floorQuota, corpQuota);
      showToast('Monthly Sales Quotas bifurcated successfully!');
      loadData();
    } catch (_) {
      showToast('Failed to update targets.');
    }
  };

  const handleEnrollFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await quickEnrollFloor({
        customerMobile: enrollForm.customerMobile,
        customerName: enrollForm.customerName,
        planTier: enrollForm.planTier,
        captainId: currentUser?.username || 'STAFF-POS-01',
        captainName: currentUser?.fullName || 'Floor Steward',
        paymentMode: 'STORE_QR'
      });
      showToast(`Subscriber "${enrollForm.customerName}" enrolled at POS!`);
      setEnrollForm({
        customerName: '',
        customerMobile: '',
        customerEmail: '',
        planTier: 'SIGNATURE',
        billInvoiceNo: `POS-${Math.floor(10000 + Math.random() * 90000)}`,
        outletName: currentUser?.branchName || 'Bodakdev Signature',
        amountPaid: 2999
      });
    } catch (_) {
      showToast('Enrollment failed.');
    }
  };

  const handleApproveCorporate = async (id: number) => {
    try {
      await approveCorporateDeal(id);
      showToast('Corporate deal approved by TL desk!');
      loadData();
    } catch (_) {
      showToast('Approval failed.');
    }
  };

  const handleApprovePayroll = async () => {
    try {
      await approvePayroll();
      showToast('Sales incentive payroll finalized and approved!');
    } catch (_) {
      showToast('Payroll approval failed.');
    }
  };

  const navItems = [
    { id: 'targets', label: 'Targets & Quotas', icon: Target },
    { id: 'performance', label: 'Lagging Radar', icon: TrendingUp },
    { id: 'floor', label: 'Floor Sales (POS)', icon: Zap },
    { id: 'corporate', label: 'Corporate B2B', icon: Building2 },
    { id: 'training', label: 'Contests & Training', icon: BookOpen },
    { id: 'payroll', label: 'Payroll & Incentives', icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastNotice && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 99999,
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: 12,
          fontWeight: 600,
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <CheckCircle2 size={18} />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Sales Navigation Subtabs */}
      <div className="card p-2" style={{ display: 'flex', gap: 6, overflowX: 'auto', background: 'rgba(255,255,255,0.02)' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = section === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setSection(item.id as any);
                if (onNavigateSection) onNavigateSection(item.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 16px',
                borderRadius: 10,
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, rgba(201,162,77,0.25) 0%, rgba(201,162,77,0.1) 100%)' : 'transparent',
                color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: TARGETS & QUOTAS */}
      {(section === 'targets') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-5" style={{ background: 'linear-gradient(145deg, rgba(201,162,77,0.12) 0%, rgba(13,20,16,0.85) 100%)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Master Month Target</span>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', marginTop: 4, fontFamily: 'var(--font-serif)' }}>
                ₹{(masterRevenue / 100000).toFixed(1)} Lakhs
              </div>
              <span style={{ fontSize: 12, color: 'var(--gold)', marginTop: 4, display: 'block' }}>OCT-2026 Quota</span>
            </div>

            <div className="card p-5" style={{ background: 'linear-gradient(145deg, rgba(16,185,129,0.1) 0%, rgba(13,20,16,0.85) 100%)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Floor Quota (Restaurants)</span>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#10B981', marginTop: 4, fontFamily: 'var(--font-serif)' }}>
                ₹{(floorQuota / 100000).toFixed(1)} Lakhs
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>60% of total allocation</span>
            </div>

            <div className="card p-5" style={{ background: 'linear-gradient(145deg, rgba(59,130,246,0.1) 0%, rgba(13,20,16,0.85) 100%)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Corporate B2B Quota</span>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#3B82F6', marginTop: 4, fontFamily: 'var(--font-serif)' }}>
                ₹{(corpQuota / 100000).toFixed(1)} Lakhs
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>40% of total allocation</span>
            </div>
          </div>

          <div className="card p-6">
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', marginBottom: 16 }}>
              Bifurcate Sales Quotas (Team Leader Desk)
            </h3>
            <form onSubmit={handleSetTarget} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label" style={{ fontSize: 12 }}>Master Monthly Target (₹)</label>
                <input 
                  type="number"
                  value={masterRevenue}
                  onChange={e => setMasterRevenue(Number(e.target.value))}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label" style={{ fontSize: 12 }}>Floor Quota (₹)</label>
                <input 
                  type="number"
                  value={floorQuota}
                  onChange={e => setFloorQuota(Number(e.target.value))}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label" style={{ fontSize: 12 }}>Corporate Quota (₹)</label>
                <input 
                  type="number"
                  value={corpQuota}
                  onChange={e => setCorpQuota(Number(e.target.value))}
                  className="input w-full"
                />
              </div>
              <div className="md:col-span-3">
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: 700 }}>
                  Publish & Bifurcate Quotas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 2: LAGGING RADAR */}
      {(section === 'performance') && (
        <div className="card p-6 space-y-4">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>
              AI Sales Lagging Radar & Intervention Triggers
            </h3>
            <span style={{ fontSize: 12, color: '#10B981', fontWeight: 700 }}>● Live Telemetry</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Staff falling behind target run-rates receive automated intervention recommendations, refresher scripts, and peer pairing.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="card p-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <AlertCircle size={18} color="#EF4444" />
                <span style={{ fontWeight: 700, color: '#FECACA' }}>Rahul Mehta (Floor Server #4)</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Currently at 42% of monthly floor enrollment goal (Lagging by 18%). AI Recommended Action: Assign module "Pitching Signature at Checkout".
              </p>
            </div>
            <div className="card p-4" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <CheckCircle2 size={18} color="#10B981" />
                <span style={{ fontWeight: 700, color: '#A7F3D0' }}>Vikram Patel (BDE Corporate)</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Currently at 112% of B2B goal (Cadila 50-card deal in closing stage). Eligible for Top Performer accelerator bonus.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: FLOOR SALES POS */}
      {(section === 'floor') && (
        <div className="card p-6 space-y-4">
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>
            Floor Quick Enrollment (POS Checkout Integration)
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Enroll dining guests directly at table settlement into Yanki VIP tiers.
          </p>
          <form onSubmit={handleEnrollFloor} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="label" style={{ fontSize: 12 }}>Guest Name *</label>
              <input 
                type="text"
                required
                value={enrollForm.customerName}
                onChange={e => setEnrollForm({ ...enrollForm, customerName: e.target.value })}
                className="input w-full"
                placeholder="e.g. Anand Parikh"
              />
            </div>
            <div>
              <label className="label" style={{ fontSize: 12 }}>Guest Mobile *</label>
              <input 
                type="tel"
                required
                value={enrollForm.customerMobile}
                onChange={e => setEnrollForm({ ...enrollForm, customerMobile: e.target.value })}
                className="input w-full"
                placeholder="+91 98250 ..."
              />
            </div>
            <div>
              <label className="label" style={{ fontSize: 12 }}>Membership Tier *</label>
              <select
                value={enrollForm.planTier}
                onChange={e => setEnrollForm({ ...enrollForm, planTier: e.target.value })}
                className="input w-full"
              >
                <option value="SIGNATURE">Signature Gourmet (₹2,999)</option>
                <option value="ELITE">Elite Connoisseur (₹5,999)</option>
                <option value="CLASSIC">Classic Privileges (₹1,499)</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: 700 }}>
                ⚡ Quick Enroll Guest
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 4: CORPORATE B2B */}
      {(section === 'corporate') && (
        <div className="card p-6 space-y-4">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>
              Corporate B2B Bulk Leads & Pipelines
            </h3>
            <button onClick={loadData} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 12 }}>
              <RefreshCw size={13} />
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Employees</th>
                  <th>Tier</th>
                  <th>Deal Value</th>
                  <th>Stage</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {corporateLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                      No corporate deals registered.
                    </td>
                  </tr>
                ) : (
                  corporateLeads.map((lead: any) => (
                    <tr key={lead.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{lead.companyName}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.contactPerson} ({lead.contactMobile})</td>
                      <td>{lead.employeeCount || 25} Cards</td>
                      <td><span className="badge badge-gold">{lead.planTier || 'SIGNATURE'}</span></td>
                      <td style={{ fontWeight: 700, color: '#10B981' }}>₹{(lead.dealValue || 150000).toLocaleString()}</td>
                      <td><span className="badge">{lead.stage || 'NEGOTIATION'}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => handleApproveCorporate(lead.id)}
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: 11 }}
                        >
                          Approve Deal
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 5: TRAINING & CONTESTS */}
      {(section === 'training') && (
        <div className="card p-6 space-y-4">
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>
            Gamified Contests & Staff Sales Certification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5" style={{ background: 'linear-gradient(145deg, rgba(201,162,77,0.1) 0%, rgba(13,20,16,0.85) 100%)' }}>
              <Award size={24} color="var(--gold)" style={{ marginBottom: 8 }} />
              <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                October Sizzler Sprint Contest
              </h4>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Top 3 Floor Stewards with maximum Signature enrollments receive a weekend luxury voucher and 5% additional commission.
              </p>
            </div>
            <div className="card p-5" style={{ background: 'linear-gradient(145deg, rgba(59,130,246,0.1) 0%, rgba(13,20,16,0.85) 100%)' }}>
              <BookOpen size={24} color="#3B82F6" style={{ marginBottom: 8 }} />
              <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                Pitching & Objection Handling 101
              </h4>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                3-minute interactive walkthrough on answering customer questions regarding subscriber savings and birthday privileges.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: INCENTIVE PAYROLL */}
      {(section === 'payroll') && (
        <div className="card p-6 space-y-4">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>
                Staff Sales Commission & Incentive Payroll
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Consolidated commission calculation with automated audit trail.
              </p>
            </div>
            <button 
              onClick={handleApprovePayroll}
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontWeight: 700 }}
            >
              ✓ Approve Monthly Payroll
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
