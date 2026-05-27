const modal = document.getElementById("modal");
const openModal = document.getElementById("openModal");
const openCard = document.getElementById("openCard");
const closeModal = document.getElementById("closeModal");
const saveBtn = document.getElementById("saveBtn");
const toast = document.getElementById("toast");
const notesGrid = document.getElementById("notesGrid");
const searchInput = document.getElementById("searchInput");
const noteCount = document.getElementById("noteCount");
const greeting = document.getElementById("greeting");

let notes = JSON.parse(localStorage.getItem("notes")) || [];

function setGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) { greeting.innerText = "Good Morning 👋"; }
  else if (hour < 18) { greeting.innerText = "Good Afternoon 👋"; }
  else { greeting.innerText = "Good Evening 👋"; }
}
setGreeting();

openModal.addEventListener("click", () => { modal.classList.add("active"); });

document.addEventListener("click", (e) => {
  if (e.target.id === "openCard" || e.target.closest("#openCard")) {
    modal.classList.add("active");
  }
});

closeModal.addEventListener("click", () => { modal.classList.remove("active"); });

saveBtn.addEventListener("click", () => {
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  const tag = document.getElementById("tag").value;
  const theme = document.getElementById("theme").value;

  if (title === "" || content === "") {
    alert("Please fill all fields");
    return;
  }

  const note = {
    id: Date.now(),
    title,
    content,
    tag,
    theme,
    favorite: false,
    locked: false,
    trash: false,
    date: new Date().toLocaleDateString(),
  };

  notes.push(note);
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes(currentView);
  modal.classList.remove("active");
  document.getElementById("title").value = "";
  document.getElementById("content").value = "";
  document.getElementById("tag").selectedIndex = 0;
  document.getElementById("theme").selectedIndex = 0;
  showToast();
});

function renderNotes(type = "all") {
  notesGrid.innerHTML = `
    <div class="card add-card" id="openCard">
      <div class="plus">+</div>
      <h2>Add New Note</h2>
    </div>
  `;

  let filtered = notes;
  if (type === "favorites") { filtered = notes.filter((note) => note.favorite); }
  if (type === "locked") { filtered = notes.filter((note) => note.locked); }
  if (type === "trash") { filtered = notes.filter((note) => note.trash); }

  filtered.forEach((note) => {
    if (type !== "trash" && note.trash) { return; }

    const themeClass = note.theme && note.theme !== "default" ? `theme-${note.theme}` : "";

    notesGrid.innerHTML += `
      <div class="card ${themeClass}">
        ${note.locked ? `<div class="lock-badge">🔒 Locked</div>` : ""}
        <button class="favorite-btn" onclick="toggleFavorite(${note.id})">
          ${note.favorite ? "⭐" : "☆"}
        </button>
        <button class="lock-btn" onclick="toggleLock(${note.id})">
          ${note.locked ? "🔒" : "🔓"}
        </button>
        <h2>${note.title}</h2>
        <p>${note.locked && currentView !== "locked" ? "🔒 Locked Note" : note.content}</p>
        <div class="badge">${note.tag}</div>
        ${type === "trash" ? `
          <div class="card-footer">
            <div class="date">${note.date}</div>
            <div class="trash-actions">
              <button class="restore-btn" onclick="restoreNote(${note.id})">Restore</button>
              <button class="delete-btn" onclick="deleteForever(${note.id})">Delete</button>
            </div>
          </div>
        ` : `
          <div class="card-footer">
            <div class="date">${note.date}</div>
            <button class="delete-btn" onclick="moveToTrash(${note.id})">Trash</button>
          </div>
        `}
      </div>
    `;
  });

  noteCount.innerText = `You have ${filtered.filter((n) => !n.trash).length} notes`;
}

function toggleFavorite(id) {
  notes = notes.map((note) => {
    if (note.id === id) { note.favorite = !note.favorite; }
    return note;
  });
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes(currentView);
}

function toggleLock(id) {
  notes = notes.map((note) => {
    if (note.id === id) { note.locked = !note.locked; }
    return note;
  });
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes(currentView);
}

function moveToTrash(id) {
  notes = notes.map((note) => {
    if (note.id === id) { note.trash = true; }
    return note;
  });
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes(currentView);
}

function restoreNote(id) {
  notes = notes.map((note) => {
    if (note.id === id) { note.trash = false; }
    return note;
  });
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes("trash");
}

function deleteForever(id) {
  notes = notes.filter((note) => note.id !== id);
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes("trash");
}

searchInput.addEventListener("keyup", () => {
  const value = searchInput.value.toLowerCase();
  const filtered = notes.filter(
    (note) => !note.trash && (
      note.title.toLowerCase().includes(value) ||
      note.content.toLowerCase().includes(value) ||
      note.tag.toLowerCase().includes(value)
    )
  );

  notesGrid.innerHTML = `
    <div class="card add-card" id="openCard">
      <div class="plus">+</div>
      <h2>Add New Note</h2>
    </div>
  `;

  filtered.forEach((note) => {
    const themeClass = note.theme && note.theme !== "default" ? `theme-${note.theme}` : "";
    notesGrid.innerHTML += `
      <div class="card ${themeClass}">
        ${note.locked ? `<div class="lock-badge">🔒 Locked</div>` : ""}
        <button class="favorite-btn" onclick="toggleFavorite(${note.id})">
          ${note.favorite ? "⭐" : "☆"}
        </button>
        <h2>${note.title}</h2>
        <p>${note.content}</p>
        <div class="badge">${note.tag}</div>
      </div>
    `;
  });
});

function showToast() {
  toast.classList.add("show");
  setTimeout(() => { toast.classList.remove("show"); }, 2500);
}

const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const themeText = document.getElementById("themeText");
  if (document.body.classList.contains("light")) {
    themeText.innerHTML = "☀️ Light Mode";
  } else {
    themeText.innerHTML = "🌙 Dark Mode";
  }
});

let currentView = "all";
const menuItems = document.querySelectorAll(".menu-item");
menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    menuItems.forEach((i) => i.classList.remove("active"));
    item.classList.add("active");
    currentView = item.dataset.filter;
    renderNotes(currentView);
  });
});

renderNotes();
