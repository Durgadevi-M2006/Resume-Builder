/* ============================================================
   ResumeForge — script.js
   All interactivity: state management, form rendering,
   resume template builders, modals, zoom, print
   ============================================================ */

/* ═══════════════════════════════════════════
   STATE
═══════════════════════════════════════════ */
let state = {
  template: 'classic',
  photoData: null,
  skills: [],
  experiences: [],
  educations: [],
  projects: [],
  certifications: [],
  achievements: [],
  languages: []
};

let zoomLevel = 0.85;

/* ID counters for dynamic entries */
let expCount  = 0;
let eduCount  = 0;
let projCount = 0;
let certCount = 0;
let achCount  = 0;
let langCount = 0;

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
window.onload = () => {
  renderExpList();
  renderEduList();
  renderProjList();
  renderCertList();
  renderAchList();
  renderLangList();
  applyZoom();
  updateResume();
};

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */

/** Escape HTML special characters to prevent XSS */
function esc(s) {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Get trimmed value from an input by id */
function g(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

/** Shorten a URL to hostname + path for display */
function shortUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname + (u.pathname !== '/' ? u.pathname : '');
  } catch {
    return url;
  }
}

/* ═══════════════════════════════════════════
   TABS
═══════════════════════════════════════════ */
function switchTab(tab, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  btn.classList.add('active');
}

/* ═══════════════════════════════════════════
   TEMPLATE SELECTION
═══════════════════════════════════════════ */
function selectTemplate(t, card) {
  state.template = t;
  document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  updateResume();
}

/* ═══════════════════════════════════════════
   ZOOM
═══════════════════════════════════════════ */
function changeZoom(delta) {
  zoomLevel = Math.max(0.4, Math.min(1.4, zoomLevel + delta));
  applyZoom();
}

function resetZoom() {
  zoomLevel = 0.85;
  applyZoom();
}

function applyZoom() {
  document.getElementById('resumeWrapper').style.transform = `scale(${zoomLevel})`;
}

/* ═══════════════════════════════════════════
   PHOTO UPLOAD
═══════════════════════════════════════════ */
function handlePhoto(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    state.photoData = ev.target.result;
    document.getElementById('photoPlaceholder').style.display = 'none';
    const prev = document.getElementById('photoPreview');
    prev.src = state.photoData;
    prev.style.display = 'block';
    updateResume();
  };
  reader.readAsDataURL(file);
}

function removePhoto() {
  state.photoData = null;
  document.getElementById('photoPlaceholder').style.display = 'block';
  const prev = document.getElementById('photoPreview');
  prev.style.display = 'none';
  prev.src = '';
  updateResume();
}

/* ═══════════════════════════════════════════
   SKILLS
═══════════════════════════════════════════ */
function addSkillOnEnter(e) {
  if (e.key === 'Enter') addSkill();
}

function addSkill() {
  const input = document.getElementById('skillInput');
  const val = input.value.trim();
  if (!val || state.skills.includes(val)) {
    input.value = '';
    return;
  }
  state.skills.push(val);
  input.value = '';
  renderSkillTags();
  updateResume();
}

function removeSkill(skill) {
  state.skills = state.skills.filter(s => s !== skill);
  renderSkillTags();
  updateResume();
}

function renderSkillTags() {
  const el = document.getElementById('skillTags');
  el.innerHTML = state.skills.map(s =>
    `<div class="skill-tag">
      ${esc(s)}
      <button onclick="removeSkill('${s.replace(/'/g, "\\'")}')">×</button>
    </div>`
  ).join('');
}

/* ═══════════════════════════════════════════
   WORK EXPERIENCE
═══════════════════════════════════════════ */
function addExp() {
  const id = ++expCount;
  state.experiences.push({ id, company: '', role: '', start: '', end: '', desc: '' });
  renderExpList();
}

function removeExp(id) {
  state.experiences = state.experiences.filter(e => e.id !== id);
  renderExpList();
  updateResume();
}

function updateExpField(id, field, val) {
  const entry = state.experiences.find(x => x.id === id);
  if (entry) { entry[field] = val; updateResume(); }
}

