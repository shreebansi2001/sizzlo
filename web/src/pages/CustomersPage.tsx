import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Crown, Eye, X, Calendar, CreditCard, User, Sparkles,
  ChevronLeft, ChevronRight, Award, MessageCircle, Phone, Gift, Plus,
  Download, LayoutGrid, Table as TableIcon
} from 'lucide-react';
import { apiClient as axios } from '../api/client';
import { Member, Coupon } from '../types';

interface CustomersPageProps {
  members?: Member[];
  onRefresh?: () => void;
}

const safeCurrency = (val: any): string => {
  const num = Number(val);
  return isNaN(num) ? '₹0' : `₹${num.toLocaleString('en-IN')}`;
};

export const CustomersPage: React.FC<CustomersPageProps> = ({ members: initialMembers, onRefresh }) => {
  const [memberList, setMemberList] = useState<Member[]>(initialMembers || []);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Segment Filter: All | Elite | Signature | Classic | Registered
  const [tierFilter, setTierFilter] = useState<'All' | 'ELITE' | 'SIGNATURE' | 'CLASSIC' | 'REGISTERED'>('All');
  
  // Status Filter: All | Active | Renewal Due | Expired
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Renewal Due' | 'Expired'>('All');
  
  // View Mode: Table or Grid
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Sorting
  const [sortBy, setSortBy] = useState<'spend' | 'points' | 'savings' | 'recent'>('recent');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Inspector & Modal States
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'overview' | 'personal' | 'loyalty' | 'vouchers' | 'actions'>('overview');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [memberActivities, setMemberActivities] = useState<any[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);

  // Action Sub-Modals
  const [upgradeTargetMember, setUpgradeTargetMember] = useState<Member | null>(null);
  const [selectedTierToGrant, setSelectedTierToGrant] = useState<'classic' | 'signature' | 'elite'>('signature');
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Points Adjustment Modal
  const [pointsAdjustTarget, setPointsAdjustTarget] = useState<Member | null>(null);
  const [pointsAmount, setPointsAmount] = useState<number>(500);
  const [pointsReason, setPointsReason] = useState<string>('Dining Experience Courtesy Bonus');
  const [isAdjustingPoints, setIsAdjustingPoints] = useState(false);

  // Validity Extension Modal
  const [validityTarget, setValidityTarget] = useState<Member | null>(null);
  const [extensionDays, setExtensionDays] = useState<number>(365);
  const [isExtendingValidity, setIsExtendingValidity] = useState(false);

  const fetchLiveMembers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/members', { timeout: 3500 });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setMemberList(res.data.data);
        return;
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMembers();
  }, [onRefresh]);

  const isUserSubscribed = (m: Member): boolean => {
    const tier = (m.membershipType || '').toUpperCase();
    const plan = (m.planId || '').toLowerCase();
    const subTier = (m.subscriptionTier || '').toUpperCase();
    return plan === 'classic' || plan === 'signature' || plan === 'elite' ||
           tier.includes('SUBSCRIBER') || tier.includes('CLASSIC') || 
           tier.includes('SIGNATURE') || tier.includes('ELITE') ||
           subTier === 'CLASSIC' || subTier === 'SIGNATURE' || subTier === 'ELITE';
  };

  const getMemberTierBadge = (m: Member) => {
    const tier = (m.subscriptionTier || m.membershipType || 'REGISTERED').toUpperCase();
    if (tier.includes('ELITE')) {
      return { label: 'SIZZLO ELITE VIP', color: 'var(--gold)', bg: 'rgba(232, 184, 74, 0.15)', border: 'rgba(232, 184, 74, 0.35)', icon: Crown };
    }
    if (tier.includes('SIGNATURE')) {
      return { label: 'SIZZLO SIGNATURE', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)', icon: Sparkles };
    }
    if (tier.includes('CLASSIC')) {
      return { label: 'SIZZLO CLASSIC', color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.15)', border: 'rgba(96, 165, 250, 0.35)', icon: Award };
    }
    return { label: 'FREE REGISTERED', color: '#94A3B8', bg: 'rgba(255, 255, 255, 0.05)', border: 'var(--border)', icon: User };
  };

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, tierFilter, statusFilter, pageSize, sortBy]);

  const filtered = useMemo(() => {
    return memberList.filter((m) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || 
                            (m.fullName || '').toLowerCase().includes(term) ||
                            (m.membershipId || '').toLowerCase().includes(term) ||
                            (m.mobile || '').includes(term) ||
                            (m.email || '').toLowerCase().includes(term);

      const tier = (m.subscriptionTier || m.membershipType || '').toUpperCase();
      let matchesTier = true;
      if (tierFilter === 'ELITE') matchesTier = tier.includes('ELITE');
      else if (tierFilter === 'SIGNATURE') matchesTier = tier.includes('SIGNATURE');
      else if (tierFilter === 'CLASSIC') matchesTier = tier.includes('CLASSIC');
      else if (tierFilter === 'REGISTERED') matchesTier = !isUserSubscribed(m);

      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
      return matchesSearch && matchesTier && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'spend') return (Number(b.totalSpend) || 0) - (Number(a.totalSpend) || 0);
      if (sortBy === 'points') return (Number(b.loyaltyPoints) || 0) - (Number(a.loyaltyPoints) || 0);
      if (sortBy === 'savings') return (Number(b.totalSavings) || 0) - (Number(a.totalSavings) || 0);
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });
  }, [memberList, searchTerm, tierFilter, statusFilter, sortBy]);

  // Pagination Computations
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedUsers = useMemo(() => {
    return filtered.slice(startIndex, endIndex);
  }, [filtered, startIndex, endIndex]);

  // Load Member Deep Details when selected
  useEffect(() => {
    if (selectedMember) {
      axios.get(`/api/members/${selectedMember.membershipId}/loyalty`, { timeout: 2000 })
        .then(res => {
          if (res.data?.success && Array.isArray(res.data.data)) {
            setMemberActivities(res.data.data);
          }
        })
        .catch(() => setMemberActivities([]));

      axios.get('/api/coupons', { timeout: 2000 })
        .then(res => {
          if (res.data?.success && Array.isArray(res.data.data)) {
            setAvailableCoupons(res.data.data);
          }
        })
        .catch(() => setAvailableCoupons([]));
    }
  }, [selectedMember]);

  const handleManualVipUpgrade = async () => {
    if (!upgradeTargetMember) return;
    setIsUpgrading(true);

    const updatedPlanName = selectedTierToGrant === 'elite' 
      ? 'ELITE SUBSCRIBER' 
      : selectedTierToGrant === 'signature' 
      ? 'SIGNATURE SUBSCRIBER' 
      : 'CLASSIC SUBSCRIBER';

    const updatedCouponsTotal = selectedTierToGrant === 'elite' ? 18 : selectedTierToGrant === 'signature' ? 12 : 8;
    const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      await axios.put(`/api/members/${upgradeTargetMember.membershipId}`, {
        subscriptionTier: selectedTierToGrant.toUpperCase(),
        membershipType: updatedPlanName,
        status: 'Active',
        expiryDate: expiry,
        couponsTotal: updatedCouponsTotal,
        loyaltyPoints: (Number(upgradeTargetMember.loyaltyPoints) || 0) + 500
      }, { timeout: 3000 });
    } catch (_) {}

    setMemberList(prev => prev.map(m => {
      if (m.membershipId === upgradeTargetMember.membershipId || m.mobile === upgradeTargetMember.mobile) {
        return {
          ...m,
          planId: selectedTierToGrant,
          subscriptionTier: selectedTierToGrant.toUpperCase(),
          membershipType: updatedPlanName,
          status: 'Active',
          issuedDate: new Date().toISOString().split('T')[0],
          expiryDate: expiry,
          couponsTotal: updatedCouponsTotal,
          loyaltyPoints: (Number(m.loyaltyPoints) || 0) + 500,
        };
      }
      return m;
    }));

    if (selectedMember && selectedMember.membershipId === upgradeTargetMember.membershipId) {
      setSelectedMember(prev => prev ? {
        ...prev,
        planId: selectedTierToGrant,
        subscriptionTier: selectedTierToGrant.toUpperCase(),
        membershipType: updatedPlanName,
        status: 'Active',
        expiryDate: expiry,
        couponsTotal: updatedCouponsTotal,
        loyaltyPoints: (Number(prev.loyaltyPoints) || 0) + 500,
      } : null);
    }

    setActionNotice(`🎉 Successfully activated ${selectedTierToGrant.toUpperCase()} VIP Plan for ${upgradeTargetMember.fullName || 'Member'}!`);
    setUpgradeTargetMember(null);
    setIsUpgrading(false);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleAdjustPoints = async () => {
    if (!pointsAdjustTarget) return;
    setIsAdjustingPoints(true);
    const newTotal = Math.max(0, (Number(pointsAdjustTarget.loyaltyPoints) || 0) + pointsAmount);

    try {
      await axios.put(`/api/members/${pointsAdjustTarget.membershipId}`, {
        loyaltyPoints: newTotal
      }, { timeout: 3000 });
    } catch (_) {}

    setMemberList(prev => prev.map(m => {
      if (m.membershipId === pointsAdjustTarget.membershipId) {
        return { ...m, loyaltyPoints: newTotal };
      }
      return m;
    }));

    if (selectedMember && selectedMember.membershipId === pointsAdjustTarget.membershipId) {
      setSelectedMember(prev => prev ? { ...prev, loyaltyPoints: newTotal } : null);
    }

    setActionNotice(`✅ Updated loyalty wallet for ${pointsAdjustTarget.fullName}: ${pointsAmount >= 0 ? '+' : ''}${pointsAmount} pts applied.`);
    setPointsAdjustTarget(null);
    setIsAdjustingPoints(false);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleExtendValidity = async () => {
    if (!validityTarget) return;
    setIsExtendingValidity(true);
    const currentExpiry = validityTarget.expiryDate ? new Date(validityTarget.expiryDate) : new Date();
    const newExpiry = new Date(currentExpiry.getTime() + extensionDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      await axios.put(`/api/members/${validityTarget.membershipId}`, {
        expiryDate: newExpiry,
        status: 'Active'
      }, { timeout: 3000 });
    } catch (_) {}

    setMemberList(prev => prev.map(m => {
      if (m.membershipId === validityTarget.membershipId) {
        return { ...m, expiryDate: newExpiry, status: 'Active' };
      }
      return m;
    }));

    if (selectedMember && selectedMember.membershipId === validityTarget.membershipId) {
      setSelectedMember(prev => prev ? { ...prev, expiryDate: newExpiry, status: 'Active' } : null);
    }

    setActionNotice(`📅 Extended subscription validity for ${validityTarget.fullName} by ${extensionDays} days (New expiry: ${newExpiry}).`);
    setValidityTarget(null);
    setIsExtendingValidity(false);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleExportCSV = () => {
    const headers = ['Membership ID', 'Full Name', 'Mobile', 'Email', 'Tier', 'Status', 'Issued Date', 'Expiry Date', 'Total Spend (₹)', 'Total Savings (₹)', 'Loyalty Points'];
    const rows = filtered.map(m => [
      `"${m.membershipId}"`,
      `"${m.fullName || ''}"`,
      `"${m.mobile || ''}"`,
      `"${m.email || ''}"`,
      `"${m.subscriptionTier || m.membershipType || 'REGISTERED'}"`,
      `"${m.status || 'Active'}"`,
      `"${m.issuedDate || ''}"`,
      `"${m.expiryDate || ''}"`,
      `"${m.totalSpend || 0}"`,
      `"${m.totalSavings || 0}"`,
      `"${m.loyaltyPoints || 0}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sizzlo_Members_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metric counts
  const totalUsers = memberList.length;
  const subscribedUsers = memberList.filter(isUserSubscribed).length;
  const nonSubscribedUsers = totalUsers - subscribedUsers;
  const totalSpendSum = memberList.reduce((acc, m) => acc + (Number(m.totalSpend) || 0), 0);
  const totalSavingsSum = memberList.reduce((acc, m) => acc + (Number(m.totalSavings) || 0), 0);
  const totalLoyaltyPoints = memberList.reduce((acc, m) => acc + (Number(m.loyaltyPoints) || 0), 0);

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
          <Crown size={16} color="var(--gold-dark)" />
          {actionNotice}
        </div>
      )}

      {/* 5 Top Executive KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div className="kpi-card" style={{ background: 'var(--surface)', borderRadius: 16, padding: 18, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-label" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL SIZZLO PATRONS</span>
            <User size={16} color="var(--primary)" />
          </div>
          <div className="kpi-value" style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: '#FFFFFF' }}>
            {totalUsers}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Active user registry</span>
        </div>

        <div className="kpi-card" style={{ background: 'var(--surface)', borderRadius: 16, padding: 18, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-label" style={{ fontSize: 11, fontWeight: 700, color: '#10B981' }}>VIP SUBSCRIBERS</span>
            <Crown size={16} color="#10B981" />
          </div>
          <div className="kpi-value" style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: '#10B981' }}>
            {subscribedUsers}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Classic, Signature &amp; Elite</span>
        </div>

        <div className="kpi-card" style={{ background: 'var(--surface)', borderRadius: 16, padding: 18, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-label" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL PATRON SPEND</span>
            <CreditCard size={16} color="var(--gold)" />
          </div>
          <div className="kpi-value" style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: 'var(--gold)' }}>
            {safeCurrency(totalSpendSum)}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Cumulative restaurant sales</span>
        </div>

        <div className="kpi-card" style={{ background: 'var(--surface)', borderRadius: 16, padding: 18, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-label" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>SIZZLO CLUB SAVINGS</span>
            <Gift size={16} color="var(--primary)" />
          </div>
          <div className="kpi-value" style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>
            {safeCurrency(totalSavingsSum)}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Delivered member value</span>
        </div>

        <div className="kpi-card" style={{ background: 'var(--surface)', borderRadius: 16, padding: 18, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-label" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>LOYALTY POOL</span>
            <Sparkles size={16} color="var(--gold)" />
          </div>
          <div className="kpi-value" style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: 'var(--gold)' }}>
            {totalLoyaltyPoints.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Reward points in circulation</span>
        </div>
      </div>

      {/* Action & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        {/* Search & Tier Filters */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div className="search-input" style={{ width: 280 }}>
            <Search size={16} color="#94A3B8" />
            <input 
              type="text" 
              placeholder="Search member name, ID, phone, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tier Segment Tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--surface-alt)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
            {[
              { id: 'All', label: 'All Members', count: totalUsers },
              { id: 'ELITE', label: 'Elite VIP', count: memberList.filter(m => (m.subscriptionTier || m.membershipType || '').toUpperCase().includes('ELITE')).length },
              { id: 'SIGNATURE', label: 'Signature', count: memberList.filter(m => (m.subscriptionTier || m.membershipType || '').toUpperCase().includes('SIGNATURE')).length },
              { id: 'CLASSIC', label: 'Classic', count: memberList.filter(m => (m.subscriptionTier || m.membershipType || '').toUpperCase().includes('CLASSIC')).length },
              { id: 'REGISTERED', label: 'Free Accounts', count: nonSubscribedUsers }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTierFilter(tab.id as any)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: tierFilter === tab.id ? 'var(--primary)' : 'transparent',
                  color: tierFilter === tab.id ? '#070A09' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--surface-alt)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
            {(['All', 'Active', 'Renewal Due'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: statusFilter === tab ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: statusFilter === tab ? '#FFFFFF' : 'var(--text-muted)',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* View Toggle, Sorting & Export */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '6px 12px',
              borderRadius: 10,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: '#FFFFFF',
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <option value="recent">Sort by: Recently Added</option>
            <option value="spend">Sort by: Highest Spend</option>
            <option value="points">Sort by: Loyalty Points</option>
            <option value="savings">Sort by: Total Savings</option>
          </select>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)', padding: 2 }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: 'none',
                background: viewMode === 'table' ? 'var(--surface-alt)' : 'transparent',
                color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
              title="Table View"
            >
              <TableIcon size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: 'none',
                background: viewMode === 'grid' ? 'var(--surface-alt)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
              title="VIP Cards Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            style={{
              padding: '7px 14px',
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

      {/* Main Content Area: Table View or Cards Grid View */}
      {viewMode === 'table' ? (
        <div className="data-table-card" style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Member ID</th>
                <th>Member Profile</th>
                <th>Subscription Tier</th>
                <th>Validity &amp; Expiry</th>
                <th>Total Spend</th>
                <th>Sizzlo Savings</th>
                <th>Loyalty Points</th>
                <th>Voucher Vault</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '60px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <User size={24} />
                      </div>
                      <p style={{ color: '#FFFFFF', fontWeight: 600, fontSize: 15, margin: 0 }}>
                        {loading ? 'Fetching members from database...' : 'No Members Found'}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0, maxWidth: 360 }}>
                        {loading ? 'Please wait while records load.' : 'New member profiles will appear here automatically as guests register on the mobile app.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((m) => {
                  const badge = getMemberTierBadge(m);
                  const isPaid = isUserSubscribed(m);
                  const daysRemaining = m.expiryDate 
                    ? Math.ceil((new Date(m.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    : null;

                  return (
                    <tr key={m.id || m.membershipId}>
                      <td style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace', fontSize: 12 }}>
                        {m.membershipId}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            background: badge.bg,
                            border: `1px solid ${badge.border}`,
                            color: badge.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 13
                          }}>
                            {(m.fullName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 13, margin: 0 }}>{m.fullName || 'Member'}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', margin: 0 }}>{m.mobile}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          padding: '4px 9px',
                          borderRadius: 6,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`
                        }}>
                          <badge.icon size={11} />
                          {badge.label}
                        </span>
                      </td>
                      <td>
                        <div>
                          <span style={{ fontSize: 12, color: isPaid ? '#FFFFFF' : 'var(--text-muted)', fontWeight: 600 }}>
                            {isPaid ? (m.expiryDate || 'Active') : 'Free Tier'}
                          </span>
                          {daysRemaining !== null && isPaid && (
                            <p style={{ fontSize: 10, color: daysRemaining <= 30 ? '#F87171' : 'var(--text-muted)', margin: 0 }}>
                              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                            </p>
                          )}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: '#FFFFFF' }}>
                        {safeCurrency(m.totalSpend)}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {safeCurrency(m.totalSavings)}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--gold)', fontSize: 13 }}>
                        {Number(m.loyaltyPoints || 0).toLocaleString('en-IN')} pts
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: isPaid ? '#FFFFFF' : 'var(--text-muted)',
                          fontSize: 12
                        }}>
                          {isPaid 
                            ? `${Math.max(0, Number(m.couponsTotal || 12) - Number(m.couponsUsed || 0))} Vouchers`
                            : 'No Vault'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button
                            onClick={() => setSelectedMember(m)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              background: 'var(--surface-alt)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-main)',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Eye size={12} /> Details
                          </button>

                          {!isPaid ? (
                            <button
                              onClick={() => setUpgradeTargetMember(m)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: 8,
                                background: 'rgba(232, 184, 74, 0.15)',
                                border: '1px solid var(--gold)',
                                color: 'var(--gold)',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              <Crown size={12} /> Activate VIP
                            </button>
                          ) : (
                            <button
                              onClick={() => setPointsAdjustTarget(m)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 8,
                                background: 'rgba(232, 184, 74, 0.1)',
                                border: '1px solid rgba(232, 184, 74, 0.3)',
                                color: 'var(--gold)',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                              title="Credit / Deduct Loyalty Points"
                            >
                              <Sparkles size={11} /> +/- Pts
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

          {/* Pagination Controls Bar */}
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
              <strong style={{ color: 'var(--primary)' }}>{totalItems}</strong> members
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Per page:</span>
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
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
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
      ) : (
        /* VIP Cards Grid View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {paginatedUsers.map((m) => {
            const badge = getMemberTierBadge(m);
            const isPaid = isUserSubscribed(m);

            return (
              <div 
                key={m.id || m.membershipId}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 20,
                  border: `1px solid ${isPaid ? badge.border : 'var(--border)'}`,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                {/* Top Card Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: badge.bg,
                      border: `1px solid ${badge.border}`,
                      color: badge.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 16
                    }}>
                      {(m.fullName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', margin: 0 }}>{m.fullName || 'Member'}</h4>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', margin: '2px 0 0' }}>{m.mobile}</p>
                    </div>
                  </div>

                  <span style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: badge.bg,
                    color: badge.color,
                    border: `1px solid ${badge.border}`
                  }}>
                    {badge.label}
                  </span>
                </div>

                {/* ID & Validity */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', background: 'var(--surface-alt)', padding: '8px 12px', borderRadius: 10 }}>
                  <span>ID: <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{m.membershipId}</strong></span>
                  <span>Valid: <strong style={{ color: '#FFFFFF' }}>{m.expiryDate || (isPaid ? 'Active' : 'Free')}</strong></span>
                </div>

                {/* Key Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 4px', borderRadius: 8 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Spend</span>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>{safeCurrency(m.totalSpend)}</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 4px', borderRadius: 8 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Savings</span>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>{safeCurrency(m.totalSavings)}</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 4px', borderRadius: 8 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Points</span>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--gold)', marginTop: 2 }}>{Number(m.loyaltyPoints || 0).toLocaleString('en-IN')}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button
                    onClick={() => setSelectedMember(m)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 10,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4
                    }}
                  >
                    <Eye size={13} /> Full 360 Details
                  </button>

                  {!isPaid ? (
                    <button
                      onClick={() => setUpgradeTargetMember(m)}
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
                        gap: 4
                      }}
                    >
                      <Crown size={13} /> VIP
                    </button>
                  ) : (
                    <button
                      onClick={() => setPointsAdjustTarget(m)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 10,
                        background: 'rgba(232, 184, 74, 0.12)',
                        border: '1px solid rgba(232, 184, 74, 0.3)',
                        color: 'var(--gold)',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      title="Adjust Points"
                    >
                      +/- Pts
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL 360° SIZZLO MEMBER INSPECTOR DRAWER */}
      {selectedMember && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 1000,
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: 'var(--surface)',
            borderLeft: '1px solid var(--border)',
            width: '100%',
            maxWidth: 680,
            height: '100%',
            padding: 24,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}>
            {/* Header with Close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
                  SIZZLO CLUB · MEMBER 360° DOSSIER
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', margin: '4px 0 0' }}>
                  {selectedMember.fullName || 'Member Profile'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 10, padding: 6, cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Visual Digital VIP Passport Card */}
            {(() => {
              const badge = getMemberTierBadge(selectedMember);
              const isPaid = isUserSubscribed(selectedMember);
              return (
                <div style={{
                  borderRadius: 20,
                  padding: 22,
                  background: isPaid 
                    ? 'linear-gradient(135deg, #1A2820 0%, #0D1612 50%, #060B08 100%)'
                    : 'linear-gradient(135deg, #1C1917 0%, #0C0A09 100%)',
                  border: `1.5px solid ${badge.border}`,
                  boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Crown size={20} color={badge.color} />
                      <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.08em', color: badge.color }}>
                        SIZZLO CLUB · {badge.label}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 20,
                      background: isPaid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      color: isPaid ? '#10B981' : 'var(--text-muted)',
                      border: `1px solid ${isPaid ? 'rgba(16, 185, 129, 0.4)' : 'var(--border)'}`
                    }}>
                      {selectedMember.status || 'Active'}
                    </span>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Membership Number</span>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                      {selectedMember.membershipId}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Cardholder</span>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>{selectedMember.fullName || 'Member'}</div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Valid Thru</span>
                      <div style={{ fontSize: 13, fontWeight: 700, color: badge.color }}>
                        {selectedMember.expiryDate || (isPaid ? 'Active' : 'Lifetime Free')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Inspector Navigation Tabs */}
            <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--border)', paddingBottom: 10, overflowX: 'auto' }}>
              {[
                { id: 'overview', label: 'Overview & Spend' },
                { id: 'personal', label: 'Personal & Profile' },
                { id: 'loyalty', label: 'Loyalty Points' },
                { id: 'vouchers', label: 'Vouchers Vault' },
                { id: 'actions', label: 'Manage Member' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveInspectorTab(t.id as any)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: activeInspectorTab === t.id ? 'var(--primary)' : 'transparent',
                    color: activeInspectorTab === t.id ? '#070A09' : 'var(--text-muted)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB 1: OVERVIEW & SPEND */}
            {activeInspectorTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* 4 Financial Metric Boxes */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  <div style={{ background: 'var(--surface-alt)', padding: 14, borderRadius: 14, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Lifetime Spend</span>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', marginTop: 4 }}>
                      {safeCurrency(selectedMember.totalSpend)}
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Across all dining outlets</span>
                  </div>

                  <div style={{ background: 'var(--surface-alt)', padding: 14, borderRadius: 14, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Sizzlo Savings</span>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
                      {safeCurrency(selectedMember.totalSavings)}
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Via vouchers &amp; discounts</span>
                  </div>

                  <div style={{ background: 'var(--surface-alt)', padding: 14, borderRadius: 14, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Loyalty Points Balance</span>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--gold)', marginTop: 4 }}>
                      {Number(selectedMember.loyaltyPoints || 0).toLocaleString('en-IN')} pts
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Milestone goal: {Number(selectedMember.loyaltyGoal || 25000).toLocaleString('en-IN')} pts</span>
                  </div>

                  <div style={{ background: 'var(--surface-alt)', padding: 14, borderRadius: 14, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Coupons Available</span>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', marginTop: 4 }}>
                      {isUserSubscribed(selectedMember) 
                        ? `${Math.max(0, Number(selectedMember.couponsTotal || 12) - Number(selectedMember.couponsUsed || 0))} / ${selectedMember.couponsTotal || 12}`
                        : '0'}
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Used: {selectedMember.couponsUsed || 0}</span>
                  </div>
                </div>

                {/* Direct Contact Bar */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <a
                    href={`https://wa.me/${(selectedMember.mobile || '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: 12,
                      background: 'rgba(37, 211, 102, 0.15)',
                      border: '1px solid rgba(37, 211, 102, 0.3)',
                      color: '#25D366',
                      fontWeight: 700,
                      fontSize: 12,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <MessageCircle size={15} /> WhatsApp Message
                  </a>

                  <a
                    href={`tel:${(selectedMember.mobile || '').replace(/\D/g, '')}`}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: 12,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: 12,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Phone size={15} /> Call Desk
                  </a>
                </div>
              </div>
            )}

            {/* TAB 2: PERSONAL & PROFILE */}
            {activeInspectorTab === 'personal' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: 'var(--surface-alt)', padding: 18, borderRadius: 16, border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 14 }}>
                    Personal Demographics &amp; Contact
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, fontSize: 12 }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Full Name</span>
                      <p style={{ fontWeight: 700, color: '#FFFFFF', margin: '2px 0 0' }}>{selectedMember.fullName || 'Not provided'}</p>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Mobile Number</span>
                      <p style={{ fontWeight: 700, color: '#FFFFFF', fontFamily: 'monospace', margin: '2px 0 0' }}>{selectedMember.mobile || 'Not provided'}</p>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Email Address</span>
                      <p style={{ fontWeight: 700, color: '#FFFFFF', margin: '2px 0 0' }}>{selectedMember.email || 'Not provided'}</p>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Account Joined Date</span>
                      <p style={{ fontWeight: 700, color: '#FFFFFF', margin: '2px 0 0' }}>{selectedMember.issuedDate || 'Recently Joined'}</p>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--surface-alt)', padding: 18, borderRadius: 16, border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 14 }}>
                    Celebrations &amp; Family Records
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, fontSize: 12 }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Date of Birth</span>
                      <p style={{ fontWeight: 700, color: '#FFFFFF', margin: '2px 0 0' }}>
                        {(selectedMember as any).birthday || 'Not configured'}
                      </p>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Wedding Anniversary</span>
                      <p style={{ fontWeight: 700, color: '#FFFFFF', margin: '2px 0 0' }}>
                        {(selectedMember as any).anniversaryDate || 'Not configured'}
                      </p>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Spouse Name</span>
                      <p style={{ fontWeight: 700, color: '#FFFFFF', margin: '2px 0 0' }}>
                        {(selectedMember as any).spouseName || 'Not configured'}
                      </p>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Spouse Birthday</span>
                      <p style={{ fontWeight: 700, color: '#FFFFFF', margin: '2px 0 0' }}>
                        {(selectedMember as any).spouseBirthday || 'Not configured'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LOYALTY POINTS */}
            {activeInspectorTab === 'loyalty' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Milestone Progress Card */}
                <div style={{ background: 'var(--surface-alt)', padding: 18, borderRadius: 16, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>Annual Free Renewal Target</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#FFFFFF' }}>
                      {Number(selectedMember.loyaltyPoints || 0).toLocaleString('en-IN')} / {Number(selectedMember.loyaltyGoal || 25000).toLocaleString('en-IN')} pts
                    </span>
                  </div>

                  <div style={{ width: '100%', height: 10, background: 'rgba(0,0,0,0.3)', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{
                      width: `${Math.min(100, ((Number(selectedMember.loyaltyPoints) || 0) / (Number(selectedMember.loyaltyGoal) || 25000)) * 100)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--gold) 0%, #10B981 100%)',
                      borderRadius: 10
                    }} />
                  </div>

                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                    Patrons earning 25,000 points in dining unlock 1-Tap Free Annual Plan Renewal via mobile app.
                  </p>
                </div>

                {/* Points Ledger */}
                <div style={{ background: 'var(--surface-alt)', padding: 18, borderRadius: 16, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', margin: 0 }}>Recent Points Ledger</h4>
                    <button
                      onClick={() => setPointsAdjustTarget(selectedMember)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 8,
                        background: 'rgba(232, 184, 74, 0.15)',
                        border: '1px solid var(--gold)',
                        color: 'var(--gold)',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={11} /> Adjust Points
                    </button>
                  </div>

                  {memberActivities.length > 0 ? (
                    memberActivities.map((act, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{act.title || act.outletName || 'Points Activity'}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{act.timeAgo || 'Recent'}</div>
                        </div>
                        <span style={{ fontWeight: 700, color: (act.points || 0) >= 0 ? 'var(--gold)' : '#F87171' }}>
                          {(act.points || 0) >= 0 ? `+${act.points}` : act.points} pts
                        </span>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>No points transactions recorded yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: VOUCHERS VAULT */}
            {activeInspectorTab === 'vouchers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                  Assigned Dining Privileges &amp; Coupons
                </h4>

                {availableCoupons.length > 0 ? (
                  availableCoupons.map((c, i) => (
                    <div 
                      key={i} 
                      style={{
                        background: 'var(--surface-alt)',
                        padding: 14,
                        borderRadius: 12,
                        border: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary)', fontSize: 12 }}>
                            [{c.code}]
                          </span>
                          <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 13 }}>{c.name}</span>
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0' }}>{c.description || 'Exclusive Dining Privilege'}</p>
                      </div>

                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 10,
                        fontWeight: 800,
                        background: (c.leftCount || 0) > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: (c.leftCount || 0) > 0 ? '#10B981' : 'var(--text-muted)',
                        border: `1px solid ${(c.leftCount || 0) > 0 ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'}`
                      }}>
                        {(c.leftCount || 0) > 0 ? `${c.leftCount} Available` : 'Redeemed'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ background: 'var(--surface-alt)', padding: 20, borderRadius: 14, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                    {isUserSubscribed(selectedMember) 
                      ? 'No active vouchers found in vault.'
                      : 'Free accounts do not have an active voucher vault. Upgrade to VIP to generate vouchers.'}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: MANAGE MEMBER */}
            {activeInspectorTab === 'actions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* VIP Upgrade / Change Tier */}
                <div style={{ background: 'var(--surface-alt)', padding: 18, borderRadius: 16, border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>
                    Change Subscription Tier
                  </h4>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                    Manually grant or change membership tier with instant sync to the mobile app.
                  </p>
                  <button
                    onClick={() => setUpgradeTargetMember(selectedMember)}
                    style={{
                      padding: '9px 16px',
                      borderRadius: 10,
                      background: 'rgba(232, 184, 74, 0.15)',
                      border: '1px solid var(--gold)',
                      color: 'var(--gold)',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Crown size={14} /> Upgrade / Change Tier
                  </button>
                </div>

                {/* Extend Validity */}
                <div style={{ background: 'var(--surface-alt)', padding: 18, borderRadius: 16, border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>
                    Extend Subscription Validity
                  </h4>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                    Add extra days or full years to this patron's subscription period.
                  </p>
                  <button
                    onClick={() => setValidityTarget(selectedMember)}
                    style={{
                      padding: '9px 16px',
                      borderRadius: 10,
                      background: 'var(--surface)',
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
                    <Calendar size={14} /> Extend Expiry Date
                  </button>
                </div>

                {/* Adjust Loyalty Points */}
                <div style={{ background: 'var(--surface-alt)', padding: 18, borderRadius: 16, border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>
                    Credit / Deduct Loyalty Points
                  </h4>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                    Add courtesy points for customer retention or make ledger balance corrections.
                  </p>
                  <button
                    onClick={() => setPointsAdjustTarget(selectedMember)}
                    style={{
                      padding: '9px 16px',
                      borderRadius: 10,
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--gold)',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Sparkles size={14} /> Adjust Points Balance
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-MODAL 1: VIP UPGRADE MODAL */}
      {upgradeTargetMember && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            width: '90%',
            maxWidth: 480,
            padding: 24
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                  Activate VIP Subscription
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  For: <strong>{upgradeTargetMember.fullName}</strong> ({upgradeTargetMember.mobile})
                </p>
              </div>
              <button
                onClick={() => setUpgradeTargetMember(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { id: 'classic', name: 'Sizzlo Classic Pass', perks: '8 Vouchers Vault • Flat 15% Off Dine-In', color: '#60A5FA' },
                { id: 'signature', name: 'Sizzlo Signature Pass', perks: '12 Vouchers Vault • Flat 20% Off • Priority Table Booking', color: '#10B981' },
                { id: 'elite', name: 'Sizzlo Elite VIP Pass', perks: '18 Vouchers Vault • 5 Gift Vouchers • Highest Seating Priority', color: 'var(--gold)' },
              ].map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedTierToGrant(p.id as any)}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    border: `1.5px solid ${selectedTierToGrant === p.id ? p.color : 'var(--border)'}`,
                    background: selectedTierToGrant === p.id ? 'rgba(255,255,255,0.05)' : 'var(--surface-alt)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: p.color }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.perks}</div>
                  </div>
                  {selectedTierToGrant === p.id && <Crown size={16} color={p.color} />}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setUpgradeTargetMember(null)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 10,
                  background: 'var(--surface-alt)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                disabled={isUpgrading}
                onClick={handleManualVipUpgrade}
                style={{
                  padding: '9px 20px',
                  borderRadius: 10,
                  background: 'var(--primary)',
                  border: 'none',
                  color: '#000',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {isUpgrading ? 'Activating...' : 'Confirm Tier Activation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: ADJUST POINTS MODAL */}
      {pointsAdjustTarget && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            width: '90%',
            maxWidth: 440,
            padding: 24
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)', margin: 0 }}>
                  Adjust Loyalty Points
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Member: <strong>{pointsAdjustTarget.fullName}</strong>
                </p>
              </div>
              <button
                onClick={() => setPointsAdjustTarget(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Points to Credit (+) or Deduct (-)
                </label>
                <input
                  type="number"
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 700
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Adjustment Reason Note
                </label>
                <input
                  type="text"
                  value={pointsReason}
                  onChange={(e) => setPointsReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    color: '#FFFFFF',
                    fontSize: 12
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setPointsAdjustTarget(null)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 10,
                  background: 'var(--surface-alt)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                disabled={isAdjustingPoints}
                onClick={handleAdjustPoints}
                style={{
                  padding: '9px 20px',
                  borderRadius: 10,
                  background: 'var(--gold)',
                  border: 'none',
                  color: '#000',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {isAdjustingPoints ? 'Saving...' : 'Apply Points'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 3: EXTEND VALIDITY MODAL */}
      {validityTarget && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            width: '90%',
            maxWidth: 440,
            padding: 24
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                  Extend Validity
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Member: <strong>{validityTarget.fullName}</strong>
                </p>
              </div>
              <button
                onClick={() => setValidityTarget(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {[
                { days: 30, label: '+30 Days' },
                { days: 90, label: '+90 Days' },
                { days: 365, label: '+1 Year' },
              ].map(opt => (
                <button
                  key={opt.days}
                  onClick={() => setExtensionDays(opt.days)}
                  style={{
                    flex: 1,
                    padding: '12px 8px',
                    borderRadius: 12,
                    border: `1.5px solid ${extensionDays === opt.days ? 'var(--primary)' : 'var(--border)'}`,
                    background: extensionDays === opt.days ? 'rgba(232, 184, 74, 0.15)' : 'var(--surface-alt)',
                    color: extensionDays === opt.days ? 'var(--primary)' : '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setValidityTarget(null)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 10,
                  background: 'var(--surface-alt)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                disabled={isExtendingValidity}
                onClick={handleExtendValidity}
                style={{
                  padding: '9px 20px',
                  borderRadius: 10,
                  background: 'var(--primary)',
                  border: 'none',
                  color: '#000',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {isExtendingValidity ? 'Extending...' : 'Confirm Extension'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
