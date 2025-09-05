// filters.js
import { fetchRuns, fetchArchive } from './api.js';

export function toYMD(d) {
  const yy=d.getFullYear(), mm=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0');
  return `${yy}-${mm}-${dd}`;
}

export function startOfThisWeek(date) {
  const d=new Date(date), day=d.getDay(), diff=(day===0?-6:1-day);
  d.setDate(d.getDate()+diff); d.setHours(0,0,0,0); return d;
}

export function lastWeekRange(date){
  const thisMon=startOfThisWeek(date);
  const lastMon=new Date(thisMon);
  lastMon.setDate(thisMon.getDate()-7);
  const lastSun=new Date(thisMon);
  lastSun.setDate(thisMon.getDate()-1);
  return [lastMon,lastSun];
}

export async function loadDates(selectEl, loadRunsFn) {
  const runs = await fetchRuns();
  const uniqueDates = [...new Set(runs.map(r=>r.date||r.timestamp.slice(0,10)))].sort((a,b)=>b.localeCompare(a));
  selectEl.innerHTML='<option value="">-- Select date --</option>';
  uniqueDates.forEach(d=>{
    const opt=document.createElement('option');
    opt.value=d; opt.text=d; selectEl.appendChild(opt);
  });
  selectEl.addEventListener('change',()=>{ const v=selectEl.value; if(v) loadRunsFn({start:v,end:v}); });
}

export function filterQuickWrapper(option, loadRunsFn) {
  const today=new Date();
  let startDate,endDate;
  switch(option){
    case 'today': startDate=endDate=toYMD(today); break;
    case 'yesterday': const y=new Date(today); y.setDate(today.getDate()-1); startDate=endDate=toYMD(y); break;
    case 'thisWeek': startDate=toYMD(startOfThisWeek(today)); endDate=toYMD(today); break;
    case 'lastWeek': const [lwStart,lwEnd]=lastWeekRange(today); startDate=toYMD(lwStart); endDate=toYMD(lwEnd); break;
    default: startDate=endDate=null;
  }
  loadRunsFn((startDate && endDate) ? {start:startDate,end:endDate} : {});
}

export async function toggleArchive(panelEl, listEl, loadRunsFn){
  if(panelEl.style.display==='none'||panelEl.style.display===''){
    panelEl.style.display='block'; listEl.textContent='Loading…';
    try{
      const archiveTree=await fetchArchive();
      if(!archiveTree||!Object.keys(archiveTree).length){ listEl.innerHTML='<div style="opacity:0.7;">No archive found yet.</div>'; return; }
      let html='';
      Object.entries(archiveTree).sort((a,b)=>b[0].localeCompare(a[0])).forEach(([year,months])=>{
        html+=`<details><summary><b>${year}</b></summary>`;
        Object.entries(months).sort((a,b)=>b[0].localeCompare(a[0])).forEach(([month,days])=>{
          const visible=days.slice(0,10), hidden=days.slice(10);
          const dayLinks=visible.map(day=>`<a href="#" onclick="window.loadRuns({start:'${day}',end:'${day}'});return false;">${day.slice(8)}</a>`).join(' ');
          let monthHtml=`<details><summary>${year}-${month}</summary><div style="margin-left:15px;">${dayLinks}`;
          if(hidden.length>0){
            const moreId=`${year}-${month}-more`;
            monthHtml+=`<span id="${moreId}" style="display:none;">${hidden.map(day=>`<a href="#" onclick="window.loadRuns({start:'${day}',end:'${day}'});return false;">${day.slice(8)}</a>`).join('')}</span>`;
            monthHtml+=`<br><a href="#" onclick="document.getElementById('${moreId}').style.display='inline'; this.style.display='none'; return false;">Load more…</a>`;
          }
          monthHtml+="</div></details>"; html+=monthHtml;
        });
        html+="</details>";
      });
      listEl.innerHTML=html+`<div style="margin-top:10px;"><label>Custom Range: <input type="date" id="startDate"> <input type="date" id="endDate"><button onclick="window.applyCustomRange()">Apply</button></label></div>`;
    }catch(err){ listEl.innerHTML='<div style="color:#f44336;">Failed to load archive.</div>'; console.error(err); }
  }else panelEl.style.display='none';
}