function renderExpList() {
  const el = document.getElementById('expList');
  if (!state.experiences.length) {
    el.innerHTML = '<div class="empty-state">No experience added yet</div>';
    updateResume();
    return;
  }
  el.innerHTML = state.experiences.map(e => `
    <div class="dynamic-item">
      <div class="dynamic-item-header">
        <span class="dynamic-item-title">💼 ${esc(e.company) || 'New Entry'}</span>
        <button class="remove-btn" onclick="removeExp(${e.id})">🗑</button>
      </div>
      <label>Company Name</label>
      <input type="text" value="${esc(e.company)}" placeholder="Google"
        oninput="updateExpField(${e.id}, 'company', this.value)">
      <label>Job Title / Role</label>
      <input type="text" value="${esc(e.role)}" placeholder="Software Engineer"
        oninput="updateExpField(${e.id}, 'role', this.value)">
      <div class="field-row">
        <div>
          <label>Start</label>
          <input type="text" value="${esc(e.start)}" placeholder="Jan 2022"
            oninput="updateExpField(${e.id}, 'start', this.value)">
        </div>
        <div>
          <label>End</label>
          <input type="text" value="${esc(e.end)}" placeholder="Present"
            oninput="updateExpField(${e.id}, 'end', this.value)">
        </div>
      </div>
      <label>Key Responsibilities / Achievements</label>
      <textarea placeholder="• Led team of 5 engineers&#10;• Improved performance by 40%..."
        oninput="updateExpField(${e.id}, 'desc', this.value)">${esc(e.desc)}</textarea>
    </div>
  `).join('');
  updateResume();
}

/* ═══════════════════════════════════════════
   EDUCATION
═══════════════════════════════════════════ */
function addEdu() {
  const id = ++eduCount;
  state.educations.push({ id, school: '', degree: '', field: '', start: '', end: '', gpa: '' });
  renderEduList();
}

function removeEdu(id) {
  state.educations = state.educations.filter(e => e.id !== id);
  renderEduList();
  updateResume();
}

function updateEduField(id, field, val) {
  const entry = state.educations.find(x => x.id === id);
  if (entry) { entry[field] = val; updateResume(); }
}

function renderEduList() {
  const el = document.getElementById('eduList');
  if (!state.educations.length) {
    el.innerHTML = '<div class="empty-state">No education added yet</div>';
    updateResume();
    return;
  }
  el.innerHTML = state.educations.map(e => `
    <div class="dynamic-item">
      <div class="dynamic-item-header">
        <span class="dynamic-item-title">🎓 ${esc(e.school) || 'New Entry'}</span>
        <button class="remove-btn" onclick="removeEdu(${e.id})">🗑</button>
      </div>
      <label>School / University</label>
      <input type="text" value="${esc(e.school)}" placeholder="MIT"
        oninput="updateEduField(${e.id}, 'school', this.value)">
      <label>Degree</label>
      <input type="text" value="${esc(e.degree)}" placeholder="Bachelor of Science"
        oninput="updateEduField(${e.id}, 'degree', this.value)">
      <label>Field of Study</label>
      <input type="text" value="${esc(e.field)}" placeholder="Computer Science"
        oninput="updateEduField(${e.id}, 'field', this.value)">
      <div class="field-row">
        <div>
          <label>Start</label>
          <input type="text" value="${esc(e.start)}" placeholder="2018"
            oninput="updateEduField(${e.id}, 'start', this.value)">
        </div>
        <div>
          <label>End / Expected</label>
          <input type="text" value="${esc(e.end)}" placeholder="2022"
            oninput="updateEduField(${e.id}, 'end', this.value)">
        </div>
      </div>
      <label>GPA (optional)</label>
      <input type="text" value="${esc(e.gpa)}" placeholder="3.9 / 4.0"
        oninput="updateEduField(${e.id}, 'gpa', this.value)">
    </div>
  `).join('');
  updateResume();
}

/* ═══════════════════════════════════════════
   PROJECTS
═══════════════════════════════════════════ */
function addProj() {
  const id = ++projCount;
  state.projects.push({ id, name: '', tech: '', link: '', desc: '' });
  renderProjList();
}

function removeProj(id) {
  state.projects = state.projects.filter(e => e.id !== id);
  renderProjList();
  updateResume();
}

function updateProjField(id, field, val) {
  const entry = state.projects.find(x => x.id === id);
  if (entry) { entry[field] = val; updateResume(); }
}

