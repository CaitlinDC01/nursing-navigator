const studentName = "Shonda";
let pendingImports = [];

const starterState = {
  focus: [
    { text: "Read Fundamentals Chapter 6", done: false },
    { text: "Review infection control notes", done: false },
    { text: "Practice 15 dosage math questions", done: false },
    { text: "Make flashcards from today's lecture", done: false }
  ],
  assignments: [
    { title: "Fundamentals Reading Notes", course: "Fundamentals", due: "2026-07-10" },
    { title: "A&P Lab Review", course: "Anatomy & Physiology", due: "2026-07-11" },
    { title: "Medical Terms Quiz Prep", course: "Medical Terminology", due: "2026-07-12" }
  ],
  examChecklist: [
    { text: "Review class notes", done: false },
    { text: "Complete study guide", done: false },
    { text: "Practice 50 questions", done: false },
    { text: "Reteach weak topics out loud", done: false },
    { text: "Make a one-page brain dump", done: false }
  ],
  notes: [
    { title: "Osmosis", body: "Water moves from low solute concentration to high solute concentration. Think: water follows salt.", date: "2026-07-08" },
    { title: "Priority thinking", body: "When in doubt: airway, breathing, circulation, safety, then the nursing process.", date: "2026-07-08" }
  ],
  prayers: [
    { text: "Lord, give me wisdom, focus, and peace as I begin this nursing school journey. Help me learn what I need to learn and become the nurse You are preparing me to be.", date: "2026-07-08", pinned: true }
  ]
};

const courses = [
  {
    name: "Fundamentals",
    icon: "🩺",
    desc: "Safety, infection control, vitals, nursing process, communication.",
    exam: "Fundamentals Exam 1 in 8 days",
    priorities: ["Infection control", "Vital signs", "Patient safety", "Nursing process", "Therapeutic communication"]
  },
  {
    name: "Anatomy & Physiology",
    icon: "🫀",
    desc: "Body systems, structure, function, and key vocabulary.",
    exam: "Body Systems Quiz this Friday",
    priorities: ["Cardiovascular basics", "Respiratory system", "Cell transport", "Muscle tissue", "Directional terms"]
  },
  {
    name: "Pharmacology",
    icon: "💊",
    desc: "Med classes, safety checks, effects, side effects, and patient teaching.",
    exam: "Drug suffix check next week",
    priorities: ["Rights of medication administration", "High-alert meds", "Common suffixes", "Side effects", "Patient education"]
  },
  {
    name: "Medical Terminology",
    icon: "🔤",
    desc: "Prefixes, suffixes, roots, abbreviations, and pronunciation.",
    exam: "Weekly terms quiz",
    priorities: ["Common prefixes", "Common suffixes", "Abbreviations", "Directional terms", "Body system vocabulary"]
  }
];

const flashcards = [
  { q: "Normal sodium level?", a: "135–145 mEq/L" },
  { q: "What does ABC stand for in priority setting?", a: "Airway, Breathing, Circulation" },
  { q: "What is the first step of the nursing process?", a: "Assessment" },
  { q: "What does PRN mean?", a: "As needed" },
  { q: "What is the main goal of hand hygiene?", a: "Reduce transmission of microorganisms" },
  { q: "What does tachycardia mean?", a: "Heart rate faster than normal" }
];

let state = loadState();
let currentCard = 0;
let cardFlipped = false;

function loadState() {
  const saved = localStorage.getItem("nursingNavigatorState");
  const loaded = saved ? JSON.parse(saved) : structuredClone(starterState);
  if (!loaded.prayers) loaded.prayers = structuredClone(starterState.prayers);
  return loaded;
}

function saveState() {
  localStorage.setItem("nursingNavigatorState", JSON.stringify(state));
}

