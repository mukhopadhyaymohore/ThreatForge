/* ── THREAT MAP CANVAS ─────────────────────────── */
const canvas = document.getElementById('threat-canvas');
const ctx    = canvas.getContext('2d');

function resize() {
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resize();
window.addEventListener('resize', resize);

// Nodes (cities on the map)
const NODES = [
  {x:0.12,y:0.38,name:'New York'},   {x:0.18,y:0.42,name:'Chicago'},
  {x:0.08,y:0.48,name:'Los Angeles'},{x:0.52,y:0.28,name:'London'},
  {x:0.55,y:0.32,name:'Paris'},      {x:0.58,y:0.26,name:'Amsterdam'},
  {x:0.62,y:0.30,name:'Berlin'},     {x:0.72,y:0.38,name:'Moscow'},
  {x:0.78,y:0.52,name:'Mumbai'},     {x:0.85,y:0.44,name:'Beijing'},
  {x:0.88,y:0.50,name:'Tokyo'},      {x:0.90,y:0.62,name:'Singapore'},
  {x:0.54,y:0.55,name:'Cairo'},      {x:0.22,y:0.65,name:'São Paulo'},
  {x:0.60,y:0.68,name:'Johannesburg'},{x:0.82,y:0.70,name:'Sydney'},
];

const SEV_COLORS = ['#ef4444','#f59e0b','#3b82f6'];

// Active attack arcs
const arcs = [];
function spawnArc() {
  const src = NODES[Math.floor(Math.random()*NODES.length)];
  let dst;
  do { dst = NODES[Math.floor(Math.random()*NODES.length)]; } while(dst===src);
  arcs.push({ src, dst, t:0, speed:0.003+Math.random()*0.004, color:SEV_COLORS[Math.floor(Math.random()*3)], alpha:1 });
}
for(let i=0;i<8;i++) spawnArc();

function drawFrame() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Grid lines (latitude/longitude feel)
  ctx.strokeStyle = 'rgba(26,34,53,0.8)';
  ctx.lineWidth = 1;
  for(let i=0;i<=10;i++){
    ctx.beginPath(); ctx.moveTo(i/10*canvas.width,0); ctx.lineTo(i/10*canvas.width,canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,i/10*canvas.height); ctx.lineTo(canvas.width,i/10*canvas.height); ctx.stroke();
  }

  // Nodes
  NODES.forEach(n => {
    const x = n.x*canvas.width, y = n.y*canvas.height;
    ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2);
    ctx.fillStyle = 'rgba(6,182,212,0.7)'; ctx.fill();
    ctx.beginPath(); ctx.arc(x,y,7,0,Math.PI*2);
    ctx.strokeStyle = 'rgba(6,182,212,0.2)'; ctx.lineWidth=1; ctx.stroke();
  });

  // Arcs
  for(let i=arcs.length-1;i>=0;i--){
    const a = arcs[i];
    a.t += a.speed;
    if(a.t>1.3){ arcs.splice(i,1); spawnArc(); continue; }

    const sx = a.src.x*canvas.width, sy = a.src.y*canvas.height;
    const dx = a.dst.x*canvas.width, dy = a.dst.y*canvas.height;
    const mx = (sx+dx)/2, my = Math.min(sy,dy) - Math.abs(dx-sx)*0.35;

    const tClamped = Math.min(a.t,1);

    // Draw trail
    ctx.beginPath();
    const steps = 40;
    for(let s=0;s<=steps;s++){
      const tt = tClamped*(s/steps);
      const bx = (1-tt)*(1-tt)*sx + 2*(1-tt)*tt*mx + tt*tt*dx;
      const by = (1-tt)*(1-tt)*sy + 2*(1-tt)*tt*my + tt*tt*dy;
      if(s===0) ctx.moveTo(bx,by); else ctx.lineTo(bx,by);
    }
    ctx.strokeStyle = a.color+'55'; ctx.lineWidth=1.5; ctx.stroke();

    // Draw head
    if(a.t<=1){
      const t2 = tClamped;
      const hx = (1-t2)*(1-t2)*sx+2*(1-t2)*t2*mx+t2*t2*dx;
      const hy = (1-t2)*(1-t2)*sy+2*(1-t2)*t2*my+t2*t2*dy;
      ctx.beginPath(); ctx.arc(hx,hy,3,0,Math.PI*2);
      ctx.fillStyle = a.color; ctx.fill();
      ctx.beginPath(); ctx.arc(hx,hy,6,0,Math.PI*2);
      ctx.strokeStyle = a.color+'66'; ctx.lineWidth=1; ctx.stroke();
    }
  }

  requestAnimationFrame(drawFrame);
}
drawFrame();

