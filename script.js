
// =====================================
// 1. GRUNDLÆGGENDE INDSTILLINGER
// =====================================

const $ = (id) => document.getElementById(id);

const monthNames = [
  "januar", "februar", "marts", "april",
  "maj", "juni", "juli", "august",
  "september", "oktober", "november", "december"
];

const dayNames = [
  "søndag", "mandag", "tirsdag",
  "onsdag", "torsdag", "fredag", "lørdag"
];

const today = new Date(2026, 10, 11);

let selectedDate = new Date(today);

let currentMonth = new Date(
  today.getFullYear(),
  today.getMonth(),
  1
);


// =====================================
// 2. GEMTE REMINDERS
// =====================================

let reminders = JSON.parse(
  localStorage.getItem("planlyReminders") || "null"
) || [
  {
    id: 1,
    title: "Dansk aflevering",
    date: "2026-11-14",
    time: "",
    note: "Analyse af novelle skal afleveres.",
    type: "school"
  },
  {
    id: 2,
    title: "Studiesession",
    date: "2026-11-11",
    time: "15:00",
    note: "Studiesession med Rasmus og Line.",
    type: "personal"
  },
  {
    id: 3,
    title: "Matematikprøve",
    date: "2026-11-17",
    time: "08:00",
    note: "Husk at medbringe lommeregner.",
    type: "school"
  }
];


// =====================================
// 3. KOMMENDE OPGAVER
// =====================================

let tasks = JSON.parse(
  localStorage.getItem("planlyTasks") || "null"
) || [
  {
    id: 1,
    title: "Dansk aflevering",
    date: "2026-11-14",
    done: false
  },
  {
    id: 2,
    title: "Matematikprøve",
    date: "2026-11-17",
    done: false
  },
  {
    id: 3,
    title: "Engelsk aflevering",
    date: "2026-11-19",
    done: false
  }
];


// =====================================
// 4. SKEMA
// =====================================

const lessons = [
  ["08:00", "09:30", "Matematik", "Lokale 312"],
  ["09:45", "11:15", "Dansk", "Lokale 201"],
  ["11:45", "13:15", "Informatik", "Lokale 104"],
  ["13:30", "15:00", "Fysik", "Lokale 203"]
];


// =====================================
// 5. GEM DATA
// =====================================

function save() {

  localStorage.setItem(
    "planlyReminders",
    JSON.stringify(reminders)
  );

  localStorage.setItem(
    "planlyTasks",
    JSON.stringify(tasks)
  );

}


// =====================================
// 6. DATOER
// =====================================

function dateKey(date) {

  return (
    date.getFullYear() + "-" +
    String(date.getMonth() + 1).padStart(2, "0") + "-" +
    String(date.getDate()).padStart(2, "0")
  );

}


function formatDate(date) {

  return (
    dayNames[date.getDay()] +
    " d. " + date.getDate() +
    ". " + monthNames[date.getMonth()] +
    " " + date.getFullYear()
  );

}


// =====================================
// 7. BESKEDER
// =====================================

function showToast(message) {

  $("toast").textContent = message;

  $("toast").classList.add("show");

  setTimeout(() => {

    $("toast").classList.remove("show");

  }, 2300);

}


// =====================================
// 8. KALENDER
// =====================================

function renderCalendar() {

  $("monthTitle").textContent =
    monthNames[currentMonth.getMonth()][0].toUpperCase() +
    monthNames[currentMonth.getMonth()].slice(1) +
    " " +
    currentMonth.getFullYear();


  const first = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );

  const startOffset = (first.getDay() + 6) % 7;

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const prevDays = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    0
  ).getDate();


  $("calendarGrid").innerHTML = "";


  for (let i = 0; i < 42; i++) {

    let date;
    let muted = false;


    if (i < startOffset) {

      date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        prevDays - startOffset + i + 1
      );

      muted = true;

    }

    else if (i >= startOffset + daysInMonth) {

      date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        i - startOffset - daysInMonth + 1
      );

      muted = true;

    }

    else {

      date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        i - startOffset + 1
      );

    }


    const cell = document.createElement("button");

    cell.className = "day-cell";

    if (muted) {
      cell.classList.add("muted");
    }

    if (dateKey(date) === dateKey(selectedDate)) {
      cell.classList.add("selected");
    }


    const number = document.createElement("span");

    number.className = "day-number";

    number.textContent = date.getDate();

    cell.append(number);


    const dayReminders = reminders.filter(
      r => r.date === dateKey(date)
    );


    if (dayReminders.length > 0) {

      const dots = document.createElement("span");

      dots.className = "dots";

      dayReminders.slice(0, 3).forEach(r => {

        const dot = document.createElement("i");

        dot.className =
          "dot " +
          (r.type === "personal" ? "" : "purple");

        dots.append(dot);

      });

      cell.append(dots);

    }


    cell.addEventListener("click", () => {

      selectedDate = new Date(date);

      currentMonth = new Date(
        date.getFullYear(),
        date.getMonth(),
        1
      );

      renderAll();

    });


    $("calendarGrid").append(cell);

  }

  renderDeadlines();

}