function formatDate(dateString) {
  const date = new Date(dateString + "T12:00:00");
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function setDateLine() {
  document.getElementById("todayDate").textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  });
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showView(viewId) {
  document.querySelectorAll(".view").forEach(view => view.classList.toggle("active-view", view.id === viewId));
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.view === viewId));
  const titles = { dashboard: "Dashboard", courses: "Courses", assignments: "Assignments", setup: "Semester Setup", exams: "Exam Prep", flashcards: "Flashcards", vault: "Memory Vault" };
  document.getElementById("viewTitle").textContent = titles[viewId] || "Dashboard";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderFocus() {
  const list = document.getElementById("focusList");
  list.innerHTML = "";
  state.focus.forEach((item, index) => {
    const row = document.createElement("label");
    row.className = `check-item ${item.done ? "done" : ""}`;
    row.innerHTML = `<input type="checkbox" ${item.done ? "checked" : ""}> <span>${item.text}</span>`;
    row.querySelector("input").addEventListener("change", event => {
      state.focus[index].done = event.target.checked;
      saveState();
      renderFocus();
    });
    list.appendChild(row);
  });
}

function renderAssignments() {
  const list = document.getElementById("assignmentList");
  list.innerHTML = "";
  const sorted = [...state.assignments].sort((a, b) => new Date(a.due) - new Date(b.due));
  sorted.forEach((assignment) => {
    const originalIndex = state.assignments.indexOf(assignment);
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `
      <div>
        <h4>${escapeHtml(assignment.title)}</h4>
        <p>${escapeHtml(assignment.course)} · Due ${formatDate(assignment.due)}</p>
      </div>
      <button class="icon-btn" aria-label="Delete assignment">Delete</button>
    `;
    item.querySelector("button").addEventListener("click", () => {
      state.assignments.splice(originalIndex, 1);
      saveState();
      renderAssignments();
      updateStats();
    });
    list.appendChild(item);
  });
}

function renderCourses() {
  const grid = document.getElementById("courseGrid");
  grid.innerHTML = "";
  courses.forEach((course, index) => {
    const card = document.createElement("button");
    card.className = "course-card";
    card.innerHTML = `<span class="tag">${course.icon}</span><h3>${course.name}</h3><p>${course.desc}</p>`;
    card.addEventListener("click", () => renderCourseDetail(index));
    grid.appendChild(card);
  });
}

function renderCourseDetail(index = 0) {
  const course = courses[index];
  const detail = document.getElementById("courseDetail");
  detail.innerHTML = `
    <div class="panel-heading">
      <h3>${course.icon} ${course.name}</h3>
      <span class="tag">${course.exam}</span>
    </div>
    <p class="muted">${course.desc}</p>
    <h3 style="margin-top:22px;">This week's priorities</h3>
    <ul>${course.priorities.map(item => `<li>${item}</li>`).join("")}</ul>
    <h3>Starter study move</h3>
    <p class="muted">Spend 20 minutes making recall questions, then 20 minutes answering without notes. Review only what you missed.</p>
  `;
}

function renderExamChecklist() {
  const list = document.getElementById("examChecklist");
  list.innerHTML = "";
  state.examChecklist.forEach((item, index) => {
    const row = document.createElement("label");
    row.className = `check-item ${item.done ? "done" : ""}`;
    row.innerHTML = `<input type="checkbox" ${item.done ? "checked" : ""}> <span>${item.text}</span>`;
    row.querySelector("input").addEventListener("change", event => {
      state.examChecklist[index].done = event.target.checked;
      saveState();
      renderExamChecklist();
    });
    list.appendChild(row);
  });
}

function renderFlashcard() {
  const card = flashcards[currentCard];
  document.getElementById("flashText").textContent = cardFlipped ? card.a : card.q;
  document.querySelector(".flash-label").textContent = cardFlipped ? "Answer" : "Question";
  document.getElementById("cardCounter").textContent = `${currentCard + 1} / ${flashcards.length}`;
}