/* ── TICKER ─────────────────────────────────────── */
const TICKER_DATA = [
  {sev:'CRITICAL',cls:'ti-red',  type:'RANSOMWARE',  loc:'US-East / Finance Sector'},
  {sev:'HIGH',    cls:'ti-amber',type:'PHISHING',    loc:'EU-West / Banking'},
  {sev:'CRITICAL',cls:'ti-red',  type:'ZERO-DAY',    loc:'APAC / Telecom'},
  {sev:'HIGH',    cls:'ti-amber',type:'DDOS',         loc:'US-West / CDN Provider'},
  {sev:'MEDIUM',  cls:'ti-blue', type:'MALWARE',     loc:'IN / Healthcare'},
  {sev:'CRITICAL',cls:'ti-red',  type:'DATA BREACH', loc:'EU / E-Commerce'},
  {sev:'HIGH',    cls:'ti-amber',type:'INSIDER',     loc:'US / Defense Contractor'},
  {sev:'MEDIUM',  cls:'ti-blue', type:'PHISHING',    loc:'AU / Government'},
  {sev:'CRITICAL',cls:'ti-red',  type:'RANSOMWARE',  loc:'UK / NHS'},
  {sev:'HIGH',    cls:'ti-amber',type:'SQL INJECTION',loc:'SG / FinTech'},
];

const track = document.getElementById('ticker-track');
// Duplicate for seamless loop
[...TICKER_DATA, ...TICKER_DATA].forEach(t => {
  const item = document.createElement('div');
  item.className = 'ticker-item';
  item.innerHTML = `<span class="ti-sev ${t.cls}">[${t.sev}]</span> ${t.type} — ${t.loc}`;
  track.appendChild(item);
});

/* ── THREAT PANEL ───────────────────────────────── */
const THREAT_TYPES = ['RANSOMWARE','PHISHING','DDOS','DATA BREACH','MALWARE','ZERO-DAY','INSIDER THREAT','SOCIAL ENG'];
const LOCATIONS    = ['US-NY','UK-LON','DE-BER','IN-MUM','SG','AU-SYD','CN-BEI','BR-SAO','ZA-JHB','JP-TYO'];
const SEVS         = [['CRITICAL','sev-c'],['HIGH','sev-h'],['MEDIUM','sev-m']];

const feed = document.getElementById('tp-feed');
function addThreatEntry() {
  const type = THREAT_TYPES[Math.floor(Math.random()*THREAT_TYPES.length)];
  const loc  = LOCATIONS[Math.floor(Math.random()*LOCATIONS.length)];
  const sev  = SEVS[Math.floor(Math.random()*SEVS.length)];
  const now  = new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const entry = document.createElement('div');
  entry.className = 'tp-entry';
  entry.innerHTML = `
    <div class="tp-entry-top">
      <span class="tp-entry-type">${type}</span>
      <span class="tp-entry-sev ${sev[1]}">${sev[0]}</span>
    </div>
    <div class="tp-entry-loc">Origin: ${loc} · ${now}</div>
  `;
  feed.insertBefore(entry, feed.firstChild);
  while(feed.children.length > 12) feed.removeChild(feed.lastChild);
}
addThreatEntry();
setInterval(addThreatEntry, 2200);

/* ── COUNTERS ───────────────────────────────────── */
function animateCounter(id, target, duration=1800) {
  const el = document.getElementById(id);
  const start = performance.now();
  function update(now) {
    const p = Math.min((now-start)/duration, 1);
    const ease = 1-Math.pow(1-p,3);
    el.textContent = Math.round(ease*target);
    if(p<1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting) {
      animateCounter('c-incidents', 2847);
      animateCounter('c-phases', 5);
      animateCounter('c-types', 8);
      animateCounter('c-steps', 34);
      io.disconnect();
    }
  });
}, {threshold:0.5});
const heroEl = document.querySelector('.hero-counters');
if(heroEl) io.observe(heroEl);

/* ── SMOOTH SCROLL ──────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(a.getAttribute('href'))?.scrollIntoView({behavior:'smooth'});
  });
});