// =====================================
// 9. KOMMENDE DEADLINES
// =====================================

function renderDeadlines() {

  const upcoming = [...tasks]
    .filter(t => !t.done)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);


  if (upcoming.length === 0) {

    $("deadlinePreview").innerHTML =
      '<p class="muted">Ingen kommende deadlines.</p>';

    return;

  }


  $("deadlinePreview").innerHTML = upcoming.map(t => `

    <div class="deadline-row">

      <i class="dot"></i>

      <strong>${escapeHtml(t.title)}</strong>

      <small>
        ${new Date(t.date + "T12:00:00").toLocaleDateString(
          "da-DK",
          {
            day: "numeric",
            month: "short"
          }
        )}
      </small>

      <span class="deadline-tag">Deadline</span>

    </div>

  `).join("");

}


// =====================================
// 10. DAGSOVERSIGT OG SKEMA
// =====================================

function renderDay() {

  $("selectedDateTitle").textContent =
    formatDate(selectedDate);


  $("scheduleList").innerHTML = lessons.map(l => `

    <div class="lesson">

      <span class="lesson-bar"></span>

      <div>

        <strong>
          ${l[0]} – ${l[1]} &nbsp; ${l[2]}
        </strong>

        <small>${l[3]}</small>

      </div>

    </div>

  `).join("");


  const dayReminders = reminders
    .filter(r => r.date === dateKey(selectedDate))
    .sort((a, b) =>
      (a.time || "").localeCompare(b.time || "")
    );


  $("reminderCount").textContent =
    dayReminders.length;


  if (dayReminders.length === 0) {

    $("reminderList").innerHTML =
      '<p class="muted">Ingen reminders på denne dag endnu.</p>';

  }

  else {

    $("reminderList").innerHTML =
      dayReminders.map(r => `

        <article class="reminder-card ${r.type}">

          <button
            class="delete-reminder"
            data-delete="${r.id}"
          >×</button>

          <strong>${escapeHtml(r.title)}</strong>

          <p>${escapeHtml(r.note || "Ingen beskrivelse")}</p>

          <div class="reminder-meta">

            <span>${r.time || "Hele dagen"}</span>

            <span class="type-pill ${r.type}">
              ${r.type === "school" ? "Skole" : "Personlig"}
            </span>

          </div>

        </article>

      `).join("");

  }


  document.querySelectorAll("[data-delete]").forEach(btn => {

    btn.addEventListener("click", () => {

      reminders = reminders.filter(
        r => r.id !== Number(btn.dataset.delete)
      );

      save();

      renderAll();

      showToast("Reminder slettet");

    });

  });

}


// =====================================
// 11. OPGAVER
// =====================================

function renderTasks() {

  $("allTasks").innerHTML = tasks.length

    ? tasks.map(t => `

      <div class="task-row">

        <input
          type="checkbox"
          data-task="${t.id}"
          ${t.done ? "checked" : ""}
        >

        <div class="task-info">

          <strong>${escapeHtml(t.title)}</strong>

          <small>
            Deadline:
            ${new Date(t.date + "T12:00:00").toLocaleDateString("da-DK")}
          </small>

        </div>

        <button
          class="delete-reminder"
          data-task-delete="${t.id}"
        >×</button>

      </div>

    `).join("")

    : '<p class="muted">Du har ingen opgaver endnu.</p>';


  document.querySelectorAll("[data-task]").forEach(c => {

    c.addEventListener("change", () => {

      const task = tasks.find(
        t => t.id === Number(c.dataset.task)
      );

      if (task) {
        task.done = c.checked;
      }

      save();

      renderAll();

    });

  });


  document.querySelectorAll("[data-task-delete]").forEach(b => {

    b.addEventListener("click", () => {

      tasks = tasks.filter(
        t => t.id !== Number(b.dataset.taskDelete)
      );

      save();

      renderAll();

    });

  });

}


