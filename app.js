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
    checkDay: 4, // Thursday (0=Sun)
    checkNote: 'השקי רק אם האדמה העליונה יבשה',
    instruction: 'השקי ביום ראשון. בדקי ביום חמישי – אם האדמה העליונה יבשה, הוסיפי מים.',
    notes: 'אוהבת אדמה לחה קלות, לא מוצפת.',
    waterDays: [0], // Sunday=0
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
    checkDay: 2, // Tuesday
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
    checkDay: 4, // Thursday
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

// ── Constants ──────────────────────────────────────────────
const DAY_NAMES_HE = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
const MONTH_NAMES_HE = [
  'ינואר','פברואר','מרץ','אפריל','מאי','יוני',
  'יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'
];

// The "epoch" Sunday for 3-week cycle calculations (first Sunday on or after 2024-01-07)
const CYCLE_EPOCH = new Date(2024, 0, 7); // 2024-01-07 (Sunday)

// ── Storage helpers ────────────────────────────────────────
function loadPlants() {
  try {
    const stored = JSON.parse(localStorage.getItem('plants'));
    if (stored && stored.length) return stored;
  } catch (_) {}
  return JSON.parse(JSON.stringify(DEFAULT_PLANTS));
}
function savePlants(plants) {
  localStorage.setItem('plants', JSON.stringify(plants));
}
function loadHistory() {
  try { return JSON.parse(localStorage.getItem('history')) || {}; } catch (_) { return {}; }
}
function saveHistory(h) { localStorage.setItem('history', JSON.stringify(h)); }
function loadSettings() {
  try { return Object.assign({ notifTime: '09:00', notifEnabled: false }, JSON.parse(localStorage.getItem('settings'))); }
  catch (_) { return { notifTime: '09:00', notifEnabled: false }; }
}
function saveSettings(s) { localStorage.setItem('settings', JSON.stringify(s)); }

// ── State ──────────────────────────────────────────────────
let plants   = loadPlants();
let history  = loadHistory();
let settings = loadSettings();
let calYear, calMonth;
let editingPlantId = null;
let notifTimerInterval = null;

// ── Scheduling logic ───────────────────────────────────────

/** Returns YYYY-MM-DD string for a Date */
function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/** Get JS day-of-week: 0=Sun,1=Mon,...,6=Sat */
function dow(d) { return d.getDay(); }

/** How many weeks since CYCLE_EPOCH for a given Sunday */
function weeksSinceEpoch(d) {
  const ms = d - CYCLE_EPOCH;
  return Math.round(ms / (7 * 24 * 3600 * 1000));
}

/** Is date a "3-week Sunday"? */
function isTriWeeklySunday(d) {
  if (dow(d) !== 0) return false;
  const w = weeksSinceEpoch(d);
  return w >= 0 && w % 3 === 0;
}

/** Build list of tasks for a given date */
function getTasksForDate(d) {
  const day = dow(d);
  const key = dateKey(d);
  const tasks = [];

  for (const p of plants) {
    // 3-week plants: only on tri-weekly Sundays
    if (p.everyNWeeks === 3) {
      if (isTriWeeklySunday(d)) {
        tasks.push({ plant: p, type: 'water', label: p.instruction });
      }
      continue;
    }

    // Weekly plants
    if (day === 0) { // Sunday
      tasks.push({ plant: p, type: 'water', label: p.instruction });
    } else if (p.checkDay !== null && day === p.checkDay) {
      tasks.push({ plant: p, type: 'check', label: `בדיקה: ${p.checkNote}` });
    }
  }
  return tasks;
}

// ── Hebrew date display ────────────────────────────────────
function formatDateHe(d) {
  const dayName = DAY_NAMES_HE[dow(d)];
  return `יום ${dayName}, ${d.getDate()} ב${MONTH_NAMES_HE[d.getMonth()]} ${d.getFullYear()}`;
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
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    if (hhmm === s.notifTime) {
      const tasks = getTasksForDate(now);
      if (tasks.length) sendNotification(tasks);
    }
  }, 60000);
}

// ── History key helpers ────────────────────────────────────
function histKey(plantId, dateStr) { return `${plantId}__${dateStr}`; }
function getStatus(plantId, dateStr) { return history[histKey(plantId, dateStr)] || null; }
function setStatus(plantId, dateStr, status) {
  history[histKey(plantId, dateStr)] = status;
  saveHistory(history);
}

// ══════════════════════════════════════════════════════════
// ── UI Rendering ──────────────────────────────────────────
// ══════════════════════════════════════════════════════════

