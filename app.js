/* ============================================================
   Plant Watering Calendar – app.js
   ============================================================ */

// ── Default plant definitions ──────────────────────────────
const DEFAULT_PLANTS = [
  {
    id: 'kalatea',
    name: 'קלתאה',
    emoji: '🌿',
    schedule: 'weekly-sunday',
    checkDay: 4,
    checkNote: 'השקי רק אם האדמה העליונה יבשה',
    instruction: 'השקי ביום ראשון. בדקי ביום חמישי – אם האדמה העליונה יבשה, הוסיפי מים.',
    notes: 'אוהבת אדמה לחה קלות, לא מוצפת.',
    waterDays: [0],
    everyNWeeks: 1,
  },
  {
    id: 'orchid',
    name: 'סחלב',
    emoji: '🌸',
    schedule: 'weekly-sunday',
    checkDay: null,
    checkNote: null,
    instruction: 'השקי ביום ראשון: שרי בכוס מים 10–15 דקות, ואז נקזי לגמרי.',
    notes: 'אל תשאירי מים עומדים.',
    waterDays: [0],
    everyNWeeks: 1,
  },
  {
    id: 'citrus',
    name: 'עץ הדר צעיר',
    emoji: '🍋',
    schedule: 'weekly-sunday',
    checkDay: 2,
    checkNote: 'הוסיפי מעט מים רק אם יבש',
    instruction: 'השקי ביום ראשון. בדקי ביום שלישי – הוסיפי מעט מים אם יבש.',
    notes: 'אוהב אור חזק.',
    waterDays: [0],
    everyNWeeks: 1,
  },
  {
    id: 'peperomia',
    name: 'פפרומיה',
    emoji: '🌱',
    schedule: 'weekly-sunday-if-dry',
    checkDay: null,
    checkNote: null,
    instruction: 'ביום ראשון: בדקי את שכבת האדמה העליונה – השקי רק אם יבשה.',
    notes: 'השקיה מתונה, להימנע מהשקיה יתרה.',
    waterDays: [0],
    everyNWeeks: 1,
  },
  {
    id: 'cuttings',
    name: 'ייחורים קטנים',
    emoji: '🌾',
    schedule: 'weekly-sunday',
    checkDay: 4,
    checkNote: 'השקי קלות רק אם יבש',
    instruction: 'השקי קלות ביום ראשון. בדקי ביום חמישי – השקי קלות אם יבש.',
    notes: 'שמרי על לחות קלה, לא להציף.',
    waterDays: [0],
    everyNWeeks: 1,
  },
  {
    id: 'croton',
    name: 'קרוטון',
    emoji: '🍂',
    schedule: 'weekly-sunday-if-not-wet',
    checkDay: null,
    checkNote: null,
    instruction: 'ביום ראשון: השקי רק אם האדמה אינה רטובה כבר.',
    notes: 'צריך אור חזק. לא לתת להתייבש לגמרי.',
    waterDays: [0],
    everyNWeeks: 1,
  },
  {
    id: 'zz',
    name: 'זמיוקולקס',
    emoji: '🪴',
    schedule: 'every-3-weeks',
    checkDay: null,
    checkNote: null,
    instruction: 'השקי אחת ל-3 שבועות, ביום ראשון בלבד.',
    notes: 'תני לאדמה להתייבש לחלוטין בין השקיות.',
    waterDays: [0],
    everyNWeeks: 3,
  },
  {
    id: 'crassula',
    name: 'קרסולות',
    emoji: '🌵',
    schedule: 'every-3-weeks',
    checkDay: null,
    checkNote: null,
    instruction: 'השקי אחת ל-3 שבועות, ביום ראשון בלבד.',
    notes: 'סוקולנט, מעדיפה אדמה יבשה.',
    waterDays: [0],
    everyNWeeks: 3,
  },
  {
    id: 'portulacaria',
    name: 'פורטולקריה / עץ כסף',
    emoji: '🌿',
    schedule: 'every-3-weeks',
    checkDay: null,
    checkNote: null,
    instruction: 'השקי אחת ל-3 שבועות, ביום ראשון בלבד.',
    notes: 'סוקולנט, מעדיפה אדמה יבשה.',
    waterDays: [0],
    everyNWeeks: 3,
  },
  {
    id: 'cactus',
    name: 'קקטוס',
    emoji: '🌵',
    schedule: 'every-3-weeks',
    checkDay: null,
    checkNote: null,
    instruction: 'השקי אחת ל-3 שבועות, ביום ראשון בלבד.',
    notes: 'צריך אור חזק וניקוז טוב.',
    waterDays: [0],
    everyNWeeks: 3,
  },
];

