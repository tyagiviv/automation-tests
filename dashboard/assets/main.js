let barChart = null;
let pieChart = null;
let allRuns = [];
let currentPage = 1;
let pageSize = 10;

function toYMD(d){ const yy=d.getFullYear(); const mm=String(d.getMonth()+1).padStart(2,'0'); const dd=String(d.getDate()).padStart(2,'0'); return `${yy}-${mm}-${dd}`; }
function startOfThisWeek(date){ const d=new Date(date); const day=d.getDay(); const diff=(day===0?-6:1-day); d.setDate(d.getDate()+diff); d.setHours(0,0,0,0); return d; }
function lastWeekRange(date){ const thisMon=startOfThisWeek(date); const lastMon=new Date(thisMon); lastMon.setDate(thisMon.getDate()-7); const lastSun=new Date(thisMon); lastSun.setDate(thisMon.getDate()-1); return [lastMon,lastSun]; }

async function loadRuns(params={}){ 
  const qs=new URLSearchParams(params).toString(); 
  const url=qs?`/api/runs?${qs}`:'/api/runs'; 
  const res=await fetch(url); 
  allRuns=await res.json(); 
  currentPage=1; 
  displayRuns(); 
}

function displayRuns(){
  const runsDiv=document.getElementById('runs');
  runsDiv.innerHTML='';
  if(!allRuns.length){ runsDiv.innerHTML='<div style="text-align:center;opacity:0.7;">No runs in this range.</div>'; document.getElementById('totals').textContent='Total: 0 | Passed: 0 | Failed: 0'; document.getElementById('pageInfo').textContent=''; return; }

  const startIdx=(currentPage-1)*pageSize;
  const pageRuns=allRuns.slice(startIdx,startIdx+pageSize);

  pageRuns.forEach((run,index)=>{
    const runDiv=document.createElement('div');
    runDiv.className='run-item';
    const badgeOrder=['passed','failed','skipped','flaky','timedout','unknown'];
    const badgesHtml=badgeOrder.map(status=>{ const key=Object.keys(run.stats).find(k=>k.toLowerCase()===status); if(!key)return null; return `<span class="status-badge ${status}" data-status="${status}">${status.toUpperCase()}: ${run.stats[key]}</span>`; }).filter(Boolean).join(' ');
    const timeBadge=`<span class="status-badge time-badge">Time: ${run.totalTime||'N/A'}</span>`;
    runDiv.innerHTML=`<div><b>${run.timestamp}</b> ${badgesHtml} ${timeBadge}</div><a href="${run.htmlReport}" target="_blank">View HTML Report</a>`;

    const popup=document.getElementById('testPopup');
    runDiv.querySelectorAll('.status-badge').forEach(badgeEl=>{
      const status=badgeEl.dataset.status;
      if(!status || !run.testsByStatus) return;
      badgeEl.addEventListener('mouseenter',e=>{
        const testNames=run.testsByStatus[status.toLowerCase()]||[];
        popup.innerHTML=testNames.length?`<b>${status.toUpperCase()} Tests:</b><ul>${testNames.map(t=>`<li>${t||'Unnamed Test'}</li>`).join('')}</ul>`:`<b>No tests for ${status.toUpperCase()}</b>`;
        popup.style.display='block';
        popup.style.left=e.pageX+10+'px';
        popup.style.top=e.pageY+10+'px';
      });
      badgeEl.addEventListener('mouseleave',()=>popup.style.display='none');
    });

    runDiv.addEventListener('click',()=>{ document.querySelectorAll('.run-item').forEach(el=>el.classList.remove('selected')); runDiv.classList.add('selected'); updateCharts(run); });

    runsDiv.appendChild(runDiv);
    if(index===0){ runDiv.classList.add('selected'); updateCharts(run); }
  });

  const totalPages=Math.ceil(allRuns.length/pageSize);
  document.getElementById('pageInfo').textContent=`Page ${currentPage} of ${totalPages}`;
  document.getElementById('prevPage').disabled=currentPage===1;
  document.getElementById('nextPage').disabled=currentPage===totalPages;
}

function updateCharts(run){
  const labels=Object.keys(run.stats);
  const data=Object.values(run.stats);
  const colors=labels.map(s=>{switch(s.toLowerCase()){case 'passed': return '#4caf50'; case 'failed': return '#f44336'; case 'skipped': return '#9e9e9e'; case 'flaky': return '#ff9800'; case 'timedout': return '#9c27b0'; default: return '#607d8b';}});
  const total=data.reduce((a,b)=>a+b,0);
  const passed=run.stats.passed||0;
  const failed=run.stats.failed||0;
  document.getElementById('totals').textContent=`Total: ${total} | Passed: ${passed} | Failed: ${failed}`;
  const popup=document.getElementById('testPopup');

  const barCtx=document.getElementById('barChart').getContext('2d');
  if(barChart) { barChart.data.labels=labels; barChart.data.datasets[0].data=data; barChart.data.datasets[0].backgroundColor=colors; barChart.data.datasets[0].label=`Test Status - ${run.timestamp}`; barChart.options.plugins.title.text=`Total Tests: ${total}`; barChart.update(); }
  else { barChart=new Chart(barCtx,{type:'bar',data:{labels,datasets:[{label:`Test Status - ${run.timestamp}`,data,backgroundColor:colors}]},options:{responsive:true,plugins:{legend:{display:false},title:{display:true,text:`Total Tests: ${total}`},tooltip:{enabled:false,external:customTooltip}},scales:{y:{beginAtZero:true,title:{display:true,text:'Test Count'}},x:{title:{display:true,text:'Status'}}}}}); }

  const pieCtx=document.getElementById('pieChart').getContext('2d');
  if(pieChart) { pieChart.data.labels=labels; pieChart.data.datasets[0].data=data; pieChart.data.datasets[0].backgroundColor=colors; pieChart.data.datasets[0].label=`Test Status - ${run.timestamp}`; pieChart.options.plugins.title.text=`Total Tests: ${total}`; pieChart.update(); }
  else { pieChart=new Chart(pieCtx,{type:'pie',data:{labels,datasets:[{label:`Test Status - ${run.timestamp}`,data,backgroundColor:colors}]},options:{responsive:true,plugins:{legend:{position:'right'},title:{display:true,text:`Total Tests: ${total}`},tooltip:{enabled:false,external:customTooltip}}}}); }

  function customTooltip(ctx){ const tooltip=ctx.tooltip; if(!tooltip.opacity){ popup.style.display='none'; return; } const idx=tooltip.dataPoints[0].dataIndex; const status=labels[idx]; const names=run.testsByStatus[status.toLowerCase()]||[]; popup.innerHTML=names.length?`<b>${status.toUpperCase()} Tests:</b><ul>${names.map(t=>`<li>${t||'Unnamed Test'}</li>`).join('')}</ul>`:`<b>No tests for ${status.toUpperCase()}</b>`; const rect=ctx.chart.canvas.getBoundingClientRect(); popup.style.left=rect.left+tooltip.caretX+10+'px'; popup.style.top=rect.top+tooltip.caretY+10+'px'; }
}

// ... add loadDates, filterQuick, pagination, archive logic like before ...