// =====================================
// 12. BESKYTTELSE AF BRUGERTEKST
// =====================================

function escapeHtml(value) {

  return String(value).replace(/[&<>"']/g, c => ({

    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"

  }[c]));

}


// =====================================
// 13. OPRET REMINDER
// =====================================

function openDialog() {

  $("reminderForm").reset();

  $("reminderDate").value = dateKey(selectedDate);

  $("reminderDialog").showModal();

}


$("addReminder").addEventListener("click", openDialog);

$("addReminderTop").addEventListener("click", openDialog);


$("closeDialog").addEventListener("click", () => {

  $("reminderDialog").close();

});

$("cancelDialog").addEventListener("click", () => {

  $("reminderDialog").close();

});


$("reminderForm").addEventListener("submit", e => {

  e.preventDefault();


  const newReminder = {

    id: Date.now(),

    title: $("reminderTitle").value.trim(),

    date: $("reminderDate").value,

    time: $("reminderTime").value,

    note: $("reminderNote").value.trim(),

    type: $("reminderType").value

  };


  reminders.push(newReminder);

  save();


  selectedDate = new Date(
    newReminder.date + "T12:00:00"
  );

  currentMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1
  );


  $("reminderDialog").close();

  renderAll();

  showToast("Din reminder er gemt!");

});


// =====================================
// 14. SKIFT MELLEM MÅNEDER
// =====================================

$("prevMonth").addEventListener("click", () => {

  currentMonth.setMonth(currentMonth.getMonth() - 1);

  renderCalendar();

});


$("nextMonth").addEventListener("click", () => {

  currentMonth.setMonth(currentMonth.getMonth() + 1);

  renderCalendar();

});


$("todayButton").addEventListener("click", () => {

  selectedDate = new Date(today);

  currentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  renderAll();

});


// =====================================
// 15. OPRET OPGAVER
// =====================================

$("addTaskButton").addEventListener("click", () => {

  const title = prompt("Hvad hedder opgaven?");

  if (!title || !title.trim()) return;


  const date = prompt(
    "Hvornår er deadline? (YYYY-MM-DD)",
    dateKey(selectedDate)
  );

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {

    showToast("Skriv datoen som ÅÅÅÅ-MM-DD");

    return;

  }


  tasks.push({

    id: Date.now(),

    title: title.trim(),

    date: date,

    done: false

  });


  save();

  renderAll();

  showToast("Opgave tilføjet!");

});


// =====================================
// 16. NAVIGATION
// =====================================

function showPage(page) {

  ["calendar", "tasks", "settings"].forEach(p => {

    $(`${p}Page`).classList.toggle(
      "hidden",
      p !== page
    );

  });


  document.querySelectorAll(".nav-item").forEach(b => {

    b.classList.toggle(
      "active",
      b.dataset.page === page
    );

  });

}


document.querySelectorAll(".nav-item").forEach(b => {

  b.addEventListener("click", () => {

    showPage(b.dataset.page);

  });

});


$("seeAll").addEventListener("click", () => {

  showPage("tasks");

});


// =====================================
// 17. INDSTILLINGER
// =====================================

$("profileName").addEventListener("change", () => {

  document.querySelector(
    ".profile span:nth-child(2)"
  ).textContent = $("profileName").value;

  showToast("Profilnavn opdateret");

});


$("resetData").addEventListener("click", () => {

  if (!confirm("Vil du gendanne eksempeldata?")) return;

  localStorage.removeItem("planlyReminders");

  localStorage.removeItem("planlyTasks");

  location.reload();

});


// =====================================
// 18. LYST OG MØRKT TEMA
// =====================================

$("lightMode").addEventListener("click", () => {

  document.body.classList.remove("dark");

});

$("darkMode").addEventListener("click", () => {

  document.body.classList.add("dark");

});


// =====================================
// 19. START PLANLY
// =====================================

function renderAll() {

  renderCalendar();

  renderDay();

  renderTasks();

}


renderAll();