// ── Seasonal adjustment rules (keyed by plant id → season) ─
// Each entry overrides or extends the base schedule for that season.
const SEASONAL_RULES = {
  kalatea: {
    // Summer: add Tuesday watering on top of Sunday + Thursday check
    summer:     { extraTuesdayWater: true },
    // Winter: drop Thursday check (too damp, less evaporation)
    winter:     { removeCheckDay: true },
    transition: {},
  },
  orchid: {
    // Summer: keep weekly but add a mid-week moisture reminder in the label
    summer:     { midweekNote: 'בדקי לחות באמצע השבוע' },
    // Winter: water every 2 Sundays (~10 days approximation)
    winter:     { intervalWeeks: 2 },
    transition: {},
  },
  citrus: {
    // Summer: Tuesday becomes a real watering, not just a check
    summer:     { tuesdayWater: true },
    // Winter: drop Tuesday entirely – once per week is enough
    winter:     { removeCheckDay: true },
    transition: {},
  },
  peperomia: {
    // Summer: hotter soil dries faster, add a Thursday moisture check
    summer:     { addThursdayCheck: true },
    // Winter: soil stays moist longer – emphasise "only if really dry"
    winter:     { winterNote: 'השקי רק אם האדמה ממש יבשה לגמרי' },
    transition: {},
  },
  cuttings: {
    // Summer: Thursday check becomes a light water if dry
    summer:     { thursdayWater: true },
    // Winter: Sunday only, skip Thursday
    winter:     { removeCheckDay: true },
    transition: {},
  },
  croton: {
    // Summer: add Thursday check (soil dries faster in heat)
    summer:     { addThursdayCheck: true },
    winter:     {},
    transition: {},
  },
  // Low-water plants: change interval by season
  zz:           { summer: { intervalWeeks: 2 }, winter: { intervalWeeks: 4 }, transition: {} },
  crassula:     { summer: { intervalWeeks: 2 }, winter: { intervalWeeks: 4 }, transition: {} },
  portulacaria: { summer: { intervalWeeks: 2 }, winter: { intervalWeeks: 4 }, transition: {} },
  cactus:       { summer: { intervalWeeks: 2 }, winter: { intervalWeeks: 4 }, transition: {} },
};

// ── Constants ──────────────────────────────────────────────
const DAY_NAMES_HE = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
const MONTH_NAMES_HE = [
  'ינואר','פברואר','מרץ','אפריל','מאי','יוני',
  'יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'
];

const SEASON_LABELS = {
  summer:     { he: 'קיץ',       emoji: '☀️' },
  winter:     { he: 'חורף',      emoji: '🌧️' },
  transition: { he: 'עונת מעבר', emoji: '🍂' },
};

// Epoch Sunday for cycle maths (2024-01-07)
const CYCLE_EPOCH = new Date(2024, 0, 7);

// ── Season detection ───────────────────────────────────────

/** Tel-Aviv seasonal model by calendar month (1-indexed). */
function getCurrentSeason(date) {
  const m = date.getMonth() + 1;
  if (m >= 5 && m <= 9)           return 'summer';
  if (m === 11 || m === 12 || m <= 2) return 'winter';
  return 'transition'; // March, April, October
}

/**
 * Returns the active season for a given date.
 * Respects manual override stored in settings.seasonMode.
 * In 'auto' mode the season is derived from the date itself,
 * so the calendar naturally shows correct future behaviour.
 */
function getActiveSeason(date) {
  const mode = settings.seasonMode || 'auto';
  return mode === 'auto' ? getCurrentSeason(date) : mode;
}

