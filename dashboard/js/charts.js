let barChart = null;
let pieChart = null;

export function clearCharts() {
  if(barChart) { barChart.destroy(); barChart = null; }
  if(pieChart) { pieChart.destroy(); pieChart = null; }

  const barCanvas = document.getElementById('barChart');
  const pieCanvas = document.getElementById('pieChart');
  if(barCanvas) barCanvas.style.display = 'none';
  if(pieCanvas) pieCanvas.style.display = 'none';
}

export function updateCharts(run, popup, totalsEl) {
  if (!run) return clearCharts();

  const barCanvas = document.getElementById('barChart');
  const pieCanvas = document.getElementById('pieChart');
  if(barCanvas) barCanvas.style.display = 'block';
  if(pieCanvas) pieCanvas.style.display = 'block';

  const labels = Object.keys(run.stats);
  const data = Object.values(run.stats);
  const colors = labels.map(status => {
    switch(status.toLowerCase()) {
      case 'passed': return '#4caf50';
      case 'failed': return '#f44336';
      case 'skipped': return '#9e9e9e';
      case 'flaky': return '#ff9800';
      case 'timedout': return '#9c27b0';
      default: return '#607d8b';
    }
  });

  const total = data.reduce((a,b)=>a+b,0);
  const passed = run.stats.passed||0;
  const failed = run.stats.failed||0;
  totalsEl.textContent = `Total: ${total} | Passed: ${passed} | Failed: ${failed}`;

  const barCtx = barCanvas.getContext('2d');
  if(barChart) barChart.destroy();
  barChart = new Chart(barCtx, {
    type:'bar',
    data:{labels,datasets:[{label:`Test Status - ${run.timestamp}`,data,backgroundColor:colors}]},
    options:{
      responsive:true,
      plugins:{
        legend:{display:false},
        title:{display:true,text:`Total Tests: ${total}`},
        tooltip:{enabled:false, external: tooltipHandler(popup, run, labels)}
      },
      scales:{y:{beginAtZero:true,title:{display:true,text:'Test Count'}}, x:{title:{display:true,text:'Status'}}}
    }
  });

  const pieCtx = pieCanvas.getContext('2d');
  if(pieChart) pieChart.destroy();
  pieChart = new Chart(pieCtx, {
    type:'pie',
    data:{labels,datasets:[{label:`Test Status - ${run.timestamp}`,data,backgroundColor:colors}]},
    options:{
      responsive:true,
      plugins:{
        legend:{position:'right'},
        title:{display:true,text:`Total Tests: ${total}`},
        tooltip:{enabled:false, external: tooltipHandler(popup, run, labels)}
      }
    }
  });
}

// ✅ FIXED TOOLTIP: reliable caret + canvas + viewport clamp
function tooltipHandler(popup, run, labels) {
  return ctx => {
    const tooltip = ctx.tooltip;
    if (!tooltip.opacity) { 
      popup.style.display='none'; 
      return; 
    }

    const idx = tooltip.dataPoints[0].dataIndex;
    const status = labels[idx];
    const testNames = run.testsByStatus[status.toLowerCase()] || [];

    popup.innerHTML = testNames.length
      ? `<b>${status.toUpperCase()} Tests:</b><ul>${testNames.map(t=>`<li>${t}</li>`).join('')}</ul>`
      : `<b>No tests for ${status.toUpperCase()}</b>`;

    const canvasRect = ctx.chart.canvas.getBoundingClientRect();
    let x = canvasRect.left + tooltip.caretX + window.scrollX + 10;
    let y = canvasRect.top + tooltip.caretY + window.scrollY + 10;

    // Clamp tooltip inside viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = popup.getBoundingClientRect();
    if (x + rect.width > vw + window.scrollX) x = vw + window.scrollX - rect.width - 5;
    if (y + rect.height > vh + window.scrollY) y = vh + window.scrollY - rect.height - 5;

    popup.style.display = 'block';
    popup.style.position = 'absolute'; // page-relative
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
  };
}