function renderProjList() {
  const el = document.getElementById('projList');
  if (!state.projects.length) {
    el.innerHTML = '<div class="empty-state">No projects added yet</div>';
    updateResume();
    return;
  }
  el.innerHTML = state.projects.map(e => `
    <div class="dynamic-item">
      <div class="dynamic-item-header">
        <span class="dynamic-item-title">🚀 ${esc(e.name) || 'New Project'}</span>
        <button class="remove-btn" onclick="removeProj(${e.id})">🗑</button>
      </div>
      <label>Project Name</label>
      <input type="text" value="${esc(e.name)}" placeholder="ResumeForge"
        oninput="updateProjField(${e.id}, 'name', this.value)">
      <label>Tech Stack</label>
      <input type="text" value="${esc(e.tech)}" placeholder="React, Node.js, PostgreSQL"
        oninput="updateProjField(${e.id}, 'tech', this.value)">
      <label>GitHub / Live URL</label>
      <input type="url" value="${esc(e.link)}" placeholder="https://github.com/..."
        oninput="updateProjField(${e.id}, 'link', this.value)">
      <label>Description</label>
      <textarea placeholder="What it does and your role..."
        oninput="updateProjField(${e.id}, 'desc', this.value)">${esc(e.desc)}</textarea>
    </div>
  `).join('');
  updateResume();
}

/* ═══════════════════════════════════════════
   CERTIFICATIONS
═══════════════════════════════════════════ */
function addCert() {
  const id = ++certCount;
  state.certifications.push({ id, name: '', issuer: '', date: '' });
  renderCertList();
}

function removeCert(id) {
  state.certifications = state.certifications.filter(e => e.id !== id);
  renderCertList();
  updateResume();
}

function updateCertField(id, field, val) {
  const entry = state.certifications.find(x => x.id === id);
  if (entry) { entry[field] = val; updateResume(); }
}

function renderCertList() {
  const el = document.getElementById('certList');
  if (!state.certifications.length) {
    el.innerHTML = '<div class="empty-state">No certifications added yet</div>';
    updateResume();
    return;
  }
  el.innerHTML = state.certifications.map(e => `
    <div class="dynamic-item">
      <div class="dynamic-item-header">
        <span class="dynamic-item-title">🏆 ${esc(e.name) || 'New Cert'}</span>
        <button class="remove-btn" onclick="removeCert(${e.id})">🗑</button>
      </div>
      <label>Certification Name</label>
      <input type="text" value="${esc(e.name)}" placeholder="AWS Certified Solutions Architect"
        oninput="updateCertField(${e.id}, 'name', this.value)">
      <div class="field-row">
        <div>
          <label>Issuing Org</label>
          <input type="text" value="${esc(e.issuer)}" placeholder="Amazon"
            oninput="updateCertField(${e.id}, 'issuer', this.value)">
        </div>
        <div>
          <label>Date</label>
          <input type="text" value="${esc(e.date)}" placeholder="Mar 2024"
            oninput="updateCertField(${e.id}, 'date', this.value)">
        </div>
      </div>
    </div>
  `).join('');
  updateResume();
}

/* ═══════════════════════════════════════════
   ACHIEVEMENTS
═══════════════════════════════════════════ */
function addAch() {
  const id = ++achCount;
  state.achievements.push({ id, title: '', desc: '' });
  renderAchList();
}

function removeAch(id) {
  state.achievements = state.achievements.filter(e => e.id !== id);
  renderAchList();
  updateResume();
}

function updateAchField(id, field, val) {
  const entry = state.achievements.find(x => x.id === id);
  if (entry) { entry[field] = val; updateResume(); }
}

function renderAchList() {
  const el = document.getElementById('achList');
  if (!state.achievements.length) {
    el.innerHTML = '<div class="empty-state">No achievements added yet</div>';
    updateResume();
    return;
  }
  el.innerHTML = state.achievements.map(e => `
    <div class="dynamic-item">
      <div class="dynamic-item-header">
        <span class="dynamic-item-title">⭐ ${esc(e.title) || 'New Achievement'}</span>
        <button class="remove-btn" onclick="removeAch(${e.id})">🗑</button>
      </div>
      <label>Achievement Title</label>
      <input type="text" value="${esc(e.title)}" placeholder="1st Place Hackathon"
        oninput="updateAchField(${e.id}, 'title', this.value)">
      <label>Description</label>
      <textarea placeholder="Brief description..."
        oninput="updateAchField(${e.id}, 'desc', this.value)">${esc(e.desc)}</textarea>
    </div>
  `).join('');
  updateResume();
}

