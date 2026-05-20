const API_BASE = '/api';

const input      = document.getElementById('incident-input');
const charCount  = document.getElementById('char-count');
const classBtn   = document.getElementById('classify-btn');
const genBtn     = document.getElementById('generate-btn');
const classSec   = document.getElementById('class-section');
const classRes   = document.getElementById('class-result');
const idleSt     = document.getElementById('idle-state');
const loadSt     = document.getElementById('loading-state');
const pbWrap     = document.getElementById('playbook-wrap');

/* ── SAMPLES ────────────────────────────────────── */
const SAMPLES = {
  ransomware:`Our SOC detected unusual outbound traffic from 3 Windows servers in the finance department at 2AM. Files on shared drives appear encrypted with a .locked extension. Employees are receiving ransom notes demanding 50 BTC. We are a mid-size financial firm with approximately 400 employees.`,
  phishing:`Multiple employees received a spoofed email appearing to be from our CEO requesting urgent fund transfers. At least 6 employees clicked the link and entered Microsoft 365 credentials on a fake login page. We are a small legal firm of 60 people.`,
  ddos:`Our customer-facing web application has been unreachable for 2 hours. Server logs show a massive spike in traffic from thousands of different IPs. Our ISP confirmed abnormal inbound traffic exceeding 80Gbps. We are an e-commerce platform with 200k daily users.`,
  breach:`We discovered a database containing 50,000 customer records including names, emails, and hashed passwords was publicly accessible via a misconfigured S3 bucket for approximately 3 weeks. We are a mid-size SaaS company subject to GDPR.`,
  insider:`A disgruntled employee who was recently informed of their termination has been downloading large volumes of proprietary source code and client data to personal cloud storage over the past 72 hours. We are a software consultancy with 150 employees.`,
  malware:`Our endpoint detection system flagged a suspicious process on 12 machines across the engineering department. The process is establishing persistence via registry keys and beaconing to an external C2 server every 30 minutes. We believe it's a RAT deployed via a phishing email.`,
};

document.querySelectorAll('.sample-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    input.value = SAMPLES[btn.dataset.sample] || '';
    input.dispatchEvent(new Event('input'));
  });
});

input.addEventListener('input', () => {
  const l = input.value.length;
  charCount.textContent = `${l} / 2000`;
  if(l > 2000) input.value = input.value.slice(0,2000);
});

/* ── CLASSIFY ───────────────────────────────────── */
classBtn.addEventListener('click', async () => {
  const text = input.value.trim();
  if(!text) return;
  classBtn.disabled = true; classBtn.textContent = '⏳ ANALYSING...';
  try {
    const res  = await fetch(`${API_BASE}/classify/`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({incident_text:text}),
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error);
    showClassification(data);
  } catch(e) { alert('Error: '+e.message); }
  finally { classBtn.disabled=false; classBtn.textContent='🔍 ANALYSE INCIDENT'; }
});

function showClassification(c) {
  classRes.innerHTML = `
    <div class="cr-item"><span class="cr-label">TYPE</span><span class="cr-val cv-${c.incident_type}">${c.incident_type.replace(/_/g,' ').toUpperCase()}</span></div>
    <div class="cr-item"><span class="cr-label">SEVERITY</span><span class="cr-val cv-${c.severity}">${c.severity.toUpperCase()}</span></div>
    <div class="cr-item"><span class="cr-label">ORG SIZE</span><span class="cr-val">${c.org_size.toUpperCase()}</span></div>
    <div class="cr-item"><span class="cr-label">CONFIDENCE</span><span class="cr-val">${c.confidence}%</span></div>
  `;
  classSec.style.display = 'block';
}

/* ── GENERATE ───────────────────────────────────── */
genBtn.addEventListener('click', async () => {
  const text = input.value.trim();
  if(!text) return;
  genBtn.disabled=true; genBtn.textContent='⏳ GENERATING...';
  idleSt.style.display='none';
  loadSt.style.display='flex';
  pbWrap.style.display='none';

  const steps = Array.from({length:8},(_,i)=>document.getElementById(`ll${i}`));
  let si=0;
  const st = setInterval(()=>{
    if(si>0) steps[si-1]?.classList.add('done');
    steps[si]?.classList.add('active');
    if(++si>=steps.length) clearInterval(st);
  }, 700);

  try {
    const res  = await fetch(`${API_BASE}/generate/`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({incident_text:text}),
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error);
    clearInterval(st);
    showClassification(data.classification);
    renderPlaybook(data.playbook);
  } catch(e) {
    clearInterval(st);
    loadSt.style.display='none';
    pbWrap.style.display='block';
    pbWrap.innerHTML=`<div class="error-wrap">⚠ ${e.message}</div>`;
  } finally {
    genBtn.disabled=false; genBtn.textContent='⚡ GENERATE PLAYBOOK';
    steps.forEach(s=>{s?.classList.remove('active','done');});
    steps[0]?.classList.add('active');
  }
});