// ── Storage helpers ────────────────────────────────────────
function loadPlants() {
  try {
    const stored = JSON.parse(localStorage.getItem('plants'));
    if (stored && stored.length) return stored;
  } catch (_) {}
  return JSON.parse(JSON.stringify(DEFAULT_PLANTS));
}
function savePlants(p) { localStorage.setItem('plants', JSON.stringify(p)); }

function loadHistory() {
  try { return JSON.parse(localStorage.getItem('history')) || {}; } catch (_) { return {}; }
}
function saveHistory(h) { localStorage.setItem('history', JSON.stringify(h)); }

function loadSettings() {
  try {
    return Object.assign(
      { notifTime: '09:00', notifEnabled: false, seasonMode: 'auto' },
      JSON.parse(localStorage.getItem('settings'))
    );
  } catch (_) {
    return { notifTime: '09:00', notifEnabled: false, seasonMode: 'auto' };
  }
}
function saveSettings(s) { localStorage.setItem('settings', JSON.stringify(s)); }

// ── State ──────────────────────────────────────────────────
let plants   = loadPlants();
let history  = loadHistory();
let settings = loadSettings();
let calYear, calMonth;
let editingPlantId    = null;
let notifTimerInterval = null;

// ── Scheduling helpers ─────────────────────────────────────

/** Returns YYYY-MM-DD string for a Date */
function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/** JS day-of-week: 0=Sun … 6=Sat */
function dow(d) { return d.getDay(); }

/** Whole weeks elapsed since CYCLE_EPOCH */
function weeksSinceEpoch(d) {
  const ms = d - CYCLE_EPOCH;
  return Math.round(ms / (7 * 24 * 3600 * 1000));
}

// ── Core scheduling logic (season-aware) ──────────────────

/**
 * Returns an array of task objects for the given date.
 * Each task: { plant, type ('water'|'check'), label, seasonal (bool) }
 * `seasonal: true` means the schedule has been adjusted for the current season.
 */
function getTasksForDate(d) {
  const day    = dow(d);
  const season = getActiveSeason(d);
  const tasks  = [];

  for (const p of plants) {
    const adj = ((SEASONAL_RULES[p.id] || {})[season]) || {};
    // A plant is "seasonally adjusted" when its rule object is non-empty
    const isAdjusted = Object.keys(adj).length > 0;

    // ── Variable-interval plants (base: every 3 weeks) ────
    if (p.everyNWeeks === 3) {
      const n = adj.intervalWeeks ?? 3;
      if (day === 0 && weeksSinceEpoch(d) % n === 0) {
        const note =
          n === 2 ? ' (קיץ – כל שבועיים)'
          : n === 4 ? ' (חורף – כל 4 שבועות)'
          : '';
        tasks.push({ plant: p, type: 'water', label: p.instruction + note, seasonal: n !== 3 });
      }
      continue;
    }

    // ── Orchid winter: every-2-weeks override ─────────────
    if (p.id === 'orchid' && adj.intervalWeeks === 2) {
      if (day === 0 && weeksSinceEpoch(d) % 2 === 0) {
        tasks.push({
          plant: p, type: 'water',
          label: p.instruction + ' (חורף – כל שבועיים)',
          seasonal: true,
        });
      }
      continue; // skip normal Sunday + non-Sunday logic
    }

    // ── Sunday: main watering for all weekly plants ────────
    if (day === 0) {
      let label    = p.instruction;
      let seasonal = isAdjusted;
      if (adj.midweekNote) label += ` — ${adj.midweekNote}`;
      if (adj.winterNote)  label += ` (${adj.winterNote})`;
      tasks.push({ plant: p, type: 'water', label, seasonal });
    }

    // ── Non-Sunday per-plant rules ─────────────────────────
    if (day !== 0) {
      switch (p.id) {

        case 'kalatea':
          // Summer: extra Tuesday watering
          if (day === 2 && adj.extraTuesdayWater) {
            tasks.push({ plant: p, type: 'water', label: 'קיץ: השקי גם ביום שלישי', seasonal: true });
          }
          // Thursday check – unless winter removed it
          if (day === 4 && !adj.removeCheckDay) {
            tasks.push({ plant: p, type: 'check', label: `בדיקה: ${p.checkNote}`, seasonal: false });
          }
          break;

        case 'citrus':
          if (day === 2) {
            if (adj.tuesdayWater) {
              // Summer: Tuesday is a real watering
              tasks.push({ plant: p, type: 'water', label: 'קיץ: השקי ביום שלישי (חום גבוה)', seasonal: true });
            } else if (!adj.removeCheckDay) {
              // Base / transition: Tuesday is a check
              tasks.push({ plant: p, type: 'check', label: `בדיקה: ${p.checkNote}`, seasonal: false });
            }
            // Winter (removeCheckDay): no Tuesday task
          }
          break;

        case 'peperomia':
          // Summer: add Thursday moisture check
          if (day === 4 && adj.addThursdayCheck) {
            tasks.push({ plant: p, type: 'check', label: 'קיץ: בדיקה קלה – הוסיפי מים אם יבש', seasonal: true });
          }
          break;

        case 'cuttings':
          if (day === 4 && !adj.removeCheckDay) {
            if (adj.thursdayWater) {
              // Summer: Thursday becomes a light watering
              tasks.push({ plant: p, type: 'water', label: 'קיץ: השקי קלות ביום חמישי אם יבש', seasonal: true });
            } else {
              // Base / transition: Thursday is a check
              tasks.push({ plant: p, type: 'check', label: `בדיקה: ${p.checkNote}`, seasonal: false });
            }
          }
          break;

        case 'croton':
          // Summer: add Thursday check
          if (day === 4 && adj.addThursdayCheck) {
            tasks.push({ plant: p, type: 'check', label: 'קיץ: בדיקה – השקי אם יבש', seasonal: true });
          }
          break;
      }
    }
  }

  return tasks;
}