/* ═══════════════════════════════════════════
   LANGUAGES
═══════════════════════════════════════════ */
function addLang() {
  const id = ++langCount;
  state.languages.push({ id, lang: '', level: 'Fluent' });
  renderLangList();
}

function removeLang(id) {
  state.languages = state.languages.filter(e => e.id !== id);
  renderLangList();
  updateResume();
}

function updateLangField(id, field, val) {
  const entry = state.languages.find(x => x.id === id);
  if (entry) { entry[field] = val; updateResume(); }
}

function renderLangList() {
  const el = document.getElementById('langList');
  if (!state.languages.length) {
    el.innerHTML = '<div class="empty-state">No languages added yet</div>';
    updateResume();
    return;
  }
  const levels = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic'];
  el.innerHTML = state.languages.map(e => `
    <div class="dynamic-item">
      <div class="dynamic-item-header">
        <span class="dynamic-item-title">🌐 ${esc(e.lang) || 'New Language'}</span>
        <button class="remove-btn" onclick="removeLang(${e.id})">🗑</button>
      </div>
      <div class="field-row">
        <div>
          <label>Language</label>
          <input type="text" value="${esc(e.lang)}" placeholder="Spanish"
            oninput="updateLangField(${e.id}, 'lang', this.value)">
        </div>
        <div>
          <label>Proficiency</label>
          <select onchange="updateLangField(${e.id}, 'level', this.value)">
            ${levels.map(l => `<option${e.level === l ? ' selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>
  `).join('');
  updateResume();
}

/* ═══════════════════════════════════════════
   PROGRESS BAR
═══════════════════════════════════════════ */
function updateProgress() {
  const fields = ['name', 'email', 'title', 'summary', 'linkedin', 'github'];
  let filled = fields.filter(f => g(f)).length;
  if (state.skills.length)       filled++;
  if (state.experiences.length)  filled++;
  if (state.educations.length)   filled++;
  if (state.photoData)           filled++;

  const total = fields.length + 4;
  const pct = Math.round((filled / total) * 100);
  document.getElementById('progressBar').style.width = pct + '%';
}

/* ═══════════════════════════════════════════
   SHARED RESUME BUILDERS
═══════════════════════════════════════════ */

/** Build contact info items array (shared across templates) */
function buildContactItems() {
  const items = [];
  if (g('email'))   items.push(`📧 ${esc(g('email'))}`);
  if (g('phone'))   items.push(`📱 ${esc(g('phone'))}`);
  if (g('location')) items.push(`📍 ${esc(g('location'))}`);
  if (g('website')) items.push(`🌐 <a class="r-link" href="${esc(g('website'))}">${shortUrl(g('website'))}</a>`);
  if (g('linkedin')) items.push(`in <a class="r-link" href="${esc(g('linkedin'))}">${shortUrl(g('linkedin'))}</a>`);
  if (g('github'))  items.push(`⌨ <a class="r-link" href="${esc(g('github'))}">${shortUrl(g('github'))}</a>`);
  return items;
}

/** Return <img> tag if photo is enabled and uploaded */
function buildPhotoHtml(cls) {
  const showPhoto = document.getElementById('showPhotoToggle').checked;
  if (!showPhoto || !state.photoData) return '';
  return `<img class="${cls}" src="${state.photoData}" alt="Profile Photo">`;
}

/* ═══════════════════════════════════════════
   TEMPLATE 1 — CLASSIC ELEGANCE
═══════════════════════════════════════════ */
function buildClassic() {
  const photo    = buildPhotoHtml('r-photo');
  const contacts = buildContactItems();

  const expHtml = state.experiences.map(e => `
    <div style="margin-bottom:10px">
      <div class="r-item-title">${esc(e.role)}${e.company ? ` — ${esc(e.company)}` : ''}</div>
      ${e.start || e.end ? `<div class="r-item-date">${esc(e.start)}${e.end ? ' – ' + esc(e.end) : ''}</div>` : ''}
      ${e.desc ? `<div class="r-item-desc" style="white-space:pre-line">${esc(e.desc)}</div>` : ''}
    </div>`).join('');

  const eduHtml = state.educations.map(e => `
    <div style="margin-bottom:8px">
      <div class="r-item-title">${esc(e.school)}</div>
      <div class="r-item-sub">${esc(e.degree)}${e.field ? ', ' + esc(e.field) : ''}</div>
      ${e.start || e.end ? `<div class="r-item-date">${esc(e.start)}${e.end ? ' – ' + esc(e.end) : ''}</div>` : ''}
      ${e.gpa ? `<div class="r-item-date">GPA: ${esc(e.gpa)}</div>` : ''}
    </div>`).join('');

  const projHtml = state.projects.map(e => `
    <div style="margin-bottom:10px">
      <div class="r-item-title">${esc(e.name)} ${e.link ? `<a class="r-link" href="${esc(e.link)}">↗</a>` : ''}</div>
      ${e.tech ? `<div class="r-item-sub">${esc(e.tech)}</div>` : ''}
      ${e.desc ? `<div class="r-item-desc">${esc(e.desc)}</div>` : ''}
    </div>`).join('');

  const certHtml = state.certifications.map(e =>
    `<div class="r-cert-item"><strong>${esc(e.name)}</strong>${e.issuer ? ' · ' + esc(e.issuer) : ''}${e.date ? ' · ' + esc(e.date) : ''}</div>`
  ).join('');

  const achHtml = state.achievements.map(e =>
    `<div style="margin-bottom:7px">
      <div class="r-item-title">${esc(e.title)}</div>
      ${e.desc ? `<div class="r-item-desc">${esc(e.desc)}</div>` : ''}
    </div>`
  ).join('');

  const langHtml = state.languages.map(e =>
    `<div class="r-cert-item">${esc(e.lang)} · <em>${esc(e.level)}</em></div>`
  ).join('');

  const skillHtml = state.skills.map(s => `<span class="r-skill-tag">${esc(s)}</span>`).join('');

  return `
    <div class="tpl-classic">
      <div class="r-header">
        ${photo}
        <div>
          <div class="r-name">${esc(g('name')) || 'Your Name'}</div>
          <div class="r-title">${esc(g('title')) || 'Professional Title'}</div>
          <div class="r-contact-row">
            ${contacts.map(c => `<div class="r-contact-item">${c}</div>`).join('')}
          </div>
        </div>
      </div>
      <div class="r-body">
        <div class="r-sidebar">
          ${g('summary') ? `<div class="r-section"><div class="r-section-title">Profile</div><div class="r-item-desc">${esc(g('summary'))}</div></div>` : ''}
          ${skillHtml    ? `<div class="r-section"><div class="r-section-title">Skills</div><div>${skillHtml}</div></div>` : ''}
          ${eduHtml      ? `<div class="r-section"><div class="r-section-title">Education</div>${eduHtml}</div>` : ''}
          ${certHtml     ? `<div class="r-section"><div class="r-section-title">Certifications</div>${certHtml}</div>` : ''}
          ${langHtml     ? `<div class="r-section"><div class="r-section-title">Languages</div>${langHtml}</div>` : ''}
          ${g('hobbies') ? `<div class="r-section"><div class="r-section-title">Interests</div><div class="r-item-desc">${esc(g('hobbies'))}</div></div>` : ''}
        </div>
        <div class="r-main">
          ${expHtml  ? `<div class="r-section"><div class="r-section-title">Experience</div>${expHtml}</div>` : ''}
          ${projHtml ? `<div class="r-section"><div class="r-section-title">Projects</div>${projHtml}</div>` : ''}
          ${achHtml  ? `<div class="r-section"><div class="r-section-title">Achievements</div>${achHtml}</div>` : ''}
        </div>
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════
   TEMPLATE 2 — MODERN SPLIT
═══════════════════════════════════════════ */
function buildModern() {
  const photo    = buildPhotoHtml('r-photo');
  const contacts = buildContactItems();

  const expHtml = state.experiences.map(e => `
    <div style="margin-bottom:10px">
      <div class="r-item-title">${esc(e.role)}</div>
      <div class="r-item-sub">${esc(e.company)}</div>
      ${e.start || e.end ? `<div class="r-item-date">${esc(e.start)}${e.end ? ' – ' + esc(e.end) : ''}</div>` : ''}
      ${e.desc ? `<div class="r-item-desc" style="white-space:pre-line">${esc(e.desc)}</div>` : ''}
    </div>`).join('');

  const projHtml = state.projects.map(e => `
    <div style="margin-bottom:10px">
      <div class="r-item-title">${esc(e.name)} ${e.link ? `<a class="r-link" href="${esc(e.link)}">↗</a>` : ''}</div>
      ${e.tech ? `<div class="r-item-sub">${esc(e.tech)}</div>` : ''}
      ${e.desc ? `<div class="r-item-desc">${esc(e.desc)}</div>` : ''}
    </div>`).join('');

  const achHtml = state.achievements.map(e =>
    `<div style="margin-bottom:7px">
      <div class="r-item-title">${esc(e.title)}</div>
      ${e.desc ? `<div class="r-item-desc">${esc(e.desc)}</div>` : ''}
    </div>`
  ).join('');

  const eduHtml = state.educations.map(e => `
    <div style="margin-bottom:8px">
      <div class="r-item-title">${esc(e.school)}</div>
      <div class="r-item-sub">${esc(e.degree)}</div>
      ${e.field ? `<div class="r-item-date">${esc(e.field)}</div>` : ''}
      ${e.end   ? `<div class="r-item-date">${esc(e.start)}${e.end ? ' – ' + esc(e.end) : ''}</div>` : ''}
    </div>`).join('');

  const skillHtml = state.skills.map(s => `<span class="r-skill-tag">${esc(s)}</span>`).join('');

  const certHtml = state.certifications.map(e =>
    `<div class="r-cert-item"><strong>${esc(e.name)}</strong>${e.date ? ' · ' + esc(e.date) : ''}</div>`
  ).join('');

  const langHtml = state.languages.map(e =>
    `<div class="r-cert-item">${esc(e.lang)} · <em>${esc(e.level)}</em></div>`
  ).join('');

  return `
    <div class="tpl-modern">
      <div class="r-header">
        ${photo}
        <div>
          <div class="r-name">${esc(g('name')) || 'Your Name'}</div>
          <div class="r-title">${esc(g('title')) || 'Professional Title'}</div>
          <div class="r-contact-row">
            ${contacts.map(c => `<div class="r-contact-item">${c}</div>`).join('')}
          </div>
        </div>
      </div>
      <div class="r-body">
        <div class="r-main">
          ${g('summary') ? `<div class="r-section"><div class="r-section-title">Profile</div><div class="r-item-desc">${esc(g('summary'))}</div></div>` : ''}
          ${expHtml  ? `<div class="r-section"><div class="r-section-title">Work Experience</div>${expHtml}</div>` : ''}
          ${projHtml ? `<div class="r-section"><div class="r-section-title">Projects</div>${projHtml}</div>` : ''}
          ${achHtml  ? `<div class="r-section"><div class="r-section-title">Achievements</div>${achHtml}</div>` : ''}
        </div>
        <div class="r-sidebar">
          ${skillHtml    ? `<div class="r-section"><div class="r-section-title">Skills</div><div>${skillHtml}</div></div>` : ''}
          ${eduHtml      ? `<div class="r-section"><div class="r-section-title">Education</div>${eduHtml}</div>` : ''}
          ${certHtml     ? `<div class="r-section"><div class="r-section-title">Certs</div>${certHtml}</div>` : ''}
          ${langHtml     ? `<div class="r-section"><div class="r-section-title">Languages</div>${langHtml}</div>` : ''}
          ${g('hobbies') ? `<div class="r-section"><div class="r-section-title">Interests</div><div class="r-item-desc">${esc(g('hobbies'))}</div></div>` : ''}
        </div>
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════
   TEMPLATE 3 — MINIMAL PRO
═══════════════════════════════════════════ */
function buildMinimal() {
  const photo    = buildPhotoHtml('r-photo');
  const contacts = buildContactItems();

  /** Helper: wrap a titled section in the minimal two-column grid row */
  const section = (title, body) => body ? `
    <div class="r-section">
      <div class="r-section-title">${title}</div>
      <div class="r-section-body">${body}</div>
    </div>` : '';

  const expHtml = state.experiences.map(e => `
    <div class="r-item">
      <div class="r-item-title">${esc(e.role)}${e.company ? ' @ ' + esc(e.company) : ''}</div>
      ${e.start || e.end ? `<div class="r-item-date">${esc(e.start)}${e.end ? ' – ' + esc(e.end) : ''}</div>` : ''}
      ${e.desc ? `<div class="r-item-desc" style="white-space:pre-line">${esc(e.desc)}</div>` : ''}
    </div>`).join('');

  const eduHtml = state.educations.map(e => `
    <div class="r-item">
      <div class="r-item-title">${esc(e.school)}</div>
      <div class="r-item-sub">${esc(e.degree)}${e.field ? ', ' + esc(e.field) : ''}</div>
      ${e.end ? `<div class="r-item-date">${esc(e.start) || ''}${e.end ? ' – ' + esc(e.end) : ''}</div>` : ''}
    </div>`).join('');

  const projHtml = state.projects.map(e => `
    <div class="r-item">
      <div class="r-item-title">${esc(e.name)} ${e.link ? `<a class="r-link" href="${esc(e.link)}">↗</a>` : ''}</div>
      ${e.tech ? `<div class="r-item-sub">${esc(e.tech)}</div>` : ''}
      ${e.desc ? `<div class="r-item-desc">${esc(e.desc)}</div>` : ''}
    </div>`).join('');

  const certHtml = state.certifications.map(e =>
    `<div class="r-cert-item">${esc(e.name)}${e.issuer ? ' · ' + esc(e.issuer) : ''}${e.date ? ' · ' + esc(e.date) : ''}</div>`
  ).join('');

  const achHtml = state.achievements.map(e => `
    <div class="r-item">
      <div class="r-item-title">${esc(e.title)}</div>
      ${e.desc ? `<div class="r-item-desc">${esc(e.desc)}</div>` : ''}
    </div>`).join('');

  const skillHtml = state.skills.map(s => `<span class="r-skill-tag">${esc(s)}</span>`).join('');
  const langHtml  = state.languages.map(e => `<span class="r-skill-tag">${esc(e.lang)} · ${esc(e.level)}</span>`).join('');

  return `
    <div class="tpl-minimal">
      <div class="r-header">
        ${photo}
        <div>
          <div class="r-name">${esc(g('name')) || 'Your Name'}</div>
          <div class="r-title">${esc(g('title')) || ''}</div>
          <div class="r-contact-row">
            ${contacts.map(c => `<div class="r-contact-item">${c}</div>`).join('')}
          </div>
        </div>
      </div>
      <div class="r-body">
        ${section('PROFILE',        g('summary') ? `<div class="r-item-desc">${esc(g('summary'))}</div>` : '')}
        ${section('EXPERIENCE',     expHtml)}
        ${section('EDUCATION',      eduHtml)}
        ${section('PROJECTS',       projHtml)}
        ${section('SKILLS',         skillHtml ? `<div>${skillHtml}</div>` : '')}
        ${section('CERTIFICATIONS', certHtml)}
        ${section('ACHIEVEMENTS',   achHtml)}
        ${section('LANGUAGES',      langHtml ? `<div>${langHtml}</div>` : '')}
        ${section('INTERESTS',      g('hobbies') ? `<div class="r-item-desc">${esc(g('hobbies'))}</div>` : '')}
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════
   TEMPLATE 4 — BOLD EXECUTIVE
═══════════════════════════════════════════ */
function buildBold() {
  const showPhoto = document.getElementById('showPhotoToggle').checked;
  const contacts  = buildContactItems();

  const expHtml = state.experiences.map(e => `
    <div class="r-item">
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <div class="r-item-title">${esc(e.role)}</div>
        ${e.start || e.end ? `<div class="r-item-date">${esc(e.start)}${e.end ? ' – ' + esc(e.end) : ''}</div>` : ''}
      </div>
      <div class="r-item-sub">${esc(e.company)}</div>
      ${e.desc ? `<div class="r-item-desc" style="white-space:pre-line">${esc(e.desc)}</div>` : ''}
    </div>`).join('');

  const eduHtml = state.educations.map(e => `
    <div class="r-item">
      <div style="display:flex;justify-content:space-between">
        <div class="r-item-title">${esc(e.school)}</div>
        ${e.end ? `<div class="r-item-date">${esc(e.end)}</div>` : ''}
      </div>
      <div class="r-item-sub">${esc(e.degree)}${e.field ? ', ' + esc(e.field) : ''}</div>
    </div>`).join('');

  const projHtml = state.projects.map(e => `
    <div class="r-item">
      <div class="r-item-title">${esc(e.name)} ${e.link ? `<a class="r-link" href="${esc(e.link)}">↗</a>` : ''}</div>
      ${e.tech ? `<div class="r-item-sub">${esc(e.tech)}</div>` : ''}
      ${e.desc ? `<div class="r-item-desc">${esc(e.desc)}</div>` : ''}
    </div>`).join('');

  const certHtml = state.certifications.map(e =>
    `<div class="r-cert-item"><div class="r-cert-dot"></div>${esc(e.name)}${e.date ? ' · ' + esc(e.date) : ''}</div>`
  ).join('');

  const achHtml = state.achievements.map(e =>
    `<div class="r-cert-item">
      <div class="r-cert-dot"></div>
      <div><strong>${esc(e.title)}</strong>${e.desc ? ' — ' + esc(e.desc) : ''}</div>
    </div>`
  ).join('');

  const skillHtml = state.skills.map(s => `<span class="r-skill-tag">${esc(s)}</span>`).join('');
  const langHtml  = state.languages.map(e => `<span class="r-skill-tag">${esc(e.lang)}: ${esc(e.level)}</span>`).join('');

  const photoCol = showPhoto && state.photoData
    ? `<div class="r-header-photo-col"><img class="r-photo" src="${state.photoData}" alt="Photo"></div>`
    : '';

  return `
    <div class="tpl-bold">
      <div class="r-header">
        ${photoCol}
        <div class="r-header-text">
          <div class="r-name">${esc(g('name')) || 'Your Name'}</div>
          <div class="r-title">${esc(g('title')) || 'Professional Title'}</div>
          <div class="r-contact-row">
            ${contacts.map(c => `<div class="r-contact-item">${c}</div>`).join('')}
          </div>
        </div>
      </div>
      <div class="r-body">
        ${g('summary') ? `<div class="r-section"><div class="r-section-title">Profile</div><div class="r-item-desc">${esc(g('summary'))}</div></div>` : ''}
        <div class="r-two-col">
          <div>
            ${expHtml  ? `<div class="r-section"><div class="r-section-title">Experience</div>${expHtml}</div>` : ''}
            ${projHtml ? `<div class="r-section"><div class="r-section-title">Projects</div>${projHtml}</div>` : ''}
          </div>
          <div>
            ${eduHtml      ? `<div class="r-section"><div class="r-section-title">Education</div>${eduHtml}</div>` : ''}
            ${skillHtml    ? `<div class="r-section"><div class="r-section-title">Skills</div><div>${skillHtml}</div></div>` : ''}
            ${langHtml     ? `<div class="r-section"><div class="r-section-title">Languages</div><div>${langHtml}</div></div>` : ''}
            ${certHtml     ? `<div class="r-section"><div class="r-section-title">Certifications</div>${certHtml}</div>` : ''}
            ${achHtml      ? `<div class="r-section"><div class="r-section-title">Achievements</div>${achHtml}</div>` : ''}
            ${g('hobbies') ? `<div class="r-section"><div class="r-section-title">Interests</div><div class="r-item-desc">${esc(g('hobbies'))}</div></div>` : ''}
          </div>
        </div>
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════
   MAIN RESUME UPDATER
═══════════════════════════════════════════ */
function updateResume() {
  updateProgress();

  const builders = {
    classic: buildClassic,
    modern:  buildModern,
    minimal: buildMinimal,
    bold:    buildBold
  };

  const buildFn = builders[state.template] || buildClassic;
  document.getElementById('resumeOutput').innerHTML = buildFn();
}

/* ═══════════════════════════════════════════
   DOWNLOAD MODAL
═══════════════════════════════════════════ */
function openDownloadModal() {
  document.getElementById('downloadModal').classList.add('open');
}

function closeDownloadModal() {
  document.getElementById('downloadModal').classList.remove('open');
}

function closeModal(e) {
  if (e.target === document.getElementById('downloadModal')) {
    closeDownloadModal();
  }
}

function printResume() {
  closeDownloadModal();
  window.print();
}

/* ═══════════════════════════════════════════
   CLEAR ALL
═══════════════════════════════════════════ */
function clearForm() {
  if (!confirm('Clear all resume data? This cannot be undone.')) return;

  /* Clear all text inputs and textareas */
  document.querySelectorAll(
    'input[type=text], input[type=email], input[type=url], input[type=tel], textarea'
  ).forEach(el => el.value = '');

  /* Reset state */
  state.skills         = [];
  state.experiences    = [];
  state.educations     = [];
  state.projects       = [];
  state.certifications = [];
  state.achievements   = [];
  state.languages      = [];
  state.photoData      = null;

  /* Reset counters */
  expCount = eduCount = projCount = certCount = achCount = langCount = 0;

  /* Re-render all sections */
  renderSkillTags();
  renderExpList();
  renderEduList();
  renderProjList();
  renderCertList();
  renderAchList();
  renderLangList();
  removePhoto();
  updateResume();
}
