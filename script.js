const rooms=[['Front Door','🚪'],['Living Room','🛋️'],['Kitchen','🍳'],['Backyard','🌳'],['Garage','🚗'],['Basement','▰'],['Office','🪑'],['Upstairs','▱'],['Primary Bedroom','🛏️'],['Side Door','🚪']];
const cats={
 Entry:[['Doorbell Camera','Entry / Camera','🚪'],['Smart Lock','Entry','🔒'],['Chime Extender','Network','▣']],
 Security:[['Outdoor Camera','Camera','📹'],['Indoor Camera','Camera','📷'],['Spotlight Pro','Camera Add-on','💡'],['Motion Detector','Security','◉']],
 Safety:[['Smoke Detector','Safety','🔥'],['Smoke / CO Combo','Safety','🚨']],
 Water:[['Water Sensor','Water Protection','💧'],['Smart Water Valve','Water Protection','🚰']],
 'Smart Home':[['Thermostat','Comfort','🌡️'],['Garage Controller','Garage','🚗'],['Lamp Module','Convenience','💡']]
};
let state=JSON.parse(localStorage.getItem('v21-state')||'{}');
if(!state.recs) state.recs={};
let currentRoom=state.currentRoom||rooms[0][0], currentCat=state.currentCat||'Entry', screenshotData=state.screenshot||'';
const $=id=>document.getElementById(id); const save=()=>{state.currentRoom=currentRoom;state.currentCat=currentCat;state.screenshot=screenshotData;localStorage.setItem('v21-state',JSON.stringify(state));};
function initFields(){['customerName','serviceNum','serviceType','date','notes'].forEach(id=>{if(state[id]) $(id).value=state[id]; $(id).oninput=()=>{state[id]=$(id).value;save();}}); if(!$('date').value) $('date').value=new Date().toISOString().slice(0,10);}
function qty(room,product){return (((state.recs||{})[room]||{})[product]||0)}
function setQty(room,product,val){if(!state.recs[room]) state.recs[room]={}; state.recs[room][product]=Math.max(0,val); if(state.recs[room][product]===0) delete state.recs[room][product]; save(); render();}
function roomCount(room){return Object.values(state.recs[room]||{}).reduce((a,b)=>a+b,0)}
function totalCount(){return rooms.reduce((a,[r])=>a+roomCount(r),0)}
function renderAreas(){ $('areaList').innerHTML=rooms.map(([r,ico])=>`<button class="area-btn ${r===currentRoom?'active':''}" data-room="${r}"><span class="ico">${ico}</span><span><b>${r}</b><small>${roomCount(r)} selected</small></span><span>›</span></button>`).join(''); document.querySelectorAll('.area-btn').forEach(b=>b.onclick=()=>{currentRoom=b.dataset.room; currentCat='Entry'; save(); render();});}
function renderTabs(){ $('tabs').innerHTML=Object.keys(cats).map(c=>`<button class="tab ${c===currentCat?'active':''}" data-cat="${c}">${iconForCat(c)} ${c}</button>`).join(''); document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{currentCat=b.dataset.cat;save();render();});}
function iconForCat(c){return {Entry:'🚪',Security:'🛡️',Safety:'🔥',Water:'💧','Smart Home':'⌂'}[c]||''}
function renderProducts(){ $('currentRoomTitle').textContent=currentRoom; $('productList').innerHTML=cats[currentCat].map(([name,sub,ico])=>`<div class="product"><div class="picon">${ico}</div><div><b>${name}</b><div class="muted">${sub}</div></div><div class="qty"><button data-d="-1" data-p="${name}">−</button><span>${qty(currentRoom,name)}</span><button class="plus" data-d="1" data-p="${name}">+</button></div></div>`).join(''); document.querySelectorAll('.qty button').forEach(b=>b.onclick=()=>setQty(currentRoom,b.dataset.p,qty(currentRoom,b.dataset.p)+Number(b.dataset.d)));}
function renderSummary(){ $('totalBadge').textContent=`${totalCount()} total`; const rows=rooms.map(([r])=>[r,state.recs[r]||{}]).filter(([r,o])=>Object.keys(o).length); if(!rows.length){$('summaryList').textContent='No recommendations added yet.';return} $('summaryList').innerHTML=rows.map(([r,o])=>`<div class="room-summary"><b>${r}</b>${Object.entries(o).map(([p,n])=>`<div class="sum-row"><span>• ${p}</span><span>x${n}</span></div>`).join('')}</div>`).join('');}
function render(){renderAreas();renderTabs();renderProducts();renderSummary();}
$('clearRoom').onclick=()=>{state.recs[currentRoom]={};save();render();};
$('resetBtn').onclick=()=>{if(confirm('Reset this walkthrough?')){localStorage.removeItem('v21-state');location.reload();}};
$('screenshot').onchange=e=>{const f=e.target.files[0]; if(!f)return; const reader=new FileReader(); reader.onload=()=>{screenshotData=reader.result; $('preview').src=screenshotData; $('preview').hidden=false; $('uploadText').hidden=true; save();}; reader.readAsDataURL(f);};
function summaryText(){let lines=[state.serviceNum||$('serviceNum').value||'Service #']; rooms.forEach(([r])=>{const o=state.recs[r]||{}; if(Object.keys(o).length){lines.push(`\n${r}`); Object.entries(o).forEach(([p,n])=>lines.push(`${p} x${n}`));}}); const notes=$('notes').value.trim(); if(notes) lines.push(`\nNotes: ${notes}`); return lines.join('\n');}
$('copySummary').onclick=async()=>{await navigator.clipboard.writeText(summaryText()); alert('Manager summary copied.');};
$('exportBackup').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='coverage-audit-backup.json'; a.click();};
$('previewReport').onclick=()=>{const name=$('customerName').value||'Customer'; const svc=$('serviceNum').value||'Service #'; const date=$('date').value; $('reportContent').innerHTML=`<h1>Walkthrough Summary</h1><p><b>Customer:</b> ${name}<br><b>Service #:</b> ${svc}<br><b>Date:</b> ${date}<br><b>Service Type:</b> ${$('serviceType').value}</p><h3>Recommended Improvements</h3><pre>${summaryText()}</pre>${$('notes').value?`<h3>Tech Notes</h3><p>${$('notes').value}</p>`:''}${screenshotData?`<h3>Panel Screenshot</h3><img src="${screenshotData}">`:''}`; $('reportDialog').showModal();};
$('closeReport').onclick=()=>$('reportDialog').close();
initFields(); if(screenshotData){$('preview').src=screenshotData;$('preview').hidden=false;$('uploadText').hidden=true;} render();