// ── Hebrew date display ────────────────────────────────────
function formatDateHe(d) {
  return `יום ${DAY_NAMES_HE[dow(d)]}, ${d.getDate()} ב${MONTH_NAMES_HE[d.getMonth()]} ${d.getFullYear()}`;
}

// ── Notification helpers ───────────────────────────────────
function sendNotification(tasks) {
  if (Notification.permission !== 'granted') return;
  const names = tasks.map(t => t.plant.name).join('، ');
  new Notification('🌿 יש השקיה היום', {
    body: `צמחים: ${names}`,
    icon: './icons/icon.svg',
    tag: 'daily-water',
  });
}

function startNotifTimer() {
  if (notifTimerInterval) clearInterval(notifTimerInterval);
  notifTimerInterval = setInterval(() => {
    const s = loadSettings();
    if (!s.notifEnabled) return;
    const now  = new Date();
    const hhmm = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    if (hhmm === s.notifTime) {
      const tasks = getTasksForDate(now);
      if (tasks.length) sendNotification(tasks);
    }
  }, 60000);
}

// ── History helpers ────────────────────────────────────────
function histKey(plantId, dateStr) { return `${plantId}__${dateStr}`; }
function getStatus(plantId, dateStr) { return history[histKey(plantId, dateStr)] || null; }
function setStatus(plantId, dateStr, status) {
  history[histKey(plantId, dateStr)] = status;
  saveHistory(history);
}

