// main.js
import { fetchRuns } from './api.js';
import { updateCharts, clearCharts } from './charts.js';
import { loadDates, filterQuickWrapper, toggleArchive } from './filters.js';
import { setupPagination } from './pagination.js';

const runsDiv = document.getElementById('runs');
const totalsEl = document.getElementById('totals');
const popup = document.getElementById('testPopup');
const dateSelect = document.getElementById('dateSelect');
const prevBtn = document.getElementById('prevPage');
const nextBtn = document.getElementById('nextPage');
const pageSizeSelect = document.getElementById('pageSize');
const pageInfo = document.getElementById('pageInfo');
const archivePanel = document.getElementById('archivePanel');
const archiveList = document.getElementById('archiveList');

let allRuns = [];
let currentPage = 1;

// Expose loadRuns globally
window.loadRuns = async function(params = {}) {
  allRuns = await fetchRuns(params);
  currentPage = 1;
  displayRuns();
};

export function displayRuns() {
  runsDiv.innerHTML = '';
  totalsEl.textContent = '';
  pageInfo.textContent = '';
  popup.innerHTML = '';

  const pageSize = parseInt(pageSizeSelect.value, 10);
  const startIdx = (currentPage - 1) * pageSize;
  const pageRuns = allRuns.slice(startIdx, startIdx + pageSize);

  if (pageRuns.length === 0) {
    runsDiv.innerHTML = '<div style="text-align:center;opacity:0.7;">No runs in this range.</div>';
    totalsEl.textContent = 'Total: 0 | Passed: 0 | Failed: 0';
    pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(allRuns.length / pageSize)}`;
    clearCharts();
    document.querySelectorAll('.run-item.selected').forEach(el => el.classList.remove('selected'));
    return;
  }

  pageRuns.forEach(run => {
    const runDiv = document.createElement('div');
    runDiv.className = 'run-item';

    const badgeOrder = ['passed','failed','skipped','flaky','timedout','unknown'];
    const badgesHtml = badgeOrder.map(status => {
      const key = Object.keys(run.stats).find(k => k.toLowerCase() === status);
      if(!key) return null;
      return `<span class="status-badge ${status}" data-status="${status}">${status.toUpperCase()}: ${run.stats[key]}</span>`;
    }).filter(Boolean).join(' ');

    const timeBadge = `<span class="status-badge time-badge">Time: ${run.totalTime || 'N/A'}</span>`;
    runDiv.innerHTML = `<div><b>${run.timestamp}</b> ${badgesHtml} ${timeBadge}</div>
                        <a href="${run.htmlReport}" target="_blank">View HTML Report</a>`;

    // Tooltip popup
    runDiv.querySelectorAll('.status-badge').forEach(badgeEl => {
      const status = badgeEl.dataset.status;
      if(!status || !run.testsByStatus) return;
      badgeEl.addEventListener('mouseenter', e => {
        const testNames = run.testsByStatus[status.toLowerCase()] || [];
        popup.innerHTML = testNames.length
          ? `<b>${status.toUpperCase()} Tests:</b><ul>${testNames.map(t=>`<li>${t}</li>`).join('')}</ul>`
          : `<b>No tests for ${status.toUpperCase()}</b>`;
        popup.style.display = 'block';
        popup.style.left = e.pageX + 10 + 'px';
        popup.style.top = e.pageY + 10 + 'px';
      });
      badgeEl.addEventListener('mouseleave', () => popup.style.display = 'none');
    });

    runDiv.addEventListener('click', () => {
      document.querySelectorAll('.run-item').forEach(el => el.classList.remove('selected'));
      runDiv.classList.add('selected');
      updateCharts(run, popup, totalsEl);
    });

    runsDiv.appendChild(runDiv);
  });

  // Select latest (first) run
  const firstRunDiv = runsDiv.querySelector('.run-item');
  if(firstRunDiv) {
    firstRunDiv.classList.add('selected');
    updateCharts(pageRuns[0], popup, totalsEl);
  }

  const totalPages = Math.ceil(allRuns.length / pageSize);
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

// Initialization
(async function init() {
  await loadDates(dateSelect, window.loadRuns);
  filterQuickWrapper('today', window.loadRuns);

  setupPagination(prevBtn, nextBtn, pageSizeSelect, displayRuns,
    () => allRuns,
    () => currentPage,
    val => { currentPage = val; },
    runsDiv
  );

  document.getElementById('archiveLink').addEventListener('click', e => {
    e.preventDefault();
    toggleArchive(archivePanel, archiveList, window.loadRuns);
  });

  window.applyCustomRange = () => {
    const start = document.getElementById('startDate').value;
    const end = document.getElementById('endDate').value;
    if(start && end) window.loadRuns({start, end});
  };

  window.filterQuick = option => filterQuickWrapper(option, window.loadRuns);
})();
