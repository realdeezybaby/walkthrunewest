const rooms=['Front Door','Living Room','Kitchen','Backyard','Garage','Basement','Office','Upstairs','Primary Bedroom','Bedroom 2','Bedroom 3','Hallway','Side Door'];
const categories={
  Entry:[
    ['Doorbell Camera Pro','Front door visibility and package protection'],
    ['Smart Lock','Remote locking and entry control'],
    ['Door / Window Sensor','Entry point protection'],
    ['Chime Extender','Better chime and doorbell coverage']
  ],
  Cameras:[
    ['Outdoor Camera Pro','Exterior video coverage'],
    ['Indoor Camera Pro','Interior video coverage'],
    ['Spotlight Pro','Camera lighting and deterrence'],
    ['Playback DVR','Continuous video playback storage']
  ],
  Sensors:[
    ['Motion Sensor','Interior motion protection'],
    ['Glass Break Sensor','Glass break detection'],
    ['Door / Window Sensor','Door and window opening detection']
  ],
  Safety:[
    ['Smoke Detector','Fire safety coverage'],
    ['Smoke / CO Combo Detector','Fire and carbon monoxide coverage'],
    ['Carbon Monoxide Detector','Carbon monoxide detection']
  ],
  Water:[
    ['Water Sensor','Leak detection'],
    ['Smart Water Valve','Automatic water shutoff protection']
  ],
  'Smart Control':[
    ['Smart Hub','Main system control panel'],
    ['Wireless Keypad','Additional arming and disarming control'],
    ['Smart Thermostat','Comfort and energy control'],
    ['Garage Door Control','Garage access control'],
    ['Smart Lighting / Lamp Module','Lighting automation'],
    ['Google Nest Smart Speaker','Voice control integration'],
    ['Nest Thermostat','Compatible thermostat integration']
  ]
};
let activeRoom=rooms[0], activeCategory='Entry', imageData='';
let selections=JSON.parse(localStorage.getItem('capSelections')||'{}');
let customer=JSON.parse(localStorage.getItem('capCustomer')||'{}');
const $=id=>document.getElementById(id);
function save(){localStorage.setItem('capSelections',JSON.stringify(selections));localStorage.setItem('capCustomer',JSON.stringify(getCustomer()));}
function getCustomer(){return {name:$('customerName').value,service:$('serviceNumber').value,type:$('serviceType').value,date:$('visitDate').value,notes:$('techNotes').value};}
function setCustomer(){ $('customerName').value=customer.name||''; $('serviceNumber').value=customer.service||''; $('serviceType').value=customer.type||''; $('visitDate').value=customer.date||new Date().toISOString().slice(0,10); $('techNotes').value=customer.notes||''; }
function roomTotal(room){return Object.values(selections[room]||{}).reduce((a,b)=>a+b,0)}
function renderRooms(){ $('roomList').innerHTML=rooms.map(r=>`<button class="room-btn ${r===activeRoom?'active':''}" data-room="${r}"><span><span class="room-name">${r}</span><span class="room-sub">${roomTotal(r)} recommendations</span></span><span>›</span></button>`).join(''); document.querySelectorAll('.room-btn').forEach(b=>b.onclick=()=>{activeRoom=b.dataset.room;activeCategory='Entry';renderAll();});}
function renderTabs(){ $('categoryTabs').innerHTML=Object.keys(categories).map(c=>`<button class="tab-btn ${c===activeCategory?'active':''}" data-cat="${c}">${c}</button>`).join(''); document.querySelectorAll('.tab-btn').forEach(b=>b.onclick=()=>{activeCategory=b.dataset.cat;renderAll();});}
function qty(name){return ((selections[activeRoom]||{})[name])||0}
function changeQty(name,delta){ if(!selections[activeRoom]) selections[activeRoom]={}; const next=Math.max(0,qty(name)+delta); if(next===0) delete selections[activeRoom][name]; else selections[activeRoom][name]=next; save(); renderAll();}
function renderProducts(){ $('activeRoomTitle').textContent=activeRoom; $('roomCount').textContent=`${roomTotal(activeRoom)} selected`; $('productList').innerHTML=categories[activeCategory].map(([name,meta])=>`<div class="product-row"><div><div class="product-title">${name}</div><div class="product-meta">${meta}</div></div><div class="qty"><button onclick="changeQty('${name.replace(/'/g,"\\'")}',-1)">−</button><span>${qty(name)}</span><button onclick="changeQty('${name.replace(/'/g,"\\'")}',1)">+</button></div></div>`).join('');}
function summaryText(grouped=true){ let out=[]; rooms.forEach(r=>{const items=Object.entries(selections[r]||{}).filter(([,v])=>v>0); if(items.length){ if(grouped) out.push(`${r}`); items.forEach(([k,v])=>out.push(`${grouped?'• ':''}${k} x${v}`)); out.push(''); }}); return out.join('\n').trim();}
function renderSummary(){ const txt=summaryText(true); $('summaryOutput').textContent=txt||'No recommendations added yet.'; $('summaryOutput').classList.toggle('empty',!txt); }
function renderReport(){ const c=getCustomer(), txt=summaryText(true).replace(/\n/g,'<br>') || 'No recommendations added yet.'; $('reportPreview').innerHTML=`<h2>Walkthrough Summary</h2><p><strong>Customer:</strong> ${c.name||'—'}<br><strong>Service #:</strong> ${c.service||'—'}<br><strong>Service Type:</strong> ${c.type||'—'}<br><strong>Date:</strong> ${c.date||'—'}</p><h3>Recommended Improvements</h3><p>${txt}</p>${c.notes?`<h3>Tech Notes</h3><p>${c.notes.replace(/\n/g,'<br>')}</p>`:''}${imageData?`<h3>Attached Panel Screenshot</h3><img src="${imageData}" alt="Attached panel screenshot" />`:''}`; $('reportCard').classList.remove('hidden');}
function renderAll(){renderRooms();renderTabs();renderProducts();renderSummary();}
['customerName','serviceNumber','serviceType','visitDate','techNotes'].forEach(id=>document.addEventListener('input',e=>{if(e.target.id===id)save()}));
$('copyManagerBtn').onclick=async()=>{const c=getCustomer(); const text=`${c.service||'Service #'}\n\nRecommended:\n\n${summaryText(false)||'No recommendations added.'}`; await navigator.clipboard.writeText(text); $('copyManagerBtn').textContent='Copied'; setTimeout(()=>$('copyManagerBtn').textContent='Copy Manager Summary',1200);};
$('previewReportBtn').onclick=renderReport; $('printReportBtn').onclick=()=>{renderReport(); setTimeout(()=>window.print(),100)}; $('resetBtn').onclick=()=>{if(confirm('Clear this walkthrough?')){selections={};imageData='';localStorage.removeItem('capSelections');renderAll();$('screenshotPreview').innerHTML='';}};
$('signalUpload').onchange=e=>{const file=e.target.files[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{imageData=reader.result; $('screenshotPreview').innerHTML=`<img src="${imageData}" alt="Attached panel screenshot preview" />`;}; reader.readAsDataURL(file);};
setCustomer(); renderAll();
