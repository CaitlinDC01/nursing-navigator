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
  return saved ? JSON.parse(saved) : structuredClone(starterState);
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

function showView(viewId) {
  document.querySelectorAll(".view").forEach(view => view.classList.toggle("active-view", view.id === viewId));
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.view === viewId));
  const titles = { dashboard: "Dashboard", courses: "Courses", assignments: "Assignments", exams: "Exam Prep", flashcards: "Flashcards", vault: "Memory Vault" };
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
        <h4>${assignment.title}</h4>
        <p>${assignment.course} · Due ${formatDate(assignment.due)}</p>
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
          <h4>${note.title}</h4>
          <p>${note.body}</p>
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

function updateStats() {
  document.getElementById("dueThisWeek").textContent = state.assignments.length;
}

function wireEvents() {
  document.querySelectorAll("[data-view]").forEach(button => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });

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
  updateStats();
}

wireEvents();
init();
