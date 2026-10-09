import React, { useState, useEffect, useMemo } from 'react';
import { 
  Star, 
  Users, 
  CheckCircle2, 
  Clock, 
  Plus, 
  RefreshCw, 
  X, 
  Trash2, 
  Edit3, 
  Layers, 
  UserCheck, 
  AlertCircle, 
  Sparkles, 
  Utensils,
  ChevronRight,
  Armchair
} from 'lucide-react';
import axios from 'axios';

interface FloorTable {
  id: number;
  tableNumber: number;
  seats: number;
  state: 'Available' | 'Reserved' | 'Occupied' | 'Cleaning';
  guest?: string;
  premium?: boolean;
  outletName?: string;
  floorSection?: string;
  notes?: string;
  reservationRef?: string;
}

interface FloorSection {
  id: number;
  name: string;
  outletName: string;
  description?: string;
}

interface WaitlistEntry {
  id: number;
  name: string;
  guests: number;
  waitMinutes: number;
  status: string;
}

interface Reservation {
  id: number;
  bookingReference: string;
  customerName: string;
  customerMobile: string;
  outlet: string;
  reservationTime: string;
  guests: number;
  status: string;
  vip?: boolean;
  tierPriorityTag?: string;
  tableAssigned?: string;
}

export const FloorPage: React.FC = () => {
  const [tables, setTables] = useState<FloorTable[]>([]);
  const [sections, setSections] = useState<FloorSection[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState('Navrangpura');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modals
  const [selectedTableForAction, setSelectedTableForAction] = useState<FloorTable | null>(null);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showAssignBookingModal, setShowAssignBookingModal] = useState(false);
  const [showAddWaitlistModal, setShowAddWaitlistModal] = useState(false);
  const [assigningWaitlistEntry, setAssigningWaitlistEntry] = useState<WaitlistEntry | null>(null);

  // Form states: Add Table
  const [newTableNumber, setNewTableNumber] = useState<number>(17);
  const [newTableSeats, setNewTableSeats] = useState<number>(4);
  const [newTableSection, setNewTableSection] = useState<string>('Main Dining Floor');
  const [newTablePremium, setNewTablePremium] = useState<boolean>(false);
  const [newTableState, setNewTableState] = useState<'Available' | 'Reserved' | 'Occupied' | 'Cleaning'>('Available');
  const [newTableGuest, setNewTableGuest] = useState<string>('');

  // Form states: Add Section
  const [newSectionName, setNewSectionName] = useState<string>('');
  const [newSectionDesc, setNewSectionDesc] = useState<string>('');

  // Form states: Edit Table Action
  const [editTableState, setEditTableState] = useState<'Available' | 'Reserved' | 'Occupied' | 'Cleaning'>('Available');
  const [editTableGuest, setEditTableGuest] = useState<string>('');
  const [editTableSeats, setEditTableSeats] = useState<number>(4);
  const [editTableSection, setEditTableSection] = useState<string>('Main Dining Floor');
  const [editTablePremium, setEditTablePremium] = useState<boolean>(false);
  const [editTableNotes, setEditTableNotes] = useState<string>('');

  // Form states: Assign Booking Modal
  const [assignTab, setAssignTab] = useState<'RESERVATION' | 'WALKIN'>('RESERVATION');
  const [assignReservationId, setAssignReservationId] = useState<number | null>(null);
  const [assignTargetTableId, setAssignTargetTableId] = useState<number | null>(null);
  const [assignModeState, setAssignModeState] = useState<'Occupied' | 'Reserved'>('Occupied');
  const [walkinName, setWalkinName] = useState<string>('');
  const [walkinMobile, setWalkinMobile] = useState<string>('');
  const [walkinGuests, setWalkinGuests] = useState<number>(2);
  const [walkinNotes, setWalkinNotes] = useState<string>('');

  // Form states: Add Waitlist
  const [waitlistName, setWaitlistName] = useState<string>('');
  const [waitlistGuests, setWaitlistGuests] = useState<number>(2);
  const [waitlistMinutes, setWaitlistMinutes] = useState<number>(15);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4500);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [secRes, tblRes, waitRes, resRes] = await Promise.all([
        axios.get(`/api/floor/sections?outlet=${selectedOutlet}`).catch(() => ({ data: { success: false, data: [] } })),
        axios.get(`/api/floor/tables?outlet=${selectedOutlet}`).catch(() => ({ data: { success: false, data: [] } })),
        axios.get('/api/floor/waitlist').catch(() => ({ data: { success: false, data: [] } })),
        axios.get('/api/reservations').catch(() => ({ data: { success: false, data: [] } }))
      ]);

      if (secRes.data?.success && Array.isArray(secRes.data.data)) {
        setSections(secRes.data.data);
      }
      if (tblRes.data?.success && Array.isArray(tblRes.data.data)) {
        setTables(tblRes.data.data);
        // Suggest next table number
        const maxNum = tblRes.data.data.reduce((max: number, t: FloorTable) => Math.max(max, t.tableNumber || 0), 0);
        setNewTableNumber(maxNum + 1);
      }
      if (waitRes.data?.success && Array.isArray(waitRes.data.data)) {
        setWaitlist(waitRes.data.data);
      }
      if (resRes.data?.success && Array.isArray(resRes.data.data)) {
        setReservations(resRes.data.data);
      }
    } catch (_) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedOutlet]);

  // Filtered tables based on selectedSection
  const filteredTables = useMemo(() => {
    if (selectedSection === 'ALL') return tables;
    return tables.filter(t => (t.floorSection || 'Main Dining Floor').toLowerCase() === selectedSection.toLowerCase());
  }, [tables, selectedSection]);

  // Seating capacity stats for current view
  const occupiedSeats = filteredTables.filter(t => t.state === 'Occupied' || t.state === 'Reserved').reduce((acc, t) => acc + t.seats, 0);
  const totalSeats = filteredTables.reduce((acc, t) => acc + t.seats, 0);
  const capacityPercent = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;

  // Open Table Action Modal
  const openTableModal = (table: FloorTable) => {
    setSelectedTableForAction(table);
    setEditTableState(table.state);
    setEditTableGuest(table.guest || '');
    setEditTableSeats(table.seats || 4);
    setEditTableSection(table.floorSection || 'Main Dining Floor');
    setEditTablePremium(!!table.premium);
    setEditTableNotes(table.notes || '');
  };

  // Save Table Changes
  const handleSaveTableChanges = async () => {
    if (!selectedTableForAction) return;

    try {
      const payload: Partial<FloorTable> = {
        tableNumber: selectedTableForAction.tableNumber,
        seats: Number(editTableSeats),
        floorSection: editTableSection,
        premium: editTablePremium,
        state: editTableState,
        guest: editTableState === 'Available' ? '' : editTableGuest,
        notes: editTableNotes
      };

      const res = await axios.put(`/api/floor/tables/${selectedTableForAction.id}`, payload);
      if (res.data?.success) {
        showNotification(`✅ Table T${selectedTableForAction.tableNumber} updated successfully!`);
        setSelectedTableForAction(null);
        loadData();
      }
    } catch (err: any) {
      showNotification(`❌ Error updating table: ${err?.response?.data?.message || 'Update failed'}`);
    }
  };

  // Quick State update from Table Modal
  const handleQuickStatusChange = async (targetState: 'Available' | 'Reserved' | 'Occupied' | 'Cleaning') => {
    if (!selectedTableForAction) return;

    try {
      const payload: any = { state: targetState };
      if (targetState === 'Available') {
        payload.guest = null;
        payload.notes = null;
      } else if (targetState === 'Cleaning') {
        payload.notes = 'Under sanitization';
      } else {
        payload.guest = editTableGuest || (targetState === 'Occupied' ? 'Seated Guest' : 'VIP Reservation');
      }

      const res = await axios.patch(`/api/floor/tables/${selectedTableForAction.id}/status`, payload);
      if (res.data?.success) {
        showNotification(`⚡ Table T${selectedTableForAction.tableNumber} marked as ${targetState}!`);
        setSelectedTableForAction(null);
        loadData();
      }
    } catch (err: any) {
      showNotification(`❌ Could not change status: ${err?.response?.data?.message || 'Error'}`);
    }
  };

  // Delete Table
  const handleDeleteTable = async (tableId: number, tableNum: number) => {
    if (!confirm(`Are you sure you want to permanently delete Table T${tableNum}?`)) return;

    try {
      await axios.delete(`/api/floor/tables/${tableId}`);
      showNotification(`🗑️ Table T${tableNum} removed from floor layout.`);
      setSelectedTableForAction(null);
      loadData();
    } catch (err: any) {
      showNotification(`❌ Failed to delete table: ${err?.response?.data?.message || 'Error'}`);
    }
  };

  // Add Table
  const handleAddTableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber || newTableNumber <= 0) {
      alert('Please enter a valid table number');
      return;
    }

    try {
      const payload = {
        tableNumber: Number(newTableNumber),
        seats: Number(newTableSeats),
        floorSection: newTableSection || 'Main Dining Floor',
        outletName: selectedOutlet,
        premium: newTablePremium,
        state: newTableState,
        guest: newTableState !== 'Available' ? newTableGuest : null
      };

      const res = await axios.post('/api/floor/tables', payload);
      if (res.data?.success) {
        showNotification(`🎉 Table T${newTableNumber} added to ${newTableSection}!`);
        setShowAddTableModal(false);
        setNewTableGuest('');
        setNewTableState('Available');
        loadData();
      }
    } catch (err: any) {
      alert(`Could not create table: ${err?.response?.data?.message || 'Error occurred'}`);
    }
  };

  // Add Section / Floor
  const handleAddSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) {
      alert('Please enter a floor or section name');
      return;
    }

    try {
      const payload = {
        name: newSectionName.trim(),
        outletName: selectedOutlet,
        description: newSectionDesc.trim() || 'Custom dining section'
      };

      const res = await axios.post('/api/floor/sections', payload);
      if (res.data?.success) {
        showNotification(`🏛️ Floor section "${newSectionName}" created successfully!`);
        setShowAddSectionModal(false);
        setNewSectionName('');
        setNewSectionDesc('');
        loadData();
        setSelectedSection(newSectionName);
      }
    } catch (err: any) {
      alert(`Could not create section: ${err?.response?.data?.message || 'Error occurred'}`);
    }
  };

  // Assign Booking from Reservation or Walk-in
  const handleAssignBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assignTargetTableId) {
      alert('Please select an available target table');
      return;
    }

    const targetTable = tables.find(t => t.id === assignTargetTableId);
    if (!targetTable) return;

    try {
      let payload: any = {
        tableId: targetTable.id,
        tableNumber: targetTable.tableNumber,
        state: assignModeState
      };

      if (assignTab === 'RESERVATION') {
        const selectedRes = reservations.find(r => r.id === assignReservationId);
        if (!selectedRes) {
          alert('Please select a reservation to assign');
          return;
        }
        payload.guestName = `${selectedRes.customerName} (${selectedRes.guests} guests)`;
        payload.reservationId = selectedRes.id;
        payload.reservationRef = selectedRes.bookingReference;
        payload.notes = `Booking ${selectedRes.bookingReference} · ${selectedRes.tierPriorityTag || 'VIP'}`;
      } else {
        if (!walkinName.trim()) {
          alert('Please enter walk-in guest name');
          return;
        }
        payload.guestName = `${walkinName.trim()} (${walkinGuests} guests)`;
        payload.notes = walkinNotes || 'Walk-in dining party';
      }

      const res = await axios.post('/api/floor/assign-booking', payload);
      if (res.data?.success) {
        showNotification(`✨ Table T${targetTable.tableNumber} assigned successfully to ${payload.guestName}!`);
        setShowAssignBookingModal(false);
        setAssignReservationId(null);
        setAssignTargetTableId(null);
        setWalkinName('');
        setWalkinNotes('');
        loadData();
      }
    } catch (err: any) {
      alert(`Failed to assign table: ${err?.response?.data?.message || 'Error'}`);
    }
  };

  // Add Waitlist
  const handleAddWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistName.trim()) return;

    try {
      const payload = {
        name: waitlistName.trim(),
        guests: Number(waitlistGuests) || 2,
        waitMinutes: Number(waitlistMinutes) || 15
      };
      const res = await axios.post('/api/floor/waitlist', payload);
      if (res.data?.success) {
        showNotification(`📋 Guest "${waitlistName}" added to live waitlist!`);
        setShowAddWaitlistModal(false);
        setWaitlistName('');
        loadData();
      }
    } catch (err: any) {
      alert(`Could not add to waitlist: ${err?.response?.data?.message || 'Error'}`);
    }
  };

  // Assign Waitlist to Table
  const handleAssignWaitlistGuest = async (tableId: number) => {
    if (!assigningWaitlistEntry) return;

    try {
      await axios.post(`/api/floor/waitlist/${assigningWaitlistEntry.id}/assign?tableId=${tableId}`);
      showNotification(`🎉 ${assigningWaitlistEntry.name} seated successfully!`);
      setAssigningWaitlistEntry(null);
      loadData();
    } catch (err: any) {
      alert(`Failed to assign waitlist guest: ${err?.response?.data?.message || 'Error'}`);
    }
  };

  // Remove Waitlist Entry
  const handleRemoveWaitlist = async (id: number, name: string) => {
    if (!confirm(`Remove ${name} from waitlist?`)) return;
    try {
      await axios.delete(`/api/floor/waitlist/${id}`);
      showNotification(`Removed ${name} from waitlist.`);
      loadData();
    } catch (_) {}
  };

  const availableTables = tables.filter(t => t.state === 'Available');

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Toast Notification Banner */}
      {actionNotice && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          background: 'rgba(20, 20, 20, 0.95)',
          border: '1px solid var(--gold)',
          color: 'var(--text-main)',
          padding: '12px 20px',
          borderRadius: 12,
          boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 600,
          fontSize: 13,
          animation: 'fadeIn 0.2s ease'
        }}>
          <Sparkles size={16} color="var(--gold)" />
          {actionNotice}
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Armchair size={26} color="var(--gold)" /> Floor & Dining Tables
          </h1>
          <p className="page-subtitle">
            Configure dining floors, manage table layouts, and monitor live guest seating status
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Outlet Selector */}
          <select 
            className="outlet-select" 
            value={selectedOutlet} 
            onChange={(e) => setSelectedOutlet(e.target.value)}
            style={{ minWidth: 180 }}
          >
            <option value="Navrangpura">Navrangpura (Flagship)</option>
            <option value="Shilaj">Shilaj</option>
            <option value="Gandhinagar">Gandhinagar</option>
            <option value="Bodakdev">Bodakdev Signature</option>
          </select>

          {/* Add Floor Section Button */}
          <button 
            className="btn btn-outline"
            onClick={() => setShowAddSectionModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 14px' }}
          >
            <Layers size={15} /> + Add Floor
          </button>

          {/* Add Table Button */}
          <button 
            className="btn btn-outline"
            onClick={() => {
              if (sections.length > 0) setNewTableSection(sections[0].name);
              setShowAddTableModal(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 14px' }}
          >
            <Plus size={15} /> + Add Table
          </button>

          {/* Assign Booking Button */}
          <button 
            className="btn btn-primary"
            onClick={() => {
              if (availableTables.length > 0) setAssignTargetTableId(availableTables[0].id);
              setShowAssignBookingModal(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 16px', fontWeight: 700 }}
          >
            <UserCheck size={16} /> Assign Booking
          </button>

          {/* Refresh */}
          <button 
            className="btn btn-outline" 
            onClick={loadData}
            title="Refresh Floor Data"
            style={{ padding: '8px 10px' }}
          >
            <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Floor / Section Filter Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        alignItems: 'center', 
        overflowX: 'auto', 
        paddingBottom: 12, 
        marginBottom: 16,
        borderBottom: '1px solid var(--border)'
      }}>
        <button
          onClick={() => setSelectedSection('ALL')}
          style={{
            padding: '7px 16px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: selectedSection === 'ALL' ? 'var(--primary)' : 'var(--surface-alt)',
            color: selectedSection === 'ALL' ? '#000' : 'var(--text-main)',
            border: selectedSection === 'ALL' ? '1px solid var(--primary)' : '1px solid var(--border)'
          }}
        >
          All Floors ({tables.length})
        </button>

        {sections.map(sec => {
          const count = tables.filter(t => (t.floorSection || 'Main Dining Floor').toLowerCase() === sec.name.toLowerCase()).length;
          const isSelected = selectedSection.toLowerCase() === sec.name.toLowerCase();
          return (
            <button
              key={sec.id}
              onClick={() => setSelectedSection(sec.name)}
              style={{
                padding: '7px 16px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: isSelected ? 'var(--primary)' : 'var(--surface-alt)',
                color: isSelected ? '#000' : 'var(--text-main)',
                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)'
              }}
            >
              <span>{sec.name}</span>
              <span style={{ 
                fontSize: 10, 
                padding: '1px 6px', 
                borderRadius: 10, 
                background: isSelected ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.08)' 
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Left: Interactive Dining Tables Grid */}
        <div className="card" style={{ padding: 24 }}>
          {/* Grid Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 className="card-title" style={{ fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{selectedSection === 'ALL' ? 'Complete Restaurant Floor' : selectedSection}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>
                  ({filteredTables.length} tables configured)
                </span>
              </h2>
              <p className="card-subtitle" style={{ fontSize: 12 }}>
                Click any table to update status, seat walk-ins, view guest notes, or modify capacity
              </p>
            </div>

            {/* Status Legend */}
            <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }}></span> 
                Available ({filteredTables.filter(t => t.state === 'Available').length})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)' }}></span> 
                Reserved ({filteredTables.filter(t => t.state === 'Reserved').length})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }}></span> 
                Occupied ({filteredTables.filter(t => t.state === 'Occupied').length})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }}></span> 
                Cleaning ({filteredTables.filter(t => t.state === 'Cleaning').length})
              </span>
            </div>
          </div>

          {/* The Tables Floor Grid */}
          {filteredTables.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Armchair size={44} style={{ opacity: 0.3, marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, color: 'var(--text-main)', marginBottom: 6 }}>No Tables Configured in this Floor</h3>
              <p style={{ fontSize: 13, marginBottom: 18 }}>Click "+ Add Table" to configure dining capacity for this section.</p>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  if (selectedSection !== 'ALL') setNewTableSection(selectedSection);
                  setShowAddTableModal(true);
                }}
              >
                <Plus size={15} /> Add First Table
              </button>
            </div>
          ) : (
            <div className="floor-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(136px, 1fr))', gap: 14 }}>
              {filteredTables.map(table => {
                const isOccupied = table.state === 'Occupied';
                const isReserved = table.state === 'Reserved';
                const isCleaning = table.state === 'Cleaning';
                const isAvail = table.state === 'Available';

                return (
                  <div 
                    key={table.id || table.tableNumber}
                    className={`table-cell ${table.state}`}
                    onClick={() => openTableModal(table)}
                    title="Click to view details or change status"
                    style={{
                      borderRadius: 14,
                      padding: '14px 12px',
                      cursor: 'pointer',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: 126,
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      border: isOccupied 
                        ? '1px solid rgba(255, 138, 0, 0.45)' 
                        : isReserved 
                        ? '1px solid rgba(201, 162, 77, 0.45)'
                        : isCleaning
                        ? '1px solid rgba(255, 255, 255, 0.2)'
                        : '1px solid rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    {/* Card Top: T{number} and VIP badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--text-main)' }}>
                        T{table.tableNumber}
                      </strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {table.premium && (
                          <span title="VIP Connoisseur Table">
                            <Star size={14} color="var(--gold)" fill="var(--gold)" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Middle: Capacity and Section badge */}
                    <div style={{ marginTop: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                        <Users size={12} /> {table.seats} seats
                      </div>
                      {selectedSection === 'ALL' && (
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', opacity: 0.8, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {table.floorSection || 'Main Floor'}
                        </div>
                      )}
                    </div>

                    {/* Card Bottom: State and Guest Name */}
                    <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                      <span style={{ 
                        fontSize: 10, 
                        fontWeight: 800, 
                        letterSpacing: 0.6, 
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: 6,
                        background: isAvail ? 'rgba(16, 185, 129, 0.15)' :
                                   isReserved ? 'rgba(201, 162, 77, 0.18)' :
                                   isOccupied ? 'rgba(255, 138, 0, 0.2)' : 'rgba(255,255,255,0.08)',
                        color: isAvail ? 'var(--success)' :
                               isReserved ? 'var(--gold)' :
                               isOccupied ? 'var(--primary)' : 'var(--text-muted)'
                      }}>
                        {table.state}
                      </span>

                      {table.guest && (
                        <p style={{ 
                          fontSize: 11, 
                          color: 'var(--text-main)', 
                          fontWeight: 600,
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap', 
                          marginTop: 4 
                        }}>
                          {table.guest}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar: Seating Capacity & Live Waitlist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Live Capacity Card */}
          <div className="card" style={{ padding: 20 }}>
            <h2 className="card-title" style={{ fontSize: 16 }}>Seating Capacity</h2>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
              {selectedSection === 'ALL' ? 'Total Across All Floors' : selectedSection}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>{occupiedSeats} booked/seated</span>
              <strong style={{ color: 'var(--text-main)' }}>{totalSeats} total seats</strong>
            </div>
            
            <div style={{ height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden', margin: '10px 0' }}>
              <div style={{
                height: '100%',
                width: `${capacityPercent}%`,
                background: capacityPercent > 80 ? 'var(--primary)' : 'var(--success)',
                transition: 'width 0.4s ease'
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
              <span>{Math.max(0, totalSeats - occupiedSeats)} seats open</span>
              <span style={{ fontWeight: 700, color: capacityPercent > 80 ? 'var(--primary)' : 'var(--success)' }}>
                {capacityPercent}% Filled
              </span>
            </div>
          </div>

          {/* Live Waitlist Card */}
          <div className="card" style={{ flex: 1, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h2 className="card-title" style={{ fontSize: 16 }}>Live Waitlist</h2>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Queue for walk-in tables</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="badge badge-orange">{waitlist.length} waiting</span>
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowAddWaitlistModal(true)}
                  style={{ padding: '4px 8px', fontSize: 11, borderRadius: 8 }}
                  title="Add party to waitlist"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {waitlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                  <Users size={24} style={{ opacity: 0.3, marginBottom: 6 }} />
                  <p>No guests currently waiting</p>
                </div>
              ) : (
                waitlist.map(w => (
                  <div 
                    key={w.id} 
                    style={{ 
                      padding: 12, 
                      borderRadius: 12, 
                      background: 'var(--surface-alt)', 
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 13, color: 'var(--text-main)' }}>{w.name}</strong>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <span><Users size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {w.guests} guests</span>
                        <span>·</span>
                        <span><Clock size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {w.waitMinutes}m wait</span>
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => setAssigningWaitlistEntry(w)}
                        style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, fontWeight: 700 }}
                      >
                        Seat
                      </button>
                      <button
                        onClick={() => handleRemoveWaitlist(w.id, w.name)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                        title="Remove from queue"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: Table Action & Status Management                   */}
      {/* ============================================================ */}
      {selectedTableForAction && (
        <div className="modal-overlay" onClick={() => setSelectedTableForAction(null)}>
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 520, width: '92%', borderRadius: 20, padding: 26 }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>
                    Table T{selectedTableForAction.tableNumber}
                  </h3>
                  {selectedTableForAction.premium && (
                    <span style={{ fontSize: 11, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                      <Star size={13} fill="var(--gold)" /> VIP
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {selectedTableForAction.floorSection || 'Main Dining Floor'} · {selectedTableForAction.seats} Seats · Currently <strong style={{ color: 'var(--text-main)' }}>{selectedTableForAction.state}</strong>
                </p>
              </div>
              <button 
                onClick={() => setSelectedTableForAction(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Status Buttons */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                CHANGE STATUS:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {(['Available', 'Reserved', 'Occupied', 'Cleaning'] as const).map(s => {
                  const isActive = editTableState === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setEditTableState(s);
                        if (s === 'Available') setEditTableGuest('');
                      }}
                      style={{
                        padding: '10px 6px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                        background: isActive 
                          ? (s === 'Available' ? 'rgba(16, 185, 129, 0.25)' : s === 'Reserved' ? 'rgba(201, 162, 77, 0.25)' : s === 'Occupied' ? 'rgba(255, 138, 0, 0.25)' : 'rgba(255,255,255,0.15)')
                          : 'var(--surface-alt)',
                        color: isActive 
                          ? (s === 'Available' ? 'var(--success)' : s === 'Reserved' ? 'var(--gold)' : s === 'Occupied' ? 'var(--primary)' : 'var(--text-main)')
                          : 'var(--text-muted)',
                        border: isActive 
                          ? `1px solid ${s === 'Available' ? 'var(--success)' : s === 'Reserved' ? 'var(--gold)' : s === 'Occupied' ? 'var(--primary)' : 'rgba(255,255,255,0.3)'}`
                          : '1px solid var(--border)'
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guest Details (Shown if Occupied or Reserved) */}
            {(editTableState === 'Occupied' || editTableState === 'Reserved') && (
              <div style={{ marginBottom: 18, background: 'var(--surface-alt)', padding: 14, borderRadius: 14, border: '1px solid var(--border)' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 6 }}>
                  {editTableState === 'Occupied' ? 'Seated Guest / Party Name' : 'Reservation Guest Name'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Patel (4 guests)"
                  value={editTableGuest}
                  onChange={(e) => setEditTableGuest(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    marginBottom: 10
                  }}
                />

                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 6 }}>
                  Staff Notes / Occasion
                </label>
                <input
                  type="text"
                  placeholder="e.g. Birthday celebration, window seat preference"
                  value={editTableNotes}
                  onChange={(e) => setEditTableNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13
                  }}
                />
              </div>
            )}

            {/* Table Settings (Capacity, Floor Section, VIP) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Seats Capacity
                </label>
                <select
                  value={editTableSeats}
                  onChange={(e) => setEditTableSeats(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13
                  }}
                >
                  {[2, 4, 6, 8, 10, 12].map(n => (
                    <option key={n} value={n}>{n} Seats</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Floor / Section
                </label>
                <select
                  value={editTableSection}
                  onChange={(e) => setEditTableSection(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13
                  }}
                >
                  {sections.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* VIP Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <input 
                type="checkbox"
                id="editTablePremium"
                checked={editTablePremium}
                onChange={(e) => setEditTablePremium(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--gold)' }}
              />
              <label htmlFor="editTablePremium" style={{ fontSize: 13, color: 'var(--text-main)', cursor: 'pointer' }}>
                VIP Connoisseur Table (Highlighted with gold star)
              </label>
            </div>

            {/* Modal Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => handleDeleteTable(selectedTableForAction.id, selectedTableForAction.tableNumber)}
                className="btn btn-outline"
                style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.4)', fontSize: 12, padding: '8px 14px' }}
              >
                <Trash2 size={14} /> Delete Table
              </button>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setSelectedTableForAction(null)}
                  className="btn btn-outline"
                  style={{ fontSize: 12, padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTableChanges}
                  className="btn btn-primary"
                  style={{ fontSize: 12, padding: '8px 20px', fontWeight: 700 }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: Add New Table                                       */}
      {/* ============================================================ */}
      {showAddTableModal && (
        <div className="modal-overlay" onClick={() => setShowAddTableModal(false)}>
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 480, width: '92%', borderRadius: 20, padding: 26 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>+ Add Dining Table</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Configure new table capacity for {selectedOutlet}</p>
              </div>
              <button 
                onClick={() => setShowAddTableModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTableSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Table Number (T#) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 14,
                      fontWeight: 700
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Seating Capacity *
                  </label>
                  <select
                    value={newTableSeats}
                    onChange={(e) => setNewTableSeats(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13
                    }}
                  >
                    {[2, 4, 6, 8, 10, 12].map(n => (
                      <option key={n} value={n}>{n} Seats</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Floor / Dining Section *
                </label>
                <select
                  value={newTableSection}
                  onChange={(e) => setNewTableSection(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13
                  }}
                >
                  {sections.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Initial Status
                  </label>
                  <select
                    value={newTableState}
                    onChange={(e) => setNewTableState(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13
                    }}
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Cleaning">Cleaning</option>
                  </select>
                </div>

                {newTableState !== 'Available' && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                      Guest / Party
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. VIP Patel"
                      value={newTableGuest}
                      onChange={(e) => setNewTableGuest(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: 'var(--surface-alt)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-main)',
                        fontSize: 13
                      }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <input 
                  type="checkbox"
                  id="newTablePremium"
                  checked={newTablePremium}
                  onChange={(e) => setNewTablePremium(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: 'var(--gold)' }}
                />
                <label htmlFor="newTablePremium" style={{ fontSize: 13, color: 'var(--text-main)', cursor: 'pointer' }}>
                  Mark as VIP Table
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddTableModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontWeight: 700, padding: '8px 22px' }}
                >
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: Add Floor / Section                                */}
      {/* ============================================================ */}
      {showAddSectionModal && (
        <div className="modal-overlay" onClick={() => setShowAddSectionModal(false)}>
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 440, width: '92%', borderRadius: 20, padding: 26 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>+ Add Floor / Section</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Create a new dining zone for {selectedOutlet}</p>
              </div>
              <button 
                onClick={() => setShowAddSectionModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSectionSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Section / Floor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Garden Deck, 1st Floor AC Hall, VIP Lounge"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Description / Ambience
                </label>
                <input
                  type="text"
                  placeholder="e.g. Open-air garden dining with ambient candlelight"
                  value={newSectionDesc}
                  onChange={(e) => setNewSectionDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontWeight: 700, padding: '8px 22px' }}
                >
                  Create Floor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: Assign Booking (Reservations / Walk-ins)            */}
      {/* ============================================================ */}
      {showAssignBookingModal && (
        <div className="modal-overlay" onClick={() => setShowAssignBookingModal(false)}>
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 560, width: '92%', borderRadius: 20, padding: 26 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>Assign Booking to Table</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Seat a live reservation or assign a walk-in guest</p>
              </div>
              <button 
                onClick={() => setShowAssignBookingModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Tab Switcher */}
            <div style={{ display: 'flex', background: 'var(--surface-alt)', borderRadius: 12, padding: 4, marginBottom: 18 }}>
              <button
                type="button"
                onClick={() => setAssignTab('RESERVATION')}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: assignTab === 'RESERVATION' ? 'var(--primary)' : 'transparent',
                  color: assignTab === 'RESERVATION' ? '#000' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                Live Reservations ({reservations.filter(r => !r.tableAssigned && r.status !== 'Cancelled').length})
              </button>
              <button
                type="button"
                onClick={() => setAssignTab('WALKIN')}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: assignTab === 'WALKIN' ? 'var(--primary)' : 'transparent',
                  color: assignTab === 'WALKIN' ? '#000' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                Walk-in Seating
              </button>
            </div>

            <form onSubmit={handleAssignBookingSubmit}>
              {/* Target Table Dropdown */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Select Available Table *
                </label>
                {availableTables.length === 0 ? (
                  <div style={{ padding: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: 12, color: '#EF4444' }}>
                    No tables are currently "Available". Please vacate or clean a table first.
                  </div>
                ) : (
                  <select
                    value={assignTargetTableId || ''}
                    onChange={(e) => setAssignTargetTableId(Number(e.target.value))}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      fontWeight: 600
                    }}
                  >
                    {availableTables.map(t => (
                      <option key={t.id} value={t.id}>
                        Table T{t.tableNumber} — {t.seats} Seats ({t.floorSection || 'Main Dining Floor'}) {t.premium ? '★ VIP' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Status Setting */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Table State Assignment:
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setAssignModeState('Occupied')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: assignModeState === 'Occupied' ? 'rgba(255,138,0,0.2)' : 'var(--surface-alt)',
                      color: assignModeState === 'Occupied' ? 'var(--primary)' : 'var(--text-muted)',
                      border: assignModeState === 'Occupied' ? '1px solid var(--primary)' : '1px solid var(--border)'
                    }}
                  >
                    Seat Now (Occupied)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignModeState('Reserved')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: assignModeState === 'Reserved' ? 'rgba(201,162,77,0.2)' : 'var(--surface-alt)',
                      color: assignModeState === 'Reserved' ? 'var(--gold)' : 'var(--text-muted)',
                      border: assignModeState === 'Reserved' ? '1px solid var(--gold)' : '1px solid var(--border)'
                    }}
                  >
                    Pre-reserve (Reserved)
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {assignTab === 'RESERVATION' ? (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    Select Reservation to Seat:
                  </label>
                  <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {reservations.filter(r => r.status !== 'Cancelled').length === 0 ? (
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 12 }}>
                        No reservations found in system.
                      </p>
                    ) : (
                      reservations.filter(r => r.status !== 'Cancelled').map(r => {
                        const isSelected = assignReservationId === r.id;
                        return (
                          <div
                            key={r.id}
                            onClick={() => setAssignReservationId(r.id)}
                            style={{
                              padding: '10px 14px',
                              borderRadius: 10,
                              cursor: 'pointer',
                              border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                              background: isSelected ? 'rgba(255,138,0,0.1)' : 'var(--surface-alt)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: 13, color: 'var(--text-main)' }}>{r.customerName}</strong>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                {r.bookingReference} · {r.guests} guests · {r.reservationTime}
                              </div>
                            </div>
                            <span style={{
                              fontSize: 10,
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: 6,
                              background: r.vip ? 'rgba(201,162,77,0.2)' : 'rgba(255,255,255,0.08)',
                              color: r.vip ? 'var(--gold)' : 'var(--text-muted)'
                            }}>
                              {r.tierPriorityTag || (r.vip ? 'VIP' : 'Standard')}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                        Guest Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hardik Shah"
                        value={walkinName}
                        onChange={(e) => setWalkinName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: 'var(--surface-alt)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-main)',
                          fontSize: 13
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                        Guests Count
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={walkinGuests}
                        onChange={(e) => setWalkinGuests(Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: 'var(--surface-alt)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-main)',
                          fontSize: 13
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                      Notes / Requests
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. High chair needed, celebratory dinner"
                      value={walkinNotes}
                      onChange={(e) => setWalkinNotes(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: 'var(--surface-alt)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-main)',
                        fontSize: 13
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAssignBookingModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={availableTables.length === 0}
                  className="btn btn-primary"
                  style={{ fontWeight: 700, padding: '8px 24px' }}
                >
                  Confirm & Assign Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 5: Add to Waitlist                                     */}
      {/* ============================================================ */}
      {showAddWaitlistModal && (
        <div className="modal-overlay" onClick={() => setShowAddWaitlistModal(false)}>
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 420, width: '92%', borderRadius: 20, padding: 24 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>+ Add to Live Waitlist</h3>
              <button 
                onClick={() => setShowAddWaitlistModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddWaitlistSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Guest / Party Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sharma Family"
                  value={waitlistName}
                  onChange={(e) => setWaitlistName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Guests
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={waitlistGuests}
                    onChange={(e) => setWaitlistGuests(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Wait Est. (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={waitlistMinutes}
                    onChange={(e) => setWaitlistMinutes(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddWaitlistModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontWeight: 700 }}
                >
                  Add to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 6: Assign Waitlist Guest to Table Picker              */}
      {/* ============================================================ */}
      {assigningWaitlistEntry && (
        <div className="modal-overlay" onClick={() => setAssigningWaitlistEntry(null)}>
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 460, width: '92%', borderRadius: 20, padding: 24 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>
                  Seat {assigningWaitlistEntry.name}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Party size: {assigningWaitlistEntry.guests} guests · Select an available dining table
                </p>
              </div>
              <button 
                onClick={() => setAssigningWaitlistEntry(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {availableTables.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No tables currently Available. Please mark a table clean/vacate first.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto', marginBottom: 20 }}>
                {availableTables.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleAssignWaitlistGuest(t.id)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: 'var(--text-main)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <strong style={{ fontSize: 15, color: 'var(--primary)' }}>Table T{t.tableNumber}</strong>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {t.seats} Seats · {t.floorSection || 'Main Dining Floor'}
                      </div>
                    </div>
                    <span className="btn btn-sm btn-primary" style={{ fontSize: 11, padding: '4px 10px' }}>
                      Seat Here
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => setAssigningWaitlistEntry(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
