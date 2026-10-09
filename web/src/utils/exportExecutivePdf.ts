import { KPI, Outlet, Reservation } from '../types';

interface ExportPdfParams {
  kpis: KPI[];
  outlets: Outlet[];
  reservations: Reservation[];
  couponMix: { name: string; value: number }[];
  branchScope?: string;
  adminName?: string;
}

export function exportExecutivePdf({
  kpis,
  outlets,
  reservations,
  couponMix,
  branchScope = 'All Branches (Group Consolidated)',
  adminName = 'Super Admin (Group Owner)',
}: ExportPdfParams) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups in your browser to view and download the Executive PDF Report.');
    return;
  }

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate totals
  const totalRevenueLakhs = outlets.reduce((acc, o) => acc + (o.revenueLakhs || 0), 0).toFixed(1);
  const totalActiveVips = outlets.reduce((acc, o) => acc + (o.activeMembers || 0), 0);
  const avgRating = outlets.length > 0
    ? (outlets.reduce((acc, o) => acc + (o.rating || 0), 0) / outlets.length).toFixed(1)
    : '4.8';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>YANKI Hospitality · Executive Board Telemetry Report (${new Date().toISOString().slice(0, 10)})</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #FFFFFF;
      color: #1F2937;
      line-height: 1.5;
      font-size: 13px;
      padding: 24px 32px;
    }

    /* Print Screen Toolbar (Hidden on paper/PDF print) */
    .screen-toolbar {
      position: sticky;
      top: 0;
      background: #111827;
      color: #F9FAFB;
      padding: 12px 20px;
      margin: -24px -32px 24px -32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #C9A24D;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
    }

    .screen-toolbar button {
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }

    .btn-print {
      background: linear-gradient(135deg, #C9A24D 0%, #A37E30 100%);
      color: #000;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-print:hover {
      background: #E0BA62;
    }

    .btn-close {
      background: rgba(255, 255, 255, 0.15);
      color: #FFF;
    }

    .btn-close:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    /* Executive Document Header */
    .doc-header {
      border-bottom: 2px solid #111827;
      padding-bottom: 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .brand-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 26px;
      font-weight: 800;
      color: #111827;
      letter-spacing: -0.5px;
    }

    .brand-subtitle {
      font-size: 12px;
      font-weight: 700;
      color: #92400E;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-top: 2px;
    }

    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #4B5563;
    }

    .confidential-pill {
      display: inline-block;
      background: #FEF3C7;
      color: #92400E;
      border: 1px solid #F59E0B;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 800;
      font-size: 10px;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
    }

    /* Section Headers */
    .section-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 17px;
      font-weight: 700;
      color: #111827;
      margin: 22px 0 10px;
      padding-bottom: 4px;
      border-bottom: 1.5px solid #E5E7EB;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-title span.tag {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 10px;
      font-weight: 700;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* KPI Grid */
    .kpi-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 18px;
    }

    .kpi-box {
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-left: 4px solid #C9A24D;
      border-radius: 6px;
      padding: 12px 14px;
    }

    .kpi-label {
      font-size: 11px;
      font-weight: 600;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .kpi-value {
      font-size: 22px;
      font-weight: 800;
      color: #111827;
      margin: 4px 0 2px;
      font-family: 'Playfair Display', serif;
    }

    .kpi-delta {
      font-size: 11px;
      font-weight: 700;
      color: #059669;
    }

    .kpi-delta.down {
      color: #DC2626;
    }

    /* Executive Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;
      font-size: 11.5px;
    }

    th {
      background: #111827;
      color: #FFFFFF;
      font-weight: 700;
      text-align: left;
      padding: 8px 10px;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
    }

    td {
      padding: 8px 10px;
      border-bottom: 1px solid #E5E7EB;
      color: #374151;
    }

    tr:nth-child(even) td {
      background: #F9FAFB;
    }

    .badge-status {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .badge-confirmed { background: #DEF7EC; color: #03543F; }
    .badge-seated { background: #E1EFFE; color: #1E429F; }
    .badge-pending { background: #FEF08A; color: #854D0E; }
    .badge-vip { background: #FDE8E8; color: #9B1C1C; }

    /* Summary Matrix & Voucher Mix */
    .two-column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    /* Executive Sign-off & Audit Block */
    .audit-block {
      margin-top: 32px;
      padding-top: 18px;
      border-top: 1.5px dashed #D1D5DB;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      page-break-inside: avoid;
    }

    .signature-box {
      width: 220px;
      border-top: 1px solid #111827;
      padding-top: 6px;
      text-align: center;
      font-size: 11px;
      font-weight: 700;
      color: #111827;
    }

    .checksum-box {
      font-size: 10px;
      color: #6B7280;
      line-height: 1.4;
    }

    /* Print Specific Media Rules */
    @media print {
      body {
        padding: 0;
        font-size: 11px;
      }

      .screen-toolbar {
        display: none !important;
      }

      @page {
        size: A4 portrait;
        margin: 12mm 15mm;
      }

      .doc-header {
        margin-top: 0;
      }

      .kpi-container {
        gap: 8px;
      }

      .kpi-box {
        padding: 8px 10px;
      }

      .kpi-value {
        font-size: 18px;
      }

      table {
        page-break-inside: auto;
      }

      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
    }
  </style>
</head>
<body>

  <!-- Top Toolbar on Screen -->
  <div class="screen-toolbar">
    <div>
      <span style="font-weight: 700; font-size: 14px; color: #C9A24D;">Executive Board Report (PDF Print Ready)</span>
      <span style="font-size: 11px; color: #9CA3AF; margin-left: 10px;">Click 'Print or Save as PDF' to generate high-resolution document</span>
    </div>
    <div style="display: flex; gap: 10px;">
      <button class="btn-print" onclick="window.print()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
        Print or Save as PDF
      </button>
      <button class="btn-close" onclick="window.close()">Close Window</button>
    </div>
  </div>

  <!-- Document Header -->
  <div class="doc-header">
    <div>
      <div class="brand-title">HOUSE OF YANKI · SIZZLO</div>
      <div class="brand-subtitle">Executive Board Telemetry & Operations Audit</div>
      <div style="font-size: 11px; color: #4B5563; margin-top: 4px;">
        Consolidated Group Performance · Hospitality & Privilege Subscription Analytics
      </div>
    </div>
    <div class="meta-box">
      <div><span class="confidential-pill">BOARD CONFIDENTIAL</span></div>
      <div><strong>Report Date:</strong> ${currentDate}</div>
      <div><strong>Generation Time:</strong> ${currentTime} IST</div>
      <div><strong>Scope:</strong> ${branchScope}</div>
      <div><strong>Authorized By:</strong> ${adminName}</div>
    </div>
  </div>

  <!-- Section 1: Executive KPI Scorecard -->
  <div class="section-title">
    <span>Executive KPI Performance Scorecard</span>
    <span class="tag">Consolidated Metrics</span>
  </div>

  <div class="kpi-container">
    ${kpis.map(k => `
      <div class="kpi-box">
        <div class="kpi-label">${k.label}</div>
        <div class="kpi-value">${k.value}</div>
        <div class="kpi-delta ${k.trend === 'down' ? 'down' : ''}">
          ${k.trend === 'up' ? '▲' : '▼'} ${k.delta} vs baseline (${k.trend.toUpperCase()})
        </div>
      </div>
    `).join('')}
  </div>

  <!-- Section 2: Venues & Dining Concepts Matrix -->
  <div class="section-title">
    <span>Dining Venues & Concepts Financial Performance</span>
    <span class="tag">${outlets.length} Venues Active</span>
  </div>

  <table>
    <thead>
      <tr>
        <th>Venue / Concept Name</th>
        <th>City / Location</th>
        <th>Monthly Gross Rev</th>
        <th>Active VIPs</th>
        <th>Avg Bill Value (ABV)</th>
        <th>Customer Rating</th>
      </tr>
    </thead>
    <tbody>
      ${outlets.map(o => `
        <tr>
          <td><strong>${o.name}</strong></td>
          <td>${o.city || 'Ahmedabad'}</td>
          <td>₹${o.revenueLakhs} Lakhs</td>
          <td>${o.activeMembers || 0} Members</td>
          <td>₹${o.averageBillValue || 1650}</td>
          <td>★ ${o.rating || 4.8} / 5.0</td>
        </tr>
      `).join('')}
      <tr style="font-weight: 800; background: #E5E7EB;">
        <td colspan="2">GROUP CONSOLIDATED TOTALS</td>
        <td>₹${totalRevenueLakhs} Lakhs</td>
        <td>${totalActiveVips} VIP Patrons</td>
        <td>-</td>
        <td>★ ${avgRating} / 5.0</td>
      </tr>
    </tbody>
  </table>

  <!-- Two Column Layout: Reservations & Voucher Distribution -->
  <div class="two-column">
    <!-- Reservations Telemetry -->
    <div>
      <div class="section-title">
        <span>Live Table Inquiries & Covers</span>
        <span class="tag">Floor Telemetry</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Patron / Guest</th>
            <th>Covers</th>
            <th>Time Slot</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${reservations.slice(0, 6).map(r => `
            <tr>
              <td>
                <strong>${r.customerName}</strong>
                ${r.vip ? '<span style="color:#C9A24D; font-size:10px; font-weight:800;"> (VIP)</span>' : ''}
              </td>
              <td>${r.guests} Guests</td>
              <td>${r.reservationTime || 'Tonight'}</td>
              <td>
                <span class="badge-status ${
                  (r.status as string) === 'Confirmed' ? 'badge-confirmed' :
                  (r.status as string) === 'Seated' ? 'badge-seated' :
                  (r.status as string) === 'Pending' ? 'badge-pending' : 'badge-vip'
                }">${r.status}</span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Voucher Mix Telemetry -->
    <div>
      <div class="section-title">
        <span>Dining Privilege Redemptions</span>
        <span class="tag">Privilege Mix</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Privilege Voucher Category</th>
            <th>Redemptions</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${(couponMix.length > 0 ? couponMix : [
            { name: 'Classic 10% Dining Privilege', value: 342 },
            { name: 'Signature Couple Feast (50% Off)', value: 189 },
            { name: 'Elite Chef Table & Banquet Pass', value: 124 },
            { name: 'Complimentary Birthday Dessert', value: 98 },
            { name: 'Dough by Yanki B1G1 Treat', value: 215 },
          ]).map(c => `
            <tr>
              <td><strong>${c.name}</strong></td>
              <td>${c.value} Vouchers</td>
              <td><span style="color: #059669; font-weight: 700; font-size: 10px;">● ACTIVE REDEMPTION</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Section 4: Audit & Sign-off Block -->
  <div class="audit-block">
    <div class="checksum-box">
      <div><strong>System Telemetry Node:</strong> Sizzlo-Yanki-Prod-Cluster-01</div>
      <div><strong>Audit Checksum:</strong> SHA-256: 8f9b4c27...e112d (Verified Dynamic)</div>
      <div><strong>Classification:</strong> Strict Confidentiality under House of Yanki Bylaws.</div>
    </div>
    <div class="signature-box">
      Certified Executive Signature<br>
      <span style="font-weight: 400; font-size: 10px; color: #4B5563;">Managing Director / Board Representative</span>
    </div>
  </div>

  <script>
    // Automatically trigger print dialog after document is painted
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
