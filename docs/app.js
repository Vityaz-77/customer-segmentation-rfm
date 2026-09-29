/**
 * RFM Analytics & Customer Segmentation - Web Dashboard Application
 * Logic for KPIs, interactive Chart.js charts, segment filtering, table sorting/pagination, and CSV handling.
 */

(function () {
  'use strict';

  // --- State ---
  let allData = [];
  let summaryData = [];
  let filteredData = [];
  let activeSegment = 'ALL';
  let searchQuery = '';
  let sortColumn = 'Monetary';
  let sortDirection = 'desc';
  let currentPage = 1;
  const pageSize = 10;

  // Chart Instances
  let chartDoughnut = null;
  let chartRevenue = null;
  let chartAvgMetrics = null;
  let chartScatter = null;

  // Segment Color Map
  const SEGMENT_COLORS = {
    'Champions': '#10b981',
    'Loyal Customers': '#3b82f6',
    'Potential Loyalists': '#8b5cf6',
    'Need Attention': '#f59e0b',
    'At Risk': '#ef4444',
    'Hibernating': '#64748b',
    'Others': '#ec4899',
  };

  const PLAYBOOK_DETAILS = {
    'Champions': {
      priority: 'high',
      priorityLabel: 'VIP Priority',
      strategy: 'Berikan reward loyalitas eksklusif, akses awal ke produk/fitur baru, dan jadikan brand ambassadors.',
      channel: 'Personal WhatsApp VIP & Private Event',
      impact: 'Pertahankan 26%+ total omzet bisnis'
    },
    'Loyal Customers': {
      priority: 'steady',
      priorityLabel: 'Growth Focus',
      strategy: 'Tingkatkan nilai keranjang belanja melalui program cross-sell/upsell dan insentif pembelian bernilai lebih tinggi.',
      channel: 'Email Newsletter & In-App Personalized Offer',
      impact: 'Mendorong kenaikan Average Order Value (AOV)'
    },
    'Potential Loyalists': {
      priority: 'steady',
      priorityLabel: 'Nurturing',
      strategy: 'Berikan penawaran diskon pembelian kedua/ketiga dan panduan produk untuk membentuk kebiasaan belanja rutin.',
      channel: 'Automated Push Notification & Welcome Voucher',
      impact: 'Konversi pelanggan baru menjadi pembeli setia'
    },
    'Need Attention': {
      priority: 'med',
      priorityLabel: 'Warning',
      strategy: 'Kirimkan notifikasi pengingat sebelum mereka melupakan platform, serta survei singkat kepuasan layanan.',
      channel: 'Email Re-engagement & SMS Promo Flash Sale',
      impact: 'Mencegah penurunan ke segmen berisiko (At Risk)'
    },
    'At Risk': {
      priority: 'high',
      priorityLabel: 'Critical Retention',
      strategy: 'Jalankan kampanye win-back agresif dengan voucher bernilai tinggi atau diskon belanja dengan batas waktu singkat.',
      channel: 'Direct WhatsApp Marketing & Targeted Ads Retargeting',
      impact: 'Menyelamatkan pelanggan bernilai tinggi sebelum churn total'
    },
    'Hibernating': {
      priority: 'steady',
      priorityLabel: 'Low Cost Campaign',
      strategy: 'Jangan buang anggaran iklan berlebihan. Gunakan kampanye email berkala berbiaya rendah untuk produk relevan.',
      channel: 'Bulk Email Newsletter / Social Media Awareness',
      impact: 'Re-aktivasi organik tanpa membebani CAC'
    },
    'Others': {
      priority: 'med',
      priorityLabel: 'Exploratory',
      strategy: 'Lakukan analisis preferensi kategori transaksi untuk memetakan penawaran promo yang lebih tepat sasaran.',
      channel: 'Multi-channel Standard Campaign',
      impact: 'Optimasi segmentasi jangka menengah'
    }
  };

  // --- Utilities ---
  function formatIDR(value) {
    if (isNaN(value)) return 'Rp 0';
    if (value >= 1_000_000_000) {
      return 'Rp ' + (value / 1_000_000_000).toFixed(2) + ' Miliar';
    }
    if (value >= 1_000_000) {
      return 'Rp ' + (value / 1_000_000).toFixed(1) + ' Juta';
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('id-ID').format(value);
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // --- Initialization ---
  function init() {
    if (typeof DEFAULT_RFM_DATA !== 'undefined' && Array.isArray(DEFAULT_RFM_DATA)) {
      allData = JSON.parse(JSON.stringify(DEFAULT_RFM_DATA));
    } else {
      console.warn('DEFAULT_RFM_DATA not found. Initializing empty.');
      allData = [];
    }

    if (typeof DEFAULT_SEGMENT_SUMMARY !== 'undefined' && Array.isArray(DEFAULT_SEGMENT_SUMMARY)) {
      summaryData = JSON.parse(JSON.stringify(DEFAULT_SEGMENT_SUMMARY));
    }

    setupEventListeners();
    updateDashboard();
  }

  // --- Event Listeners ---
  function setupEventListeners() {
    // Segment Filter Pills
    document.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const seg = btn.getAttribute('data-segment');
        document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeSegment = seg;
        currentPage = 1;
        applyFilters();
      });
    });

    // Search Input
    const searchInput = document.getElementById('customerSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        currentPage = 1;
        applyFilters();
      });
    }

    // Reset Filter Button
    const resetBtn = document.getElementById('resetFiltersBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        activeSegment = 'ALL';
        searchQuery = '';
        if (searchInput) searchInput.value = '';
        document.querySelectorAll('.pill-btn').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-segment') === 'ALL');
        });
        currentPage = 1;
        applyFilters();
        showToast('Filter direset ke semua segmen');
      });
    }

    // Export CSV Button
    const exportBtn = document.getElementById('exportFilteredCsvBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportFilteredDataToCSV);
    }

    // Table Sorting
    document.querySelectorAll('th.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-col');
        if (sortColumn === col) {
          sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          sortColumn = col;
          sortDirection = ['Recency'].includes(col) ? 'asc' : 'desc';
        }
        updateSortHeaders();
        renderTable();
      });
    });

    // Pagination Controls
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderTable();
        }
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
        if (currentPage < totalPages) {
          currentPage++;
          renderTable();
        }
      });
    }

    // Upload Modal
    const openModalBtn = document.getElementById('openUploadModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalOverlay = document.getElementById('uploadModal');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('csvFileInput');
    const resetDemoBtn = document.getElementById('resetDemoDataBtn');

    if (openModalBtn && modalOverlay) {
      openModalBtn.addEventListener('click', () => modalOverlay.classList.add('open'));
    }
    if (closeModalBtn && modalOverlay) {
      closeModalBtn.addEventListener('click', () => modalOverlay.classList.remove('open'));
    }
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.classList.remove('open');
      });
    }

    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => fileInput.click());
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
          handleUploadedFile(e.dataTransfer.files[0]);
        }
      });
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
          handleUploadedFile(e.target.files[0]);
        }
      });
    }

    if (resetDemoBtn) {
      resetDemoBtn.addEventListener('click', () => {
        if (typeof DEFAULT_RFM_DATA !== 'undefined') {
          allData = JSON.parse(JSON.stringify(DEFAULT_RFM_DATA));
          updateDashboard();
          showToast('Dataset demo berhasil dimuat ulang');
          if (modalOverlay) modalOverlay.classList.remove('open');
        }
      });
    }
  }

  // --- Filtering & Calculations ---
  function updateDashboard() {
    updateFilterCounts();
    applyFilters();
    initOrUpdateCharts();
  }

  function updateFilterCounts() {
    const counts = { ALL: allData.length };
    allData.forEach(row => {
      counts[row.Segment] = (counts[row.Segment] || 0) + 1;
    });

    document.querySelectorAll('.pill-btn').forEach(btn => {
      const seg = btn.getAttribute('data-segment');
      const badge = btn.querySelector('.pill-count');
      if (badge) {
        badge.textContent = counts[seg] || 0;
      }
    });
  }

  function applyFilters() {
    filteredData = allData.filter(row => {
      const matchesSeg = (activeSegment === 'ALL' || row.Segment === activeSegment);
      const matchesSearch = !searchQuery ||
        row.customer_id.toLowerCase().includes(searchQuery) ||
        row.Segment.toLowerCase().includes(searchQuery);
      return matchesSeg && matchesSearch;
    });

    updateKPIs();
    renderPlaybook();
    renderTable();
  }

  function updateKPIs() {
    const totalRev = filteredData.reduce((acc, curr) => acc + (Number(curr.Monetary) || 0), 0);
    const totalCust = filteredData.length;
    const aov = totalCust > 0 ? (totalRev / filteredData.reduce((acc, c) => acc + (Number(c.Frequency) || 1), 0)) : 0;

    // Churn Risk calculation (At Risk + Hibernating)
    const atRiskCount = filteredData.filter(c => c.Segment === 'At Risk' || c.Segment === 'Hibernating').length;
    const churnPct = totalCust > 0 ? ((atRiskCount / totalCust) * 100).toFixed(1) : 0;

    // Find top segment in this view
    const segCounts = {};
    filteredData.forEach(c => { segCounts[c.Segment] = (segCounts[c.Segment] || 0) + 1; });
    let topSeg = '-';
    let maxCount = 0;
    for (const [k, v] of Object.entries(segCounts)) {
      if (v > maxCount) {
        maxCount = v;
        topSeg = k;
      }
    }

    // Render KPI elements
    const kpiRev = document.getElementById('kpiTotalRevenue');
    const kpiCust = document.getElementById('kpiTotalCustomers');
    const kpiAov = document.getElementById('kpiAOV');
    const kpiChurn = document.getElementById('kpiChurnRisk');
    const kpiTopSeg = document.getElementById('kpiTopSegment');

    if (kpiRev) kpiRev.textContent = formatIDR(totalRev);
    if (kpiCust) kpiCust.textContent = formatNumber(totalCust);
    if (kpiAov) kpiAov.textContent = formatIDR(aov);
    if (kpiChurn) kpiChurn.textContent = `${churnPct}% (${atRiskCount})`;
    if (kpiTopSeg) kpiTopSeg.textContent = topSeg;

    const datasetCountElem = document.getElementById('datasetActiveCount');
    if (datasetCountElem) datasetCountElem.textContent = `${formatNumber(filteredData.length)} / ${formatNumber(allData.length)}`;
  }

  // --- Charts Management ---
  function initOrUpdateCharts() {
    renderDoughnutChart();
    renderRevenueChart();
    renderAvgMetricsChart();
    renderScatterChart();
  }

  function renderDoughnutChart() {
    const ctx = document.getElementById('segmentDoughnutChart');
    if (!ctx) return;

    const segmentCounts = {};
    allData.forEach(row => {
      segmentCounts[row.Segment] = (segmentCounts[row.Segment] || 0) + 1;
    });

    const labels = Object.keys(segmentCounts);
    const data = Object.values(segmentCounts);
    const bgColors = labels.map(l => SEGMENT_COLORS[l] || '#94a3b8');

    if (chartDoughnut) {
      chartDoughnut.data.labels = labels;
      chartDoughnut.data.datasets[0].data = data;
      chartDoughnut.data.datasets[0].backgroundColor = bgColors;
      chartDoughnut.update();
      return;
    }

    chartDoughnut = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: bgColors,
          borderColor: '#0f172a',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#94a3b8',
              font: { family: 'Plus Jakarta Sans', size: 12 },
              padding: 12
            }
          },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const val = ctx.raw || 0;
                const pct = ((val / total) * 100).toFixed(1);
                return ` ${ctx.label}: ${val} pelanggan (${pct}%)`;
              }
            }
          }
        },
        cutout: '68%'
      }
    });
  }

  function renderRevenueChart() {
    const ctx = document.getElementById('revenueBySegmentChart');
    if (!ctx) return;

    const revBySeg = {};
    allData.forEach(row => {
      revBySeg[row.Segment] = (revBySeg[row.Segment] || 0) + (Number(row.Monetary) || 0);
    });

    // Sort descending by revenue
    const sorted = Object.entries(revBySeg).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(s => s[0]);
    const values = sorted.map(s => s[1]);
    const colors = labels.map(l => SEGMENT_COLORS[l] || '#3b82f6');

    if (chartRevenue) {
      chartRevenue.data.labels = labels;
      chartRevenue.data.datasets[0].data = values;
      chartRevenue.data.datasets[0].backgroundColor = colors;
      chartRevenue.update();
      return;
    }

    chartRevenue = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Revenue (IDR)',
          data: values,
          backgroundColor: colors,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` Revenue: ${formatIDR(ctx.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#94a3b8',
              font: { family: 'Plus Jakarta Sans', size: 11 },
              maxRotation: 25,
              minRotation: 20
            }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94a3b8',
              font: { family: 'Plus Jakarta Sans', size: 11 },
              callback: (v) => `${(v / 1_000_000).toFixed(0)}M`
            }
          }
        }
      }
    });
  }

  function renderAvgMetricsChart() {
    const ctx = document.getElementById('avgRfMetricsChart');
    if (!ctx) return;

    const segments = ['Champions', 'Loyal Customers', 'Potential Loyalists', 'Need Attention', 'At Risk', 'Hibernating'];
    const rScores = [];
    const fScores = [];
    const mScores = [];

    segments.forEach(seg => {
      const subset = allData.filter(d => d.Segment === seg);
      if (subset.length === 0) {
        rScores.push(0);
        fScores.push(0);
        mScores.push(0);
      } else {
        const avgR = subset.reduce((a, b) => a + Number(b.R_Score || 0), 0) / subset.length;
        const avgF = subset.reduce((a, b) => a + Number(b.F_Score || 0), 0) / subset.length;
        const avgM = subset.reduce((a, b) => a + Number(b.M_Score || 0), 0) / subset.length;
        rScores.push(avgR.toFixed(2));
        fScores.push(avgF.toFixed(2));
        mScores.push(avgM.toFixed(2));
      }
    });

    if (chartAvgMetrics) {
      chartAvgMetrics.data.datasets[0].data = rScores;
      chartAvgMetrics.data.datasets[1].data = fScores;
      chartAvgMetrics.data.datasets[2].data = mScores;
      chartAvgMetrics.update();
      return;
    }

    chartAvgMetrics = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: segments,
        datasets: [
          { label: 'R Score (Recency)', data: rScores, backgroundColor: '#818cf8', borderRadius: 4 },
          { label: 'F Score (Frequency)', data: fScores, backgroundColor: '#06b6d4', borderRadius: 4 },
          { label: 'M Score (Monetary)', data: mScores, backgroundColor: '#10b981', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 10 }, maxRotation: 20 }
          },
          y: {
            max: 5,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8', stepSize: 1 }
          }
        }
      }
    });
  }

  function renderScatterChart() {
    const ctx = document.getElementById('recencyVsMonetaryChart');
    if (!ctx) return;

    // Sample data if too large, or map all 300
    const points = allData.map(row => ({
      x: Number(row.Recency) || 0,
      y: Number(row.Monetary) || 0,
      r: Math.min(12, Math.max(4, (Number(row.Frequency) || 1) * 1.5)),
      segment: row.Segment,
      custId: row.customer_id
    }));

    if (chartScatter) {
      chartScatter.data.datasets[0].data = points;
      chartScatter.update();
      return;
    }

    chartScatter = new Chart(ctx, {
      type: 'bubble',
      data: {
        datasets: [{
          label: 'Pelanggan',
          data: points,
          backgroundColor: (ctx) => {
            const seg = ctx.raw?.segment;
            const hex = SEGMENT_COLORS[seg] || '#6366f1';
            return hex + 'a0'; // add transparency
          },
          borderColor: (ctx) => {
            const seg = ctx.raw?.segment;
            return SEGMENT_COLORS[seg] || '#6366f1';
          },
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const item = ctx.raw;
                return ` ${item.custId} [${item.segment}]: ${item.x} hari lalu, ${formatIDR(item.y)}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Recency (Hari sejak transaksi terakhir)', color: '#94a3b8' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' }
          },
          y: {
            title: { display: true, text: 'Monetary Spending (IDR)', color: '#94a3b8' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94a3b8',
              callback: (v) => `${(v / 1_000_000).toFixed(0)}M`
            }
          }
        }
      }
    });
  }

  // --- Playbook Rendering ---
  function renderPlaybook() {
    const container = document.getElementById('playbookGrid');
    if (!container) return;

    let targetSegments = [];
    if (activeSegment !== 'ALL' && PLAYBOOK_DETAILS[activeSegment]) {
      targetSegments = [activeSegment];
    } else {
      targetSegments = Object.keys(PLAYBOOK_DETAILS);
    }

    container.innerHTML = targetSegments.map(seg => {
      const details = PLAYBOOK_DETAILS[seg] || {
        priority: 'steady',
        priorityLabel: 'Standard',
        strategy: 'Analisis transaksi berkala untuk mengidentifikasi perilaku belanja pelanggan.',
        channel: 'Omnichannel CRM',
        impact: 'Meningkatkan keterikatan pelanggan'
      };

      const segClass = seg.toLowerCase().replace(/[^a-z]/g, '');
      const count = allData.filter(d => d.Segment === seg).length;

      return `
        <article class="playbook-card" data-segment="${seg}">
          <div class="playbook-badge-row">
            <span class="seg-badge ${segClass}">
              <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background-color:${SEGMENT_COLORS[seg] || '#fff'}"></span>
              ${seg} (${count})
            </span>
            <span class="priority-tag ${details.priority}">${details.priorityLabel}</span>
          </div>
          <p class="playbook-strategy">${details.strategy}</p>
          <div class="playbook-metrics">
            <span>Kanal: <strong>${details.channel}</strong></span>
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted);">
            Dampak: <span style="color:var(--text-primary); font-weight:600;">${details.impact}</span>
          </div>
        </article>
      `;
    }).join('');
  }

  // --- Table Rendering, Sorting, Pagination ---
  function updateSortHeaders() {
    document.querySelectorAll('th.sortable').forEach(th => {
      th.classList.remove('sorted-asc', 'sorted-desc');
      if (th.getAttribute('data-col') === sortColumn) {
        th.classList.add(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
      }
    });
  }

  function renderTable() {
    const tbody = document.getElementById('customerTableBody');
    if (!tbody) return;

    // Sort filtered data
    const sorted = [...filteredData].sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (['Recency', 'Frequency', 'Monetary', 'R_Score', 'F_Score', 'M_Score'].includes(sortColumn)) {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    const totalRows = sorted.length;
    const totalPages = Math.ceil(totalRows / pageSize) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * pageSize;
    const pagedRows = sorted.slice(startIdx, startIdx + pageSize);

    if (pagedRows.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding:36px; color:var(--text-muted);">
            Tidak ada pelanggan yang cocok dengan pencarian / filter ini.
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = pagedRows.map(row => {
        const segClass = (row.Segment || '').toLowerCase().replace(/[^a-z]/g, '');
        return `
          <tr>
            <td><span class="cust-id">${row.customer_id}</span></td>
            <td><strong>${row.Recency}</strong> hari</td>
            <td><strong>${row.Frequency}x</strong></td>
            <td>${formatIDR(row.Monetary)}</td>
            <td><span class="score-badge score-${row.R_Score}">${row.R_Score}</span></td>
            <td><span class="score-badge score-${row.F_Score}">${row.F_Score}</span></td>
            <td><span class="score-badge score-${row.M_Score}">${row.M_Score}</span></td>
            <td><span class="seg-badge ${segClass}">${row.Segment}</span></td>
          </tr>
        `;
      }).join('');
    }

    // Update Pagination UI
    const infoElem = document.getElementById('tablePaginationInfo');
    const indicatorElem = document.getElementById('tablePageIndicator');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');

    if (infoElem) {
      const endIdx = Math.min(startIdx + pageSize, totalRows);
      infoElem.textContent = `Menampilkan ${totalRows > 0 ? startIdx + 1 : 0} – ${endIdx} dari total ${formatNumber(totalRows)} data`;
    }
    if (indicatorElem) {
      indicatorElem.textContent = `Hal ${currentPage} / ${totalPages}`;
    }
    if (prevBtn) prevBtn.disabled = (currentPage <= 1);
    if (nextBtn) nextBtn.disabled = (currentPage >= totalPages);
  }

  // --- CSV Export & Upload ---
  function exportFilteredDataToCSV() {
    if (filteredData.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'warning');
      return;
    }

    const headers = ['customer_id', 'Recency', 'Frequency', 'Monetary', 'R_Score', 'F_Score', 'M_Score', 'Segment'];
    const csvRows = [];
    csvRows.push(headers.join(','));

    filteredData.forEach(row => {
      const values = headers.map(h => {
        const val = row[h] !== undefined ? row[h] : '';
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `rfm_export_${activeSegment.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Berhasil ekspor ${filteredData.length} baris data CSV!`);
  }

  function handleUploadedFile(file) {
    if (!file.name.endsWith('.csv')) {
      showToast('Harap pilih file berformat .csv', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const text = e.target.result;
        parseAndApplyCSV(text, file.name);
      } catch (err) {
        console.error(err);
        showToast('Gagal memproses file CSV: ' + err.message, 'warning');
      }
    };
    reader.readAsText(file);
  }

  function parseAndApplyCSV(csvText, filename) {
    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      showToast('File CSV kosong atau tidak memiliki data', 'warning');
      return;
    }

    const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const parsedRows = [];

    // Check if it's already an RFM table or raw transactions
    const hasRFM = header.includes('Recency') && header.includes('Frequency') && header.includes('Monetary');
    const hasRaw = header.includes('customer_id') && (header.includes('transaction_date') || header.includes('total_amount'));

    if (hasRFM) {
      // Direct RFM Mapping
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        if (parts.length < header.length) continue;
        const row = {};
        header.forEach((h, idx) => { row[h] = parts[idx]; });

        parsedRows.push({
          customer_id: row.customer_id || `CUST-${String(i).padStart(4, '0')}`,
          Recency: parseInt(row.Recency) || 0,
          Frequency: parseInt(row.Frequency) || 1,
          Monetary: parseFloat(row.Monetary) || 0,
          R_Score: parseInt(row.R_Score) || 3,
          F_Score: parseInt(row.F_Score) || 3,
          M_Score: parseInt(row.M_Score) || 3,
          Segment: row.Segment || 'Others'
        });
      }
    } else if (hasRaw) {
      // Simple client-side RFM Calculation from transactions
      const customerMap = {};
      const refDate = new Date('2026-01-01');

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        if (parts.length < header.length) continue;
        const row = {};
        header.forEach((h, idx) => { row[h] = parts[idx]; });

        const cid = row.customer_id;
        if (!cid) continue;

        const date = new Date(row.transaction_date || '2025-01-01');
        const amount = parseFloat(row.total_amount) || 0;

        if (!customerMap[cid]) {
          customerMap[cid] = { latestDate: date, freq: 0, total: 0 };
        }
        if (date > customerMap[cid].latestDate) {
          customerMap[cid].latestDate = date;
        }
        customerMap[cid].freq += 1;
        customerMap[cid].total += amount;
      }

      for (const [cid, stats] of Object.entries(customerMap)) {
        const diffDays = Math.max(0, Math.floor((refDate - stats.latestDate) / (1000 * 60 * 60 * 24)));
        const rScore = diffDays <= 30 ? 5 : diffDays <= 60 ? 4 : diffDays <= 90 ? 3 : diffDays <= 120 ? 2 : 1;
        const fScore = stats.freq >= 7 ? 5 : stats.freq >= 5 ? 4 : stats.freq >= 3 ? 3 : stats.freq >= 2 ? 2 : 1;
        const mScore = stats.total >= 7000000 ? 5 : stats.total >= 5000000 ? 4 : stats.total >= 3000000 ? 3 : stats.total >= 1500000 ? 2 : 1;

        let seg = 'Others';
        if (rScore >= 4 && fScore >= 4) seg = 'Champions';
        else if (fScore >= 3 && mScore >= 3) seg = 'Loyal Customers';
        else if (rScore >= 3 && fScore <= 3) seg = 'Potential Loyalists';
        else if (rScore <= 2 && fScore >= 3) seg = 'At Risk';
        else if (rScore === 1 && fScore <= 2) seg = 'Hibernating';

        parsedRows.push({
          customer_id: cid,
          Recency: diffDays,
          Frequency: stats.freq,
          Monetary: stats.total,
          R_Score: rScore,
          F_Score: fScore,
          M_Score: mScore,
          Segment: seg
        });
      }
    } else {
      showToast('Header CSV tidak cocok (butuh customer_id, Recency, dll)', 'warning');
      return;
    }

    if (parsedRows.length === 0) {
      showToast('Tidak ada data valid yang bisa diekstrak dari CSV', 'warning');
      return;
    }

    allData = parsedRows;
    activeSegment = 'ALL';
    searchQuery = '';
    currentPage = 1;

    document.querySelectorAll('.pill-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-segment') === 'ALL');
    });

    const datasetBadge = document.getElementById('datasetSourceBadge');
    if (datasetBadge) datasetBadge.textContent = filename;

    const modalOverlay = document.getElementById('uploadModal');
    if (modalOverlay) modalOverlay.classList.remove('open');

    updateDashboard();
    showToast(`Berhasil memuat ${parsedRows.length} data pelanggan dari ${filename}!`);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