function renderNotes() {
  const query = document.getElementById("noteSearch").value.toLowerCase();
  const list = document.getElementById("noteList");
  list.innerHTML = "";
  state.notes
    .filter(note => `${note.title} ${note.body}`.toLowerCase().includes(query))
    .forEach((note) => {
      const originalIndex = state.notes.indexOf(note);
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = `
        <div>
          <h4>${escapeHtml(note.title)}</h4>
          <p>${escapeHtml(note.body)}</p>
          <p style="margin-top:8px;"><small>${formatDate(note.date)}</small></p>
        </div>
        <button class="icon-btn" aria-label="Delete note">Delete</button>
      `;
      item.querySelector("button").addEventListener("click", () => {
        state.notes.splice(originalIndex, 1);
        saveState();
        renderNotes();
      });
      list.appendChild(item);
    });
}


function renderPrayers() {
  const pinned = state.prayers.find(prayer => prayer.pinned) || state.prayers[0];
  const pinnedContainer = document.getElementById("pinnedPrayer");
  const list = document.getElementById("prayerList");
  if (!pinned) {
    pinnedContainer.innerHTML = `<p class="muted">Add a prayer to keep it close while Shonda studies.</p>`;
  } else {
    pinnedContainer.innerHTML = `
      <p class="prayer-label">Pinned Prayer</p>
      <p class="prayer-text">${escapeHtml(pinned.text)}</p>
      <small>${formatDate(pinned.date)}</small>
    `;
  }

  list.innerHTML = "";
  if (!state.prayers.length) {
    list.innerHTML = `<div class="empty-state">No prayers saved yet.</div>`;
    return;
  }

  state.prayers.forEach((prayer, index) => {
    const item = document.createElement("div");
    item.className = `list-item prayer-item ${prayer.pinned ? "is-pinned" : ""}`;
    item.innerHTML = `
      <div>
        <h4>${prayer.pinned ? "📌 Pinned Prayer" : "Prayer"}</h4>
        <p>${escapeHtml(prayer.text)}</p>
        <p style="margin-top:8px;"><small>${formatDate(prayer.date)}</small></p>
      </div>
      <div class="item-actions">
        <button class="secondary-btn pin-prayer" type="button">${prayer.pinned ? "Pinned" : "Pin"}</button>
        <button class="secondary-btn edit-prayer" type="button">Edit</button>
        <button class="icon-btn delete-prayer" type="button" aria-label="Delete prayer">Delete</button>
      </div>
    `;
    item.querySelector(".pin-prayer").addEventListener("click", () => {
      state.prayers = state.prayers.map((entry, prayerIndex) => ({ ...entry, pinned: prayerIndex === index }));
      saveState();
      renderPrayers();
    });
    item.querySelector(".edit-prayer").addEventListener("click", () => {
      document.getElementById("prayerText").value = prayer.text;
      document.getElementById("prayerEditIndex").value = index;
      document.getElementById("prayerText").focus();
    });
    item.querySelector(".delete-prayer").addEventListener("click", () => {
      state.prayers.splice(index, 1);
      if (state.prayers.length && !state.prayers.some(entry => entry.pinned)) state.prayers[0].pinned = true;
      saveState();
      renderPrayers();
    });
    list.appendChild(item);
  });
}

function inferCourse(line, fallback) {
  const lower = line.toLowerCase();
  if (lower.includes("fundamentals")) return "Fundamentals";
  if (lower.includes("pharm")) return "Pharmacology";
  if (lower.includes("anatomy") || lower.includes("physiology") || lower.includes("a&p")) return "Anatomy & Physiology";
  if (lower.includes("medical terminology") || lower.includes("med term")) return "Medical Terminology";
  return fallback || "First-Year Nursing";
}

function parseImportDate(line) {
  const currentYear = new Date().getFullYear();
  const patterns = [
    /\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/,
    /\b(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})\b/,
    /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{1,2})(?:,\s*(\d{4}))?\b/i
  ];
  let match = line.match(patterns[0]);
  if (match) return `${match[1]}-${String(match[2]).padStart(2,"0")}-${String(match[3]).padStart(2,"0")}`;
  match = line.match(patterns[1]);
  if (match) {
    const year = match[3].length === 2 ? `20${match[3]}` : match[3];
    return `${year}-${String(match[1]).padStart(2,"0")}-${String(match[2]).padStart(2,"0")}`;
  }
  match = line.match(patterns[2]);
  if (match) {
    const monthNames = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
    const month = monthNames.findIndex(m => match[1].toLowerCase().startsWith(m)) + 1;
    return `${match[3] || currentYear}-${String(month).padStart(2,"0")}-${String(match[2]).padStart(2,"0")}`;
  }
  return "";
}