/* ── RENDER ─────────────────────────────────────── */
function renderPlaybook(p) {
  loadSt.style.display='none';
  pbWrap.style.display='block';

  // Badge
  const badge = document.getElementById('pbt-badge');
  badge.textContent = `⚠ ${p.threat_level}`;
  badge.className = `pbt-badge tb-${p.threat_level}`;
  document.getElementById('pbt-sub').textContent = `Est. containment: ${p.estimated_containment_time}`;

  // Summary row
  const totalSteps = p.phases.reduce((a,ph)=>a+ph.steps.length,0);
  document.getElementById('summary-row').innerHTML = `
    <div class="sr-item"><span class="sr-label">THREAT</span><span class="sr-val">${p.threat_level}</span></div>
    <div class="sr-item"><span class="sr-label">CONTAINMENT</span><span class="sr-val">${p.estimated_containment_time}</span></div>
    <div class="sr-item"><span class="sr-label">PHASES</span><span class="sr-val">${p.phases.length}</span></div>
    <div class="sr-item"><span class="sr-label">TOTAL STEPS</span><span class="sr-val">${totalSteps}</span></div>
    <div class="sr-text">${p.incident_summary}</div>
  `;

  // Phases
  const pp = document.getElementById('panel-phases');
  pp.innerHTML = '';
  p.phases.forEach((ph,i) => {
    const b = document.createElement('div');
    b.className = 'phase-block';
    b.style.animationDelay = `${i*70}ms`;
    b.innerHTML = `
      <div class="ph-header" onclick="togglePhase(this)">
        <span class="ph-num">PHASE ${ph.phase_number}</span>
        <span class="ph-name">${ph.phase}</span>
        <span class="ph-dur">${ph.duration}</span>
        <span class="ph-toggle open">▼</span>
      </div>
      <div class="ph-obj">${ph.objective}</div>
      <div class="ph-steps">
        ${ph.steps.map(s=>`
          <div class="step-card">
            <span class="st-num">${String(s.step_number).padStart(2,'0')}</span>
            <div class="st-action">${s.action}</div>
            <p class="st-detail">${s.detail}</p>
            <div class="st-footer">
              <span class="st-owner">${s.owner}</span>
              <span class="st-pri p-${s.priority}">${s.priority}</span>
              <div class="st-tools">${(s.tools||[]).map(t=>`<span class="tool-chip">${t}</span>`).join('')}</div>
            </div>
          </div>`).join('')}
      </div>`;
    pp.appendChild(b);
  });

  // IOC
  document.getElementById('panel-ioc').innerHTML =
    (p.ioc_checklist||[]).map(i=>`<div class="ioc-item"><span class="item-icon">◆</span>${i}</div>`).join('');

  // Comms
  document.getElementById('panel-comms').innerHTML =
    (p.communication_templates||[]).map(c=>`
      <div class="comm-card">
        <div class="cc-head">
          <span class="cc-audience">→ ${c.audience}</span>
          <span class="cc-subject">${c.subject}</span>
        </div>
        <div class="cc-body">${c.body}</div>
      </div>`).join('');

  // Regulatory
  document.getElementById('panel-regulatory').innerHTML =
    (p.regulatory_considerations||[]).map(r=>`<div class="reg-item"><span class="item-icon">§</span>${r}</div>`).join('');

  // Tools
  document.getElementById('panel-tools').innerHTML =
    (p.tools_required||[]).map(t=>`<div class="tool-item"><span class="item-icon">🔧</span>${t}</div>`).join('');

  // Lessons
  document.getElementById('panel-lessons').innerHTML =
    (p.lessons_learned_prompts||[]).map(l=>`<div class="lesson-item"><span class="item-icon">?</span>${l}</div>`).join('');

  window._pb = p;
  switchTab(document.querySelector('.tab[data-tab="phases"]'));
}

/* ── TABS ───────────────────────────────────────── */
function switchTab(btn) {
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(t=>t.style.display='none');
  btn.classList.add('active');
  document.getElementById(`panel-${btn.dataset.tab}`).style.display='flex';
}

/* ── PHASE TOGGLE ───────────────────────────────── */
function togglePhase(hdr) {
  const steps  = hdr.nextElementSibling.nextElementSibling;
  const toggle = hdr.querySelector('.ph-toggle');
  const open   = toggle.classList.contains('open');
  steps.style.display = open ? 'none' : 'flex';
  toggle.classList.toggle('open', !open);
}

/* ── RESET ──────────────────────────────────────── */
function resetApp() {
  pbWrap.style.display='none';
  idleSt.style.display='flex';
  input.value='';
  charCount.textContent='0 / 2000';
  classSec.style.display='none';
}

/* ── EXPORT ─────────────────────────────────────── */
function exportJSON() {
  dl(new Blob([JSON.stringify(window._pb,null,2)],{type:'application/json'}), 'threatforge-playbook.json');
}
function exportMD() {
  const p=window._pb;
  let md=`# THREATFORGE — Incident Response Playbook\n\n**Threat Level:** ${p.threat_level}\n**Summary:** ${p.incident_summary}\n**Containment:** ${p.estimated_containment_time}\n\n`;
  p.phases.forEach(ph=>{
    md+=`## Phase ${ph.phase_number}: ${ph.phase} (${ph.duration})\n*${ph.objective}*\n\n`;
    ph.steps.forEach(s=>{
      md+=`### ${s.step_number}. ${s.action}\n${s.detail}\n- **Owner:** ${s.owner}\n- **Priority:** ${s.priority}\n`;
      if(s.tools?.length) md+=`- **Tools:** ${s.tools.join(', ')}\n`;
      md+='\n';
    });
  });
  dl(new Blob([md],{type:'text/markdown'}), 'threatforge-playbook.md');
}
function dl(blob,name) {
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click();
}