// ══════════════════════════════════════════════════════════
// ── UI Rendering ──────────────────────────────────────────
// ══════════════════════════════════════════════════════════

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.nav-btn[data-screen="${id}"]`).classList.add('active');
  if (id === 'today')    renderToday();
  if (id === 'calendar') renderCalendar();
  if (id === 'plants')   renderPlants();
  if (id === 'settings') renderSettings();
}

// ── TODAY ─────────────────────────────────────────────────
function renderToday() {
  const today    = new Date();
  const todayKey = dateKey(today);
  const tasks    = getTasksForDate(today);
  const season   = getActiveSeason(today);
  const sl       = SEASON_LABELS[season];
  const isManual = (settings.seasonMode || 'auto') !== 'auto';

  document.getElementById('today-date-heb').textContent = formatDateHe(today);

  // Season indicator pill
  const pill = document.getElementById('season-indicator');
  pill.textContent = `${sl.emoji} ${sl.he}${isManual ? ' (ידני)' : ''}`;
  pill.className   = `season-pill season-pill--${season}`;

  // Reminder banner
  const banner = document.getElementById('reminder-banner');
  if (tasks.length) {
    banner.style.display = 'block';
    banner.textContent = `💧 ${tasks.length === 1 ? 'יש צמח אחד' : `יש ${tasks.length} צמחים`} להשקיה היום`;
  } else {
    banner.style.display = 'none';
  }

  const container = document.getElementById('today-tasks');
  container.innerHTML = '';

  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="empty-today">
        <span class="big-emoji">🌿</span>
        היום אין השקיה מתוכננת<br>
        <small style="font-size:0.85rem;color:#aaa;">מנוחה מהשקיה 😊</small>
      </div>`;
    return;
  }

  tasks.forEach(task => {
    const status = getStatus(task.plant.id, todayKey);
    const isDone = !!status;

    const card = document.createElement('div');
    card.className = 'card plant-card' + (isDone ? ' done' : '');

    let statusBadge = '';
    if (status === 'water') statusBadge = '<span class="status-badge status-badge--water">✓ השקיתי</span>';
    else if (status === 'skip')  statusBadge = '<span class="status-badge status-badge--skip">↷ דילגתי</span>';
    else if (status === 'check') statusBadge = '<span class="status-badge status-badge--check">✓ בדקתי</span>';

    const seasonalBadge = task.seasonal
      ? '<span class="seasonal-badge">🌡 מותאם לעונה</span>'
      : '';

    card.innerHTML = `
      <div class="plant-card-header">
        <div class="plant-name">${task.plant.emoji} ${task.plant.name}</div>
        ${seasonalBadge}
      </div>
      <div class="plant-instruction">${task.label}</div>
      <div class="plant-notes">${task.plant.notes}</div>
      ${statusBadge ? `<div style="margin-bottom:8px;">${statusBadge}</div>` : ''}
      <div class="action-btns">
        <button class="btn btn-water"  data-action="water" data-pid="${task.plant.id}">💧 השקיתי</button>
        <button class="btn btn-skip"   data-action="skip"  data-pid="${task.plant.id}">↷ דילגתי</button>
        <button class="btn btn-check"  data-action="check" data-pid="${task.plant.id}">🔍 בדקתי – לא צריך מים</button>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('.btn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      setStatus(btn.dataset.pid, todayKey, btn.dataset.action);
      renderToday();
    });
  });
}

// ── CALENDAR ──────────────────────────────────────────────
function renderCalendar() {
  const today = new Date();
  if (calYear === undefined) { calYear = today.getFullYear(); calMonth = today.getMonth(); }

  document.getElementById('cal-month-label').textContent =
    `${MONTH_NAMES_HE[calMonth]} ${calYear}`;

  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';

  ['א','ב','ג','ד','ה','ו','ש'].forEach(d => {
    const el = document.createElement('div');
    el.className = 'cal-dow';
    el.textContent = d;
    grid.appendChild(el);
  });

  const firstDay = new Date(calYear, calMonth, 1);
  const lastDay  = new Date(calYear, calMonth + 1, 0);

  for (let i = 0; i < firstDay.getDay(); i++) {
    const el = document.createElement('div');
    el.className = 'cal-cell empty';
    grid.appendChild(el);
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date  = new Date(calYear, calMonth, d);
    const tasks = getTasksForDate(date);
    const isToday = dateKey(date) === dateKey(today);

    const cell = document.createElement('div');
    cell.className = 'cal-cell' +
      (tasks.length ? ' has-tasks' : '') +
      (isToday      ? ' today'     : '');
    cell.innerHTML = `<span>${d}</span>`;

    if (tasks.length) {
      const dots = document.createElement('div');
      dots.className = 'dot-row';
      for (let i = 0; i < Math.min(tasks.length, 3); i++) {
        const dot = document.createElement('div');
        dot.className = 'cal-dot';
        dots.appendChild(dot);
      }
      cell.appendChild(dots);
      cell.addEventListener('click', () => openDayModal(date, tasks));
    }
    grid.appendChild(cell);
  }
}

function openDayModal(date, tasks) {
  document.getElementById('modal-date-title').textContent = formatDateHe(date);
  const list = document.getElementById('modal-task-list');
  list.innerHTML = '';
  const dKey = dateKey(date);

  tasks.forEach(task => {
    const status = getStatus(task.plant.id, dKey);
    let statusText = '';
    if (status === 'water') statusText = ' ✓ השקיתי';
    else if (status === 'skip')  statusText = ' ↷ דילגתי';
    else if (status === 'check') statusText = ' ✓ בדקתי';

    const item = document.createElement('div');
    item.className = 'card';
    item.style.marginBottom = '10px';
    item.innerHTML = `
      <div class="plant-card-header">
        <div class="plant-name">
          ${task.plant.emoji} ${task.plant.name}
          ${statusText ? `<span style="color:#7db88a;font-size:0.8rem;">${statusText}</span>` : ''}
        </div>
        ${task.seasonal ? '<span class="seasonal-badge">🌡 מותאם לעונה</span>' : ''}
      </div>
      <div class="plant-instruction" style="margin-top:6px;">${task.label}</div>
    `;
    list.appendChild(item);
  });

  document.getElementById('day-modal').classList.add('open');
}

// ── PLANTS ────────────────────────────────────────────────
function renderPlants() {
  const container = document.getElementById('plants-list');
  container.innerHTML = '';
  plants.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card plant-list-card';
    card.innerHTML = `
      <div class="plant-emoji">${p.emoji}</div>
      <div class="plant-info">
        <div class="plant-name">${p.name}</div>
        <span class="plant-schedule-tag">${scheduleLabel(p)}</span>
        <div class="plant-notes">${p.notes}</div>
      </div>
      <button class="edit-btn" data-pid="${p.id}" title="ערוך">✏️</button>
    `;
    container.appendChild(card);
  });
  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.pid));
  });
}

function scheduleLabel(p) {
  const season = getActiveSeason(new Date());
  const adj    = ((SEASONAL_RULES[p.id] || {})[season]) || {};

  if (p.everyNWeeks === 3) {
    const n = adj.intervalWeeks ?? 3;
    if (n === 2) return `כל שבועיים (${SEASON_LABELS.summer.emoji} קיץ)`;
    if (n === 4) return `כל 4 שבועות (${SEASON_LABELS.winter.emoji} חורף)`;
    return 'כל 3 שבועות – ראשון';
  }
  if (p.id === 'orchid' && adj.intervalWeeks === 2) return 'כל שבועיים (חורף)';
  if (p.checkDay !== null && !adj.removeCheckDay)
    return `ראשון + בדיקה ב${DAY_NAMES_HE[p.checkDay]}`;
  return 'כל ראשון';
}

// ── EDIT MODAL ────────────────────────────────────────────
function openEditModal(pid) {
  editingPlantId = pid;
  const p = plants.find(x => x.id === pid);
  if (!p) return;
  document.getElementById('edit-name').value  = p.name;
  document.getElementById('edit-notes').value = p.notes;
  document.getElementById('edit-instr').value = p.instruction;
  document.getElementById('edit-modal').classList.add('open');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('open');
  editingPlantId = null;
}

function saveEdit() {
  if (!editingPlantId) return;
  const idx = plants.findIndex(x => x.id === editingPlantId);
  if (idx === -1) return;
  plants[idx].name        = document.getElementById('edit-name').value.trim() || plants[idx].name;
  plants[idx].notes       = document.getElementById('edit-notes').value.trim();
  plants[idx].instruction = document.getElementById('edit-instr').value.trim();
  savePlants(plants);
  closeEditModal();
  renderPlants();
}

// ── SETTINGS ──────────────────────────────────────────────
function renderSettings() {
  document.getElementById('notif-time').value = settings.notifTime;
  updateNotifStatusUI();
  updateSeasonPickerUI();
}

function updateNotifStatusUI() {
  const el   = document.getElementById('notif-status');
  const perm = Notification.permission;
  if (perm === 'granted') {
    el.className  = 'notif-status granted';
    el.textContent = '✓ הרשאות התראות פעילות';
  } else if (perm === 'denied') {
    el.className  = 'notif-status denied';
    el.textContent = '✗ הרשאות נדחו בדפדפן. יש לאפשר ידנית בהגדרות הדפדפן.';
  } else {
    el.className  = 'notif-status';
    el.textContent = '';
  }
}

function updateSeasonPickerUI() {
  const mode = settings.seasonMode || 'auto';
  document.querySelectorAll('.season-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  // Show detected season when in auto mode
  const autoInfo = document.getElementById('season-auto-info');
  if (autoInfo) {
    const detected = getCurrentSeason(new Date());
    const sl       = SEASON_LABELS[detected];
    autoInfo.textContent = mode === 'auto'
      ? `עונה מזוהה כעת: ${sl.emoji} ${sl.he}`
      : '';
  }
}

function saveSeasonMode(mode) {
  settings.seasonMode = mode;
  saveSettings(settings);
  updateSeasonPickerUI();
  // Immediately refresh screens that depend on season
  renderToday();
  if (document.getElementById('screen-plants').classList.contains('active')) renderPlants();
}

function saveNotifTime() {
  settings.notifTime = document.getElementById('notif-time').value;
  saveSettings(settings);
}

async function enableNotifications() {
  if (!('Notification' in window)) { alert('הדפדפן שלך לא תומך בהתראות.'); return; }
  const perm = await Notification.requestPermission();
  settings.notifEnabled = perm === 'granted';
  saveSettings(settings);
  updateNotifStatusUI();
  if (perm === 'granted') sendNotification(getTasksForDate(new Date()));
}

function resetAll() {
  if (!confirm('האם לאפס את כל ההיסטוריה וההגדרות? לא ניתן לבטל פעולה זו.')) return;
  localStorage.removeItem('history');
  localStorage.removeItem('plants');
  localStorage.removeItem('settings');
  history  = {};
  plants   = JSON.parse(JSON.stringify(DEFAULT_PLANTS));
  settings = { notifTime: '09:00', notifEnabled: false, seasonMode: 'auto' };
  renderSettings();
  alert('הנתונים אופסו.');
}

// ── SERVICE WORKER ────────────────────────────────────────
function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./service-worker.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w.addEventListener('statechange', () => {
        if (w.state === 'installed' && navigator.serviceWorker.controller)
          document.getElementById('update-banner').classList.add('show');
      });
    });
  });
}

function applyUpdate() {
  navigator.serviceWorker.getRegistration().then(reg => {
    if (reg && reg.waiting) reg.waiting.postMessage('SKIP_WAITING');
    window.location.reload();
  });
}

// ── Bootstrap ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Bottom nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showScreen(btn.dataset.screen));
  });

  // Day modal
  document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('day-modal').classList.remove('open');
  });
  document.getElementById('day-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('day-modal'))
      document.getElementById('day-modal').classList.remove('open');
  });

  // Calendar nav
  document.getElementById('cal-prev').addEventListener('click', () => {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });
  document.getElementById('cal-next').addEventListener('click', () => {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });

  // Edit modal
  document.getElementById('edit-save').addEventListener('click', saveEdit);
  document.getElementById('edit-cancel').addEventListener('click', closeEditModal);
  document.getElementById('edit-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('edit-modal')) closeEditModal();
  });

  // Settings – notifications
  document.getElementById('btn-enable-notif').addEventListener('click', enableNotifications);
  document.getElementById('notif-time').addEventListener('change', saveNotifTime);
  document.getElementById('btn-reset').addEventListener('click', resetAll);

  // Settings – season mode picker
  document.querySelectorAll('.season-btn').forEach(btn => {
    btn.addEventListener('click', () => saveSeasonMode(btn.dataset.mode));
  });

  // Update banner
  document.getElementById('btn-apply-update').addEventListener('click', applyUpdate);

  registerSW();
  startNotifTimer();
  showScreen('today');
});