function cleanImportTitle(line) {
  return line
    .replace(/\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g, "")
    .replace(/\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/g, "")
    .replace(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{1,2}(?:,\s*\d{4})?\b/ig, "")
    .replace(/^[-–—:•*\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function detectImportType(line) {
  const lower = line.toLowerCase();
  if (/\b(exam|test|final|midterm)\b/.test(lower)) return "exam";
  if (/\b(quiz|check|assessment)\b/.test(lower)) return "quiz";
  return "assignment";
}

function parseSyllabusText() {
  const text = document.getElementById("importText").value;
  const fallbackCourse = document.getElementById("importCourse").value.trim();
  const lines = text.split(/\n+/).map(line => line.trim()).filter(Boolean);
  pendingImports = lines.map(line => {
    const due = parseImportDate(line);
    if (!due) return null;
    const title = cleanImportTitle(line);
    if (!title || title.length < 3) return null;
    const type = detectImportType(line);
    return {
      selected: true,
      type,
      title,
      course: inferCourse(line, fallbackCourse),
      due,
      original: line
    };
  }).filter(Boolean);
  renderImportPreview();
}

function renderImportPreview() {
  const preview = document.getElementById("importPreview");
  const count = document.getElementById("importCount");
  const addButton = document.getElementById("addImported");
  count.textContent = `${pendingImports.length} found`;
  addButton.disabled = pendingImports.length === 0 || !pendingImports.some(item => item.selected);
  if (!pendingImports.length) {
    preview.className = "item-list empty-state";
    preview.textContent = "No dated items found yet. Try lines with dates like Aug 26, 9/2/2026, or 2026-09-09.";
    return;
  }
  preview.className = "item-list";
  preview.innerHTML = "";
  pendingImports.forEach((item, index) => {
    const row = document.createElement("label");
    row.className = "import-item";
    row.innerHTML = `
      <input type="checkbox" ${item.selected ? "checked" : ""}>
      <div>
        <div class="import-meta"><span class="tag">${item.type}</span><span>${formatDate(item.due)}</span></div>
        <h4>${escapeHtml(item.title)}</h4>
        <p>${escapeHtml(item.course)}</p>
      </div>
    `;
    row.querySelector("input").addEventListener("change", event => {
      pendingImports[index].selected = event.target.checked;
      renderImportPreview();
    });
    preview.appendChild(row);
  });
}

function addImportedItems() {
  const selected = pendingImports.filter(item => item.selected);
  selected.forEach(item => {
    state.assignments.push({ title: item.title, course: item.course, due: item.due });
    if (item.type === "exam" || item.type === "quiz") {
      state.examChecklist.push({ text: `Prepare for ${item.title}`, done: false });
    }
  });
  saveState();
  renderAssignments();
  renderExamChecklist();
  updateStats();
  pendingImports = [];
  document.getElementById("importText").value = "";
  renderImportPreview();
  showView("assignments");
}

function updateStats() {
  document.getElementById("dueThisWeek").textContent = state.assignments.length;
}

function wireEvents() {
  document.querySelectorAll("[data-view]").forEach(button => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });

  document.getElementById("sampleImport").addEventListener("click", () => {
    document.getElementById("importCourse").value = "Fundamentals";
    document.getElementById("importText").value = `Fundamentals of Nursing
Aug 26 - Read Chapter 3: Safety and Infection Control
Sep 2 - Quiz: Vital Signs and Documentation
Sep 9 - Exam 1: Nursing Process, Safety, and Infection Control
Sep 16 - Study Guide Due: Communication and Patient Education
Pharmacology
Sep 23 - Dosage Calculation Practice Set
Oct 1 - Quiz: Medication Administration Rights`;
    parseSyllabusText();
  });

  document.getElementById("parseImport").addEventListener("click", parseSyllabusText);
  document.getElementById("addImported").addEventListener("click", addImportedItems);

  document.getElementById("focusForm").addEventListener("submit", event => {
    event.preventDefault();
    const input = document.getElementById("focusInput");
    const text = input.value.trim();
    if (!text) return;
    state.focus.push({ text, done: false });
    input.value = "";
    saveState();
    renderFocus();
  });

  document.getElementById("clearFocus").addEventListener("click", () => {
    state.focus = state.focus.filter(item => !item.done);
    saveState();
    renderFocus();
  });

  document.getElementById("assignmentForm").addEventListener("submit", event => {
    event.preventDefault();
    state.assignments.push({
      title: document.getElementById("assignmentTitle").value.trim(),
      course: document.getElementById("assignmentCourse").value.trim(),
      due: document.getElementById("assignmentDue").value
    });
    event.target.reset();
    saveState();
    renderAssignments();
    updateStats();
  });

  document.getElementById("confidenceRange").addEventListener("input", event => {
    const messages = {
      1: "Not ready yet. Start with the smallest weak area and build from there.",
      2: "A little shaky. Focus on active recall, not rereading.",
      3: "Steady. Keep practicing questions and reviewing weak spots.",
      4: "Solid. Now explain concepts out loud without notes.",
      5: "Strong. Protect your sleep and avoid last-minute overstudying."
    };
    document.getElementById("confidenceText").textContent = messages[event.target.value];
  });

  document.getElementById("flashcard").addEventListener("click", () => {
    cardFlipped = !cardFlipped;
    renderFlashcard();
  });
  document.getElementById("prevCard").addEventListener("click", () => {
    currentCard = (currentCard - 1 + flashcards.length) % flashcards.length;
    cardFlipped = false;
    renderFlashcard();
  });
  document.getElementById("nextCard").addEventListener("click", () => {
    currentCard = (currentCard + 1) % flashcards.length;
    cardFlipped = false;
    renderFlashcard();
  });
  document.getElementById("shuffleCard").addEventListener("click", () => {
    currentCard = Math.floor(Math.random() * flashcards.length);
    cardFlipped = false;
    renderFlashcard();
  });

  document.getElementById("noteForm").addEventListener("submit", event => {
    event.preventDefault();
    state.notes.unshift({
      title: document.getElementById("noteTitle").value.trim(),
      body: document.getElementById("noteBody").value.trim(),
      date: new Date().toISOString().slice(0, 10)
    });
    event.target.reset();
    saveState();
    renderNotes();
  });
  document.getElementById("noteSearch").addEventListener("input", renderNotes);

  document.getElementById("prayerForm").addEventListener("submit", event => {
    event.preventDefault();
    const textInput = document.getElementById("prayerText");
    const editIndexInput = document.getElementById("prayerEditIndex");
    const text = textInput.value.trim();
    if (!text) return;
    if (editIndexInput.value !== "") {
      state.prayers[Number(editIndexInput.value)].text = text;
    } else {
      state.prayers.unshift({ text, date: new Date().toISOString().slice(0, 10), pinned: state.prayers.length === 0 });
    }
    event.target.reset();
    editIndexInput.value = "";
    saveState();
    renderPrayers();
  });

  document.getElementById("cancelPrayerEdit").addEventListener("click", () => {
    document.getElementById("prayerForm").reset();
    document.getElementById("prayerEditIndex").value = "";
  });

  document.getElementById("resetDemo").addEventListener("click", () => {
    localStorage.removeItem("nursingNavigatorState");
    state = structuredClone(starterState);
    init();
    showView("dashboard");
  });
}

function init() {
  setDateLine();
  renderFocus();
  renderAssignments();
  renderCourses();
  renderCourseDetail();
  renderExamChecklist();
  renderFlashcard();
  renderNotes();
  renderPrayers();
  renderImportPreview();
  updateStats();
}

wireEvents();
init();
