import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Building2, 
  UserPlus, 
  KeyRound, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  Filter, 
  Sparkles, 
  Crown, 
  ShieldAlert, 
  Briefcase, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  RefreshCw,
  Sliders,
  Eye,
  EyeOff,
  ChevronRight,
  GitBranch
} from 'lucide-react';
import { 
  fetchAdminUsers, 
  createAdminUser, 
  updateAdminUser, 
  deleteAdminUser, 
  fetchAdminRoles, 
  updateAdminRole, 
  fetchAdminRights, 
  fetchOutlets,
  fetchSalesTargets,
  bifurcateTarget,
  SalesTargetDTO
} from '../api/client';
import { AdminUser, AdminRole, SystemRight, AdminAuthUser, Outlet } from '../types';

interface StaffPageProps {
  currentUser?: AdminAuthUser | null;
}

export const StaffPage: React.FC<StaffPageProps> = ({ currentUser }) => {
  const isSuperAdmin = currentUser?.roleCode === 'SUPER_ADMIN';
  const isBranchAdmin = currentUser?.roleCode === 'BRANCH_ADMIN';
  const isManager = currentUser?.roleCode === 'MANAGER';

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'users' | 'matrix' | 'hierarchy' | 'targets'>('users');

  // Live Data States from API
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [rights, setRights] = useState<SystemRight[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [targets, setTargets] = useState<SalesTargetDTO[]>([]);

  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('All');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');

  // Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [managingRightsUser, setManagingRightsUser] = useState<AdminUser | null>(null);

  // Form State for Create/Edit User
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    mobile: '',
    password: '',
    roleCode: 'FLOOR_CAPTAIN',
    branchName: currentUser?.branchName !== 'All Branches' ? (currentUser?.branchName || 'Yanki Sizzlerr Bodakdev') : 'Yanki Sizzlerr Bodakdev',
    active: true,
  });

  // Role Rights Editing
  const [editingRolePermissions, setEditingRolePermissions] = useState<Record<string, string[]>>({});
  const [savingRoleId, setSavingRoleId] = useState<number | null>(null);

  // Targets inputs
  const [masterTargetInput, setMasterTargetInput] = useState('2000000');
  const [floorQuotaInput, setFloorQuotaInput] = useState('1000000');
  const [corporateQuotaInput, setCorporateQuotaInput] = useState('1000000');

  // Load live data from API
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [uList, rList, rgList, oList, tList] = await Promise.all([
        fetchAdminUsers(currentUser?.roleCode, currentUser?.branchName, selectedBranchFilter),
        fetchAdminRoles(currentUser?.roleCode),
        fetchAdminRights(),
        fetchOutlets(),
        fetchSalesTargets(),
      ]);

      setUsers(uList);
      setRoles(rList);
      setRights(rgList);
      setOutlets(oList);
      setTargets(tList);

      // Initialize permissions matrix map
      const permMap: Record<string, string[]> = {};
      rList.forEach((r) => {
        permMap[r.roleCode] = r.permissions ? r.permissions.split(',').map((p) => p.trim()) : [];
      });
      setEditingRolePermissions(permMap);
    } catch (err: any) {
      console.error('Error fetching staff data', err);
      showNotice('Failed to synchronize staff data with backend', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [selectedBranchFilter]);

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 4000);
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.mobile && u.mobile.includes(searchQuery));

    const matchesBranch = 
      selectedBranchFilter === 'All' || 
      u.branchName.toLowerCase() === selectedBranchFilter.toLowerCase();

    const matchesRole = 
      selectedRoleFilter === 'All' || 
      u.roleCode.toUpperCase() === selectedRoleFilter.toUpperCase();

    return matchesSearch && matchesBranch && matchesRole;
  });

  // Handle Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const branchToAssign = isSuperAdmin ? formData.branchName : (currentUser?.branchName || 'Yanki Sizzlerr Bodakdev');
      
      const payload: Partial<AdminUser> = {
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        fullName: formData.fullName.trim(),
        mobile: formData.mobile.trim(),
        password: formData.password.trim() || 'admin123',
        roleCode: formData.roleCode,
        branchName: branchToAssign,
        active: formData.active,
      };

      const res = await createAdminUser(
        payload,
        currentUser?.roleCode,
        currentUser?.branchName,
        currentUser?.username
      );

      if (res.success) {
        showNotice(`User "${payload.fullName}" successfully registered for ${branchToAssign}!`, 'success');
        setIsAddUserModalOpen(false);
        setFormData({
          username: '',
          email: '',
          fullName: '',
          mobile: '',
          password: '',
          roleCode: isBranchAdmin ? 'FLOOR_CAPTAIN' : 'MANAGER',
          branchName: isSuperAdmin ? 'Yanki Sizzlerr Bodakdev' : (currentUser?.branchName || ''),
          active: true,
        });
        loadAllData();
      } else {
        showNotice(res.message || 'Error creating user', 'error');
      }
    } catch (err: any) {
      showNotice(err?.response?.data?.message || err.message || 'Error creating user', 'error');
    }
  };

  // Handle Edit User
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.id) return;

    try {
      const payload: Partial<AdminUser> = {
        fullName: editingUser.fullName,
        email: editingUser.email,
        mobile: editingUser.mobile,
        roleCode: editingUser.roleCode,
        branchName: isSuperAdmin ? editingUser.branchName : currentUser?.branchName,
        active: editingUser.active,
        password: editingUser.password,
      };

      const res = await updateAdminUser(
        editingUser.id,
        payload,
        currentUser?.roleCode,
        currentUser?.branchName
      );

      if (res.success) {
        showNotice(`User "${editingUser.fullName}" updated successfully!`, 'success');
        setEditingUser(null);
        loadAllData();
      } else {
        showNotice(res.message || 'Error updating user', 'error');
      }
    } catch (err: any) {
      showNotice(err?.response?.data?.message || err.message || 'Error updating user', 'error');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove staff account "${name}"? This action is permanent.`)) {
      return;
    }

    try {
      const res = await deleteAdminUser(id, currentUser?.roleCode, currentUser?.branchName);
      if (res.success) {
        showNotice(`Staff account "${name}" has been deleted.`, 'success');
        loadAllData();
      } else {
        showNotice(res.message || 'Failed to delete user', 'error');
      }
    } catch (err: any) {
      showNotice(err?.response?.data?.message || err.message || 'Failed to delete user', 'error');
    }
  };

  // Handle Toggle Permission in Matrix
  const handleTogglePermission = (roleCode: string, permCode: string) => {
    // Only Super Admin can change Super Admin or Branch Admin role templates; Branch Admin can adjust Manager & Floor Captain templates
    if (roleCode === 'SUPER_ADMIN' && !isSuperAdmin) return;
    if (roleCode === 'BRANCH_ADMIN' && !isSuperAdmin) return;
    if (!isSuperAdmin && !isBranchAdmin) return;

    setEditingRolePermissions((prev) => {
      const currentList = prev[roleCode] || [];
      const hasPerm = currentList.includes(permCode);
      const updatedList = hasPerm
        ? currentList.filter((p) => p !== permCode)
        : [...currentList, permCode];
      return { ...prev, [roleCode]: updatedList };
    });
  };

  // Save Role Permissions Matrix
  const handleSaveRolePermissions = async (role: AdminRole) => {
    if (!role.id) return;
    setSavingRoleId(role.id);
    try {
      const updatedPerms = (editingRolePermissions[role.roleCode] || []).join(',');
      const res = await updateAdminRole(role.id, { permissions: updatedPerms });
      if (res.success) {
        showNotice(`Role rights for ${role.roleName} saved successfully!`, 'success');
        loadAllData();
      } else {
        showNotice(res.message || 'Error saving role permissions', 'error');
      }
    } catch (err: any) {
      showNotice(err?.response?.data?.message || err.message || 'Error saving role permissions', 'error');
    } finally {
      setSavingRoleId(null);
    }
  };

  // Save Custom User Rights
  const handleSaveUserCustomRights = async () => {
    if (!managingRightsUser?.id) return;
    try {
      const res = await updateAdminUser(
        managingRightsUser.id,
        { customPermissions: managingRightsUser.customPermissions },
        currentUser?.roleCode,
        currentUser?.branchName
      );
      if (res.success) {
        showNotice(`Custom rights for ${managingRightsUser.fullName} updated!`, 'success');
        setManagingRightsUser(null);
        loadAllData();
      } else {
        showNotice(res.message || 'Failed to update user rights', 'error');
      }
    } catch (err: any) {
      showNotice(err?.response?.data?.message || err.message || 'Failed to update user rights', 'error');
    }
  };

  // Available roles for creating a new user based on active user's hierarchy
  const availableRolesForCreation = isSuperAdmin
    ? roles.filter((r) => r.roleCode !== 'SUPER_ADMIN')
    : isBranchAdmin
    ? roles.filter((r) => r.roleCode === 'MANAGER' || r.roleCode === 'FLOOR_CAPTAIN')
    : [];

  // Group rights by category
  const categories = Array.from(new Set(rights.map((r) => r.category)));

  return (
    <div className="admin-page-container">
      {/* Toast Alert */}
      {notice && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 18px',
          borderRadius: 14,
          background: notice.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
          color: '#FFFFFF',
          fontSize: 13,
          fontWeight: 600,
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
          animation: 'slideIn 0.3s ease',
        }}>
          {notice.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notice.message}</span>
        </div>
      )}

      {/* Header Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Active Staff Accounts
            </span>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(201, 162, 77, 0.15)', color: 'var(--gold)' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-serif)' }}>
            {users.length} Staff
          </div>
          <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Check size={12} />
            <span>{users.filter(u => u.active).length} Active in Service</span>
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Hierarchy Scope
            </span>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(255, 138, 0, 0.15)', color: '#FF8A00' }}>
              <Building2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUser?.branchName || 'All Branches'}
          </div>
          <div style={{ fontSize: 11, color: isSuperAdmin ? 'var(--gold)' : '#3B82F6', marginTop: 4, fontWeight: 600 }}>
            {isSuperAdmin ? '👑 Group Owner Oversight' : `🏢 Scoped to Branch`}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              System Roles Defined
            </span>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-serif)' }}>
            {roles.length} Roles
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            {rights.length} Granular RBAC Permissions
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Clearance Level
            </span>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
              <Crown size={16} />
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)' }}>
            Level {currentUser?.roleLevel || 1}
          </div>
          <div style={{ fontSize: 11, color: 'var(--gold)', marginTop: 4, fontWeight: 700 }}>
            {currentUser?.roleName || 'Owner'}
          </div>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        borderBottom: '1px solid var(--border)',
        paddingBottom: 14,
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('users')}
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
            style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12 }}
          >
            <Users size={15} />
            <span>Staff Accounts & Users</span>
            <span style={{
              background: activeTab === 'users' ? '#00000030' : 'rgba(255,255,255,0.1)',
              padding: '2px 7px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
            }}>
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`btn ${activeTab === 'matrix' ? 'btn-primary' : 'btn-outline'}`}
            style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12 }}
          >
            <ShieldCheck size={15} />
            <span>Role Permissions Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`btn ${activeTab === 'hierarchy' ? 'btn-primary' : 'btn-outline'}`}
            style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12 }}
          >
            <GitBranch size={15} />
            <span>Multi-Branch Hierarchy</span>
          </button>

          <button
            onClick={() => setActiveTab('targets')}
            className={`btn ${activeTab === 'targets' ? 'btn-primary' : 'btn-outline'}`}
            style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12 }}
          >
            <Award size={15} />
            <span>Sales Quotas & Incentives</span>
          </button>
        </div>

        {activeTab === 'users' && (isSuperAdmin || isBranchAdmin) && (
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 12,
              boxShadow: '0 4px 14px rgba(255, 138, 0, 0.35)',
            }}
          >
            <UserPlus size={16} />
            <span>Add Staff Account</span>
          </button>
        )}
      </div>

      {/* TAB 1: STAFF USERS & CREATION */}
      {activeTab === 'users' && (
        <div>
          {/* Search & Filter Bar */}
          <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1 1 260px' }}>
                <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="Search staff name, email, mobile, or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '10px 14px 10px 38px',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              {isSuperAdmin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Filter size={14} color="var(--gold)" />
                  <select
                    value={selectedBranchFilter}
                    onChange={(e) => setSelectedBranchFilter(e.target.value)}
                    style={{
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      color: 'var(--text-main)',
                      fontSize: 12,
                      fontWeight: 600,
                      outline: 'none',
                    }}
                  >
                    <option value="All">All Outlets</option>
                    {outlets.map((o) => (
                      <option key={o.id} value={o.name}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={14} color="var(--text-dim)" />
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  style={{
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '10px 14px',
                    color: 'var(--text-main)',
                    fontSize: 12,
                    fontWeight: 600,
                    outline: 'none',
                  }}
                >
                  <option value="All">All Roles</option>
                  <option value="SUPER_ADMIN">Owner (Super Admin)</option>
                  <option value="BRANCH_ADMIN">Branch Admin</option>
                  <option value="MANAGER">Operations Manager</option>
                  <option value="FLOOR_CAPTAIN">Floor Captain</option>
                </select>
              </div>

              <button
                onClick={loadAllData}
                disabled={loading}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
                title="Refresh from API"
              >
                <RefreshCw size={13} className={loading ? 'spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* User List Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '14px 18px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                      Staff Member
                    </th>
                    <th style={{ padding: '14px 18px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                      Role & Level
                    </th>
                    <th style={{ padding: '14px 18px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                      Branch Location
                    </th>
                    <th style={{ padding: '14px 18px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                      Contact
                    </th>
                    <th style={{ padding: '14px 18px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                      Status
                    </th>
                    <th style={{ padding: '14px 18px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'right' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Users size={36} color="var(--text-dim)" style={{ marginBottom: 12 }} />
                        <div style={{ fontSize: 14, fontWeight: 600 }}>No staff members match the selected filters</div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>Try clearing search queries or branch filter</div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isUserSuperAdmin = user.roleCode === 'SUPER_ADMIN';
                      const canManageThisUser = isSuperAdmin || (isBranchAdmin && !isUserSuperAdmin && user.roleCode !== 'BRANCH_ADMIN');

                      const roleBadgeColor = 
                        user.roleCode === 'SUPER_ADMIN' ? 'var(--gold)' :
                        user.roleCode === 'BRANCH_ADMIN' ? '#FF8A00' :
                        user.roleCode === 'MANAGER' ? '#3B82F6' : '#10B981';

                      return (
                        <tr 
                          key={user.id} 
                          style={{ 
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* Staff Member */}
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{
                                width: 38,
                                height: 38,
                                borderRadius: 12,
                                background: `${roleBadgeColor}15`,
                                border: `1px solid ${roleBadgeColor}40`,
                                display: 'grid',
                                placeItems: 'center',
                                fontWeight: 800,
                                fontSize: 14,
                                color: roleBadgeColor,
                                flexShrink: 0,
                              }}>
                                {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span>{user.fullName}</span>
                                  {isUserSuperAdmin && <Crown size={12} color="var(--gold)" />}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                  {user.email || user.username}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '3px 9px',
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 700,
                              background: `${roleBadgeColor}15`,
                              color: roleBadgeColor,
                              border: `1px solid ${roleBadgeColor}35`,
                            }}>
                              {user.roleName || user.roleCode}
                            </span>
                          </td>

                          {/* Branch Location */}
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-main)', fontWeight: 600 }}>
                              <Building2 size={13} color="var(--gold)" />
                              <span>{user.branchName}</span>
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>
                              Created by: {user.createdByUsername || 'System'}
                            </div>
                          </td>

                          {/* Contact */}
                          <td style={{ padding: '14px 18px', fontSize: 12, color: 'var(--text-muted)' }}>
                            <div>{user.mobile || '—'}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>
                              {user.lastLogin ? `Last: ${user.lastLogin.substring(0, 10)}` : 'Never logged in'}
                            </div>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '2px 8px',
                              borderRadius: 6,
                              fontSize: 10,
                              fontWeight: 700,
                              background: user.active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                              color: user.active ? '#10B981' : '#EF4444',
                              border: `1px solid ${user.active ? '#10B98130' : '#EF444430'}`,
                            }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: user.active ? '#10B981' : '#EF4444' }} />
                              {user.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                              {canManageThisUser && (
                                <>
                                  <button
                                    onClick={() => setEditingUser(user)}
                                    title="Edit Profile & Role"
                                    style={{
                                      background: 'rgba(255, 255, 255, 0.05)',
                                      border: '1px solid var(--border)',
                                      color: 'var(--text-main)',
                                      padding: '6px 10px',
                                      borderRadius: 8,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      fontSize: 11,
                                    }}
                                  >
                                    <Edit3 size={13} />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    onClick={() => setManagingRightsUser(user)}
                                    title="Manage Specific Rights"
                                    style={{
                                      background: 'rgba(201, 162, 77, 0.1)',
                                      border: '1px solid rgba(201, 162, 77, 0.3)',
                                      color: 'var(--gold)',
                                      padding: '6px 10px',
                                      borderRadius: 8,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      fontSize: 11,
                                    }}
                                  >
                                    <Sliders size={13} />
                                    <span>Rights</span>
                                  </button>

                                  {!isUserSuperAdmin && (
                                    <button
                                      onClick={() => user.id && handleDeleteUser(user.id, user.fullName)}
                                      title="Delete Account"
                                      style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.25)',
                                        color: '#EF4444',
                                        padding: '6px 8px',
                                        borderRadius: 8,
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </>
                              )}

                              {!canManageThisUser && (
                                <span style={{ fontSize: 11, color: 'var(--text-dim)', fontStyle: 'italic' }}>
                                  Read Only
                                </span>
                              )}
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
        </div>
      )}

      {/* TAB 2: ROLES & RIGHTS MATRIX */}
      {activeTab === 'matrix' && (
        <div>
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={18} color="var(--gold)" />
                  <span>Granular Role-Based Access Control (RBAC) Matrix</span>
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {isSuperAdmin 
                    ? 'As Group Owner, you can modify rights for any tier across all outlets.'
                    : `As Branch Admin for ${currentUser?.branchName}, you can customize permissions for Operations Managers and Floor Captains.`}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {roles.map((r) => {
                  const canEditThisRole = isSuperAdmin || (isBranchAdmin && (r.roleCode === 'MANAGER' || r.roleCode === 'FLOOR_CAPTAIN'));
                  if (!canEditThisRole) return null;

                  return (
                    <button
                      key={r.id}
                      onClick={() => handleSaveRolePermissions(r)}
                      disabled={savingRoleId === r.id}
                      className="btn btn-primary btn-sm"
                      style={{ borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Check size={13} />
                      <span>Save {r.roleName} Rights</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '16px 20px', width: '40%', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                      System Right & Capability
                    </th>
                    {roles.map((role) => (
                      <th 
                        key={role.id} 
                        style={{ 
                          padding: '16px 20px', 
                          textAlign: 'center', 
                          fontSize: 11, 
                          fontWeight: 700, 
                          color: 'var(--gold)', 
                          textTransform: 'uppercase', 
                          letterSpacing: 0.6 
                        }}
                      >
                        <div>{role.roleName}</div>
                        <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 500, marginTop: 2 }}>
                          Level {role.level}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <React.Fragment key={category}>
                      {/* Category Header Row */}
                      <tr style={{ background: 'rgba(201, 162, 77, 0.06)', borderBottom: '1px solid var(--border)' }}>
                        <td colSpan={roles.length + 1} style={{ padding: '10px 20px', fontSize: 12, fontWeight: 800, color: 'var(--gold)', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                          📂 {category} Capabilities
                        </td>
                      </tr>

                      {/* Rights in category */}
                      {rights
                        .filter((r) => r.category === category)
                        .map((right) => (
                          <tr 
                            key={right.code}
                            style={{ 
                              borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                              transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.015)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            {/* Capability details */}
                            <td style={{ padding: '14px 20px' }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                                {right.name}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                {right.description}
                              </div>
                              <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 3, fontFamily: 'monospace' }}>
                                [{right.code}]
                              </div>
                            </td>

                            {/* Role checkboxes */}
                            {roles.map((role) => {
                              const activePerms = editingRolePermissions[role.roleCode] || [];
                              const isChecked = activePerms.includes(right.code);
                              const canEditThisRole = isSuperAdmin || (isBranchAdmin && (role.roleCode === 'MANAGER' || role.roleCode === 'FLOOR_CAPTAIN'));

                              return (
                                <td key={role.id} style={{ padding: '14px 20px', textAlign: 'center' }}>
                                  <label style={{ display: 'inline-flex', alignItems: 'center', cursor: canEditThisRole ? 'pointer' : 'not-allowed' }}>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      disabled={!canEditThisRole}
                                      onChange={() => handleTogglePermission(role.roleCode, right.code)}
                                      style={{
                                        width: 18,
                                        height: 18,
                                        accentColor: 'var(--gold)',
                                        cursor: canEditThisRole ? 'pointer' : 'not-allowed',
                                      }}
                                    />
                                  </label>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MULTI-BRANCH HIERARCHY TREE */}
      {activeTab === 'hierarchy' && (
        <div>
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <GitBranch size={20} color="var(--gold)" />
                <span>Organizational Multi-Branch Hierarchy</span>
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                The Sizzlo Privilege architecture separates Owner (Super Admin) global governance from Branch-level operational autonomy.
              </p>
            </div>

            {/* Visual Tree */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
              {/* Level 1: Owner */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(201, 162, 77, 0.15) 0%, rgba(20, 20, 20, 0.8) 100%)',
                border: '1px solid rgba(201, 162, 77, 0.4)',
                borderRadius: 18,
                padding: '20px 24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: 'rgba(201, 162, 77, 0.25)',
                      display: 'grid',
                      placeItems: 'center',
                      color: 'var(--gold)',
                    }}>
                      <Crown size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>Group Owner (Super Admin)</span>
                        <span className="brand-badge" style={{ fontSize: 10 }}>LEVEL 1</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        Multi-branch consolidated owner oversight · Creates Branch Admins · Configures groupwide policy & vouchers
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>
                      All Branches
                    </span>
                  </div>
                </div>
              </div>

              {/* Connecting line */}
              <div style={{ width: 2, height: 16, background: 'var(--gold)', margin: '0 auto' }} />

              {/* Level 2: Branch Admins Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 16,
              }}>
                {outlets.map((outlet) => {
                  const branchUsers = users.filter((u) => u.branchName === outlet.name);
                  const branchAdmin = branchUsers.find((u) => u.roleCode === 'BRANCH_ADMIN');
                  const branchManagers = branchUsers.filter((u) => u.roleCode === 'MANAGER');
                  const branchCaptains = branchUsers.filter((u) => u.roleCode === 'FLOOR_CAPTAIN');

                  return (
                    <div 
                      key={outlet.id}
                      className="card"
                      style={{
                        padding: 20,
                        border: '1px solid rgba(255, 138, 0, 0.3)',
                        background: 'rgba(255, 138, 0, 0.03)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Building2 size={16} color="#FF8A00" />
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
                            {outlet.name}
                          </span>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'rgba(255, 138, 0, 0.15)', color: '#FF8A00' }}>
                          BRANCH
                        </span>
                      </div>

                      {/* Branch Admin */}
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 10,
                      }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>
                          Branch Admin (GM)
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                          {branchAdmin ? branchAdmin.fullName : 'Vacant / Not Assigned'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                          {branchAdmin ? branchAdmin.email : 'Can be appointed by Super Admin'}
                        </div>
                      </div>

                      {/* Sub-staff: Managers & Floor Captains */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div style={{
                          background: 'rgba(59, 130, 246, 0.05)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          borderRadius: 10,
                          padding: 10,
                        }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase' }}>
                            👔 Managers ({branchManagers.length})
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-main)', marginTop: 4, fontWeight: 600 }}>
                            {branchManagers.length > 0 ? branchManagers.map(m => m.fullName).join(', ') : 'None'}
                          </div>
                        </div>

                        <div style={{
                          background: 'rgba(16, 185, 129, 0.05)',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          borderRadius: 10,
                          padding: 10,
                        }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#10B981', textTransform: 'uppercase' }}>
                            🎖️ Captains ({branchCaptains.length})
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-main)', marginTop: 4, fontWeight: 600 }}>
                            {branchCaptains.length > 0 ? branchCaptains.map(c => c.fullName).join(', ') : 'None'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TARGETS & INCENTIVES */}
      {activeTab === 'targets' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
              Sales Target Quota Bifurcation
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
              Split the monthly dining targets between floor captains and corporate corporate accounts.
            </p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await bifurcateTarget(
                  parseFloat(masterTargetInput),
                  parseFloat(floorQuotaInput),
                  parseFloat(corporateQuotaInput)
                );
                if (res.success) {
                  showNotice('Master target successfully bifurcated into Floor & Corporate Quotas!', 'success');
                  loadAllData();
                }
              } catch (err: any) {
                showNotice(err.message || 'Error updating targets', 'error');
              }
            }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Total Master Target (₹)
                </label>
                <input
                  type="number"
                  value={masterTargetInput}
                  onChange={(e) => setMasterTargetInput(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '10px 14px',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Floor Quota (₹)
                  </label>
                  <input
                    type="number"
                    value={floorQuotaInput}
                    onChange={(e) => setFloorQuotaInput(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Corporate Quota (₹)
                  </label>
                  <input
                    type="number"
                    value={corporateQuotaInput}
                    onChange={(e) => setCorporateQuotaInput(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: 12, padding: 12 }}>
                Update Monthly Quota Allocation
              </button>
            </form>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
              Active Floor Sales Targets
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Live telemetry tracking against monthly restaurant targets.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {targets.map((t) => (
                <div 
                  key={t.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                      {t.periodMonth || 'Current Month'}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>
                      ₹{t.totalAchievedRevenue?.toLocaleString('en-IN') || 0} / ₹{t.masterRevenueTarget?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>

                  <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        background: 'linear-gradient(90deg, var(--gold) 0%, #FF8A00 100%)',
                        width: `${Math.min(100, ((t.totalAchievedRevenue || 0) / (t.masterRevenueTarget || 1)) * 100)}%`,
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW STAFF USER */}
      {isAddUserModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            width: '100%',
            maxWidth: 520,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 24,
            padding: 30,
            boxShadow: 'var(--shadow-card)',
            animation: 'modalFadeIn 0.2s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>
                  Register New Staff Account
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {isSuperAdmin ? 'Create any administrative or floor role across all branches' : `Create staff within ${currentUser?.branchName}`}
                </p>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Patel"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Email / Username *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. vikram@sizzlo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value, username: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98250 00000"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Initial Password *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="admin123"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Role Level *
                </label>
                <select
                  value={formData.roleCode}
                  onChange={(e) => setFormData({ ...formData, roleCode: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '10px 14px',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                >
                  {availableRolesForCreation.map((r) => (
                    <option key={r.roleCode} value={r.roleCode}>
                      {r.roleName} (Level {r.level})
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch Assignment */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Assigned Branch Outlet *
                </label>
                {isSuperAdmin ? (
                  <select
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  >
                    {outlets.map((o) => (
                      <option key={o.id} value={o.name}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    value={currentUser?.branchName || ''}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      color: 'var(--gold)',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="btn btn-outline"
                  style={{ flex: 1, borderRadius: 12 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, borderRadius: 12 }}
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER */}
      {editingUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            width: '100%',
            maxWidth: 500,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 24,
            padding: 30,
            boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>
                Edit Staff: {editingUser.fullName}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '10px 14px',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={editingUser.mobile || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, mobile: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '10px 14px',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              {isSuperAdmin && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Branch Location
                  </label>
                  <select
                    value={editingUser.branchName}
                    onChange={(e) => setEditingUser({ ...editingUser, branchName: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  >
                    <option value="All Branches">All Branches</option>
                    {outlets.map((o) => (
                      <option key={o.id} value={o.name}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Reset Password (Leave blank to keep current)
                </label>
                <input
                  type="text"
                  placeholder="New password (optional)"
                  value={editingUser.password && !editingUser.password.includes('••') ? editingUser.password : ''}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '10px 14px',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editingUser.active}
                    onChange={(e) => setEditingUser({ ...editingUser, active: e.target.checked })}
                    style={{ width: 18, height: 18, accentColor: 'var(--gold)' }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                    Staff account is Active & Authorized
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="btn btn-outline"
                  style={{ flex: 1, borderRadius: 12 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, borderRadius: 12 }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANAGE USER SPECIFIC RIGHTS */}
      {managingRightsUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            width: '100%',
            maxWidth: 620,
            maxHeight: '90vh',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 24,
            padding: 28,
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>
                  Custom Rights: {managingRightsUser.fullName}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Role: {managingRightsUser.roleName} · Branch: {managingRightsUser.branchName}
                </p>
              </div>
              <button
                onClick={() => setManagingRightsUser(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 6, marginBottom: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {categories.map((category) => (
                  <div key={category}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                      {category}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {rights
                        .filter((r) => r.category === category)
                        .map((right) => {
                          const currentCustomList = (managingRightsUser.customPermissions || '').split(',').map(p => p.trim());
                          const isChecked = currentCustomList.includes(right.code);

                          return (
                            <label
                              key={right.code}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 10px',
                                borderRadius: 10,
                                background: isChecked ? 'rgba(201, 162, 77, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                                border: isChecked ? '1px solid rgba(201, 162, 77, 0.35)' : '1px solid var(--border)',
                                cursor: 'pointer',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  let nextList: string[];
                                  if (isChecked) {
                                    nextList = currentCustomList.filter(p => p !== right.code);
                                  } else {
                                    nextList = [...currentCustomList, right.code];
                                  }
                                  setManagingRightsUser({
                                    ...managingRightsUser,
                                    customPermissions: nextList.filter(Boolean).join(','),
                                  });
                                }}
                                style={{ width: 16, height: 16, accentColor: 'var(--gold)' }}
                              />
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>
                                  {right.name}
                                </div>
                                <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>
                                  {right.code}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <button
                type="button"
                onClick={() => setManagingRightsUser(null)}
                className="btn btn-outline"
                style={{ flex: 1, borderRadius: 12 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUserCustomRights}
                className="btn btn-primary"
                style={{ flex: 2, borderRadius: 12 }}
              >
                Save Custom Rights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