// ── Navigation ────────────────────────────────────────────
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
  const today = new Date();
  const todayKey = dateKey(today);
  const tasks = getTasksForDate(today);

  document.getElementById('today-date-heb').textContent = formatDateHe(today);

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
    const isDone = status === 'water' || status === 'skip' || status === 'check';

    const card = document.createElement('div');
    card.className = 'card plant-card' + (isDone ? ' done' : '');
    card.dataset.pid = task.plant.id;

    let statusBadge = '';
    if (status === 'water') statusBadge = '<span style="color:#4a7c59;font-weight:700;font-size:0.82rem;">✓ השקיתי</span>';
    else if (status === 'skip') statusBadge = '<span style="color:#aaa;font-weight:700;font-size:0.82rem;">↷ דילגתי</span>';
    else if (status === 'check') statusBadge = '<span style="color:#7db88a;font-weight:700;font-size:0.82rem;">✓ בדקתי</span>';

    card.innerHTML = `
      <div class="plant-name">${task.plant.emoji} ${task.plant.name}</div>
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

  // Bind action buttons
  container.querySelectorAll('.btn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = btn.dataset.pid;
      const action = btn.dataset.action;
      setStatus(pid, todayKey, action);
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

  // DOW headers – starting Sunday
  ['א','ב','ג','ד','ה','ו','ש'].forEach(d => {
    const el = document.createElement('div');
    el.className = 'cal-dow';
    el.textContent = d;
    grid.appendChild(el);
  });

  const firstDay = new Date(calYear, calMonth, 1);
  const lastDay  = new Date(calYear, calMonth + 1, 0);
  const startDow = firstDay.getDay(); // 0=Sun

  // Empty cells before first day
  for (let i = 0; i < startDow; i++) {
    const el = document.createElement('div');
    el.className = 'cal-cell empty';
    grid.appendChild(el);
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(calYear, calMonth, d);
    const tasks = getTasksForDate(date);
    const isToday = dateKey(date) === dateKey(today);

    const cell = document.createElement('div');
    cell.className = 'cal-cell' +
      (tasks.length ? ' has-tasks' : '') +
      (isToday ? ' today' : '');
    cell.innerHTML = `<span>${d}</span>`;

    if (tasks.length) {
      const dots = document.createElement('div');
      dots.className = 'dot-row';
      const count = Math.min(tasks.length, 3);
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('div');
        dot.className = 'cal-dot';
        dots.appendChild(dot);
      }
      cell.appendChild(dots);
    }

    if (tasks.length) {
      cell.addEventListener('click', () => openDayModal(date, tasks));
    }
    grid.appendChild(cell);
  }
}

function openDayModal(date, tasks) {
  const modal = document.getElementById('day-modal');
  const todayKey = dateKey(date);

  document.getElementById('modal-date-title').textContent = formatDateHe(date);
  const list = document.getElementById('modal-task-list');
  list.innerHTML = '';

  tasks.forEach(task => {
    const status = getStatus(task.plant.id, todayKey);
    let statusText = '';
    if (status === 'water') statusText = ' ✓ השקיתי';
    else if (status === 'skip') statusText = ' ↷ דילגתי';
    else if (status === 'check') statusText = ' ✓ בדקתי';

    const item = document.createElement('div');
    item.className = 'card';
    item.style.marginBottom = '10px';
    item.innerHTML = `
      <div class="plant-name">${task.plant.emoji} ${task.plant.name}${statusText ? `<span style="color:#7db88a;font-size:0.8rem;"> ${statusText}</span>` : ''}</div>
      <div class="plant-instruction" style="margin-top:6px;">${task.label}</div>
    `;
    list.appendChild(item);
  });

  modal.classList.add('open');
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
  if (p.everyNWeeks === 3) return 'כל 3 שבועות – ראשון';
  if (p.checkDay !== null) return `ראשון + בדיקה ב${DAY_NAMES_HE[p.checkDay]}`;
  return 'כל ראשון';
}

// ── EDIT MODAL ────────────────────────────────────────────
function openEditModal(pid) {
  editingPlantId = pid;
  const p = plants.find(x => x.id === pid);
  if (!p) return;

  document.getElementById('edit-name').value   = p.name;
  document.getElementById('edit-notes').value  = p.notes;
  document.getElementById('edit-instr').value  = p.instruction;

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
}

function updateNotifStatusUI() {
  const el = document.getElementById('notif-status');
  const perm = Notification.permission;
  if (perm === 'granted') {
    el.className = 'notif-status granted';
    el.textContent = '✓ הרשאות התראות פעילות';
  } else if (perm === 'denied') {
    el.className = 'notif-status denied';
    el.textContent = '✗ הרשאות נדחו בדפדפן. יש לאפשר ידנית בהגדרות הדפדפן.';
  } else {
    el.className = 'notif-status';
    el.textContent = '';
  }
}

async function enableNotifications() {
  if (!('Notification' in window)) {
    alert('הדפדפן שלך לא תומך בהתראות.');
    return;
  }
  const perm = await Notification.requestPermission();
  settings.notifEnabled = perm === 'granted';
  saveSettings(settings);
  updateNotifStatusUI();
  if (perm === 'granted') {
    sendNotification(getTasksForDate(new Date())); // test notification
  }
}

function saveNotifTime() {
  settings.notifTime = document.getElementById('notif-time').value;
  saveSettings(settings);
}

function resetAll() {
  if (!confirm('האם לאפס את כל ההיסטוריה וההגדרות? לא ניתן לבטל פעולה זו.')) return;
  localStorage.removeItem('history');
  localStorage.removeItem('plants');
  localStorage.removeItem('settings');
  history  = {};
  plants   = JSON.parse(JSON.stringify(DEFAULT_PLANTS));
  settings = { notifTime: '09:00', notifEnabled: false };
  renderSettings();
  alert('הנתונים אופסו.');
}

// ── SERVICE WORKER ────────────────────────────────────────
function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./service-worker.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          document.getElementById('update-banner').classList.add('show');
        }
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

  // Nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showScreen(btn.dataset.screen));
  });

  // Day modal close
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

  // Settings
  document.getElementById('btn-enable-notif').addEventListener('click', enableNotifications);
  document.getElementById('notif-time').addEventListener('change', saveNotifTime);
  document.getElementById('btn-reset').addEventListener('click', resetAll);

  // Update banner
  document.getElementById('btn-apply-update').addEventListener('click', applyUpdate);

  // Today reminder banner
  const todayTasks = getTasksForDate(new Date());
  const banner = document.getElementById('reminder-banner');
  if (todayTasks.length) {
    banner.style.display = 'block';
    banner.textContent = `💧 ${todayTasks.length === 1 ? 'יש צמח אחד' : `יש ${todayTasks.length} צמחים`} להשקיה היום`;
  } else {
    banner.style.display = 'none';
  }

  registerSW();
  startNotifTimer();
  showScreen('today');
});
