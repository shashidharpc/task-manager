// Redirect to login if not authenticated
if (!AuthService.isLoggedIn()) {
  window.location.href = "/";
}

// State
let allTasks = [];
let pendingDeleteId = null;
let taskModal = null;
let deleteModal = null;

// DOM refs
const loadingState = document.getElementById("loading-state");
const taskBoard = document.getElementById("task-board");
const globalAlert = document.getElementById("global-alert");
const userGreeting = document.getElementById("user-greeting");

// Init greeting
const user = AuthService.getUser();
if (user) {
  userGreeting.textContent = `Hello, ${user.name}`;
}

// Modal instances (created after DOM ready)
document.addEventListener("DOMContentLoaded", () => {
  taskModal = new bootstrap.Modal(document.getElementById("task-modal"));
  deleteModal = new bootstrap.Modal(document.getElementById("delete-modal"));
  loadTasks();
});

// ---- Helpers ----

function showGlobalAlert(message, type = "danger") {
  globalAlert.className = `alert alert-${type}`;
  globalAlert.textContent = message;
  globalAlert.classList.remove("d-none");
  setTimeout(() => globalAlert.classList.add("d-none"), 5000);
}

function showModalAlert(message, type = "danger") {
  const el = document.getElementById("modal-alert");
  el.innerHTML = `<div class="alert alert-${type} py-2 small">${message}</div>`;
}

function clearModalAlert() {
  document.getElementById("modal-alert").innerHTML = "";
}

function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ---- Render ----

function buildTaskCard(task) {
  const desc = task.description
    ? `<p class="task-desc text-muted">${escapeHtml(task.description)}</p>`
    : "";

  const statuses = ["Todo", "In Progress", "Done"];
  const statusOptions = statuses
    .map(s => `<option value="${s}" ${s === task.status ? "selected" : ""}>${s}</option>`)
    .join("");

  return `
    <div class="task-card card mb-2" data-id="${task.id}">
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
          <h6 class="task-title mb-0">${escapeHtml(task.title)}</h6>
          <div class="d-flex gap-1 flex-shrink-0">
            <button class="btn btn-sm btn-outline-secondary edit-btn" title="Edit" data-id="${task.id}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-btn" title="Delete" data-id="${task.id}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
        ${desc}
        <div class="d-flex justify-content-between align-items-center mt-2">
          <select class="form-select form-select-sm status-select w-auto" data-id="${task.id}">
            ${statusOptions}
          </select>
          <span class="text-muted" style="font-size: 0.7rem;">${formatDate(task.created_at)}</span>
        </div>
      </div>
    </div>
  `;
}

function buildEmptyState(label) {
  return `
    <div class="empty-state text-center text-muted py-4">
      <i class="bi bi-inbox fs-3 d-block mb-1"></i>
      <small>No ${label.toLowerCase()} tasks</small>
    </div>
  `;
}

function renderBoard(tasks) {
  const colTodo = document.getElementById("col-todo");
  const colInprogress = document.getElementById("col-inprogress");
  const colDone = document.getElementById("col-done");

  const todo = tasks.filter(t => t.status === "Todo");
  const inProgress = tasks.filter(t => t.status === "In Progress");
  const done = tasks.filter(t => t.status === "Done");

  colTodo.innerHTML = todo.length ? todo.map(buildTaskCard).join("") : buildEmptyState("Todo");
  colInprogress.innerHTML = inProgress.length ? inProgress.map(buildTaskCard).join("") : buildEmptyState("In Progress");
  colDone.innerHTML = done.length ? done.map(buildTaskCard).join("") : buildEmptyState("Done");

  document.getElementById("count-todo").textContent = todo.length;
  document.getElementById("count-inprogress").textContent = inProgress.length;
  document.getElementById("count-done").textContent = done.length;

  // Attach event listeners
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => openEditModal(btn.dataset.id));
  });
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => openDeleteModal(btn.dataset.id));
  });
  document.querySelectorAll(".status-select").forEach(sel => {
    sel.addEventListener("change", () => handleStatusChange(sel.dataset.id, sel.value));
  });
}

// ---- Load tasks ----

async function loadTasks() {
  loadingState.classList.remove("d-none");
  taskBoard.classList.add("d-none");

  try {
    const data = await TaskService.getTasks();
    allTasks = data.tasks || [];
    renderBoard(allTasks);
    taskBoard.classList.remove("d-none");
  } catch (err) {
    showGlobalAlert("Failed to load tasks: " + err.message);
    if (err.message.includes("expired") || err.message.includes("Invalid token")) {
      AuthService.logout();
    }
    taskBoard.classList.remove("d-none");
    renderBoard([]);
  } finally {
    loadingState.classList.add("d-none");
  }
}

// ---- Add Task ----

document.getElementById("add-task-btn").addEventListener("click", () => {
  openAddModal();
});

function openAddModal() {
  document.getElementById("task-modal-title").textContent = "Add Task";
  document.getElementById("task-id").value = "";
  document.getElementById("task-title").value = "";
  document.getElementById("task-description").value = "";
  document.getElementById("task-status").value = "Todo";
  document.getElementById("title-char-count").textContent = "0";
  document.getElementById("save-btn-text").textContent = "Save Task";
  clearModalAlert();
  taskModal.show();
}

function openEditModal(taskId) {
  const task = allTasks.find(t => t.id === taskId);
  if (!task) return;

  document.getElementById("task-modal-title").textContent = "Edit Task";
  document.getElementById("task-id").value = task.id;
  document.getElementById("task-title").value = task.title;
  document.getElementById("task-description").value = task.description || "";
  document.getElementById("task-status").value = task.status;
  document.getElementById("title-char-count").textContent = task.title.length;
  document.getElementById("save-btn-text").textContent = "Update Task";
  clearModalAlert();
  taskModal.show();
}

// Character counter for title
document.getElementById("task-title").addEventListener("input", function () {
  document.getElementById("title-char-count").textContent = this.value.length;
});

// Save task (add or edit)
document.getElementById("save-task-btn").addEventListener("click", async () => {
  const taskId = document.getElementById("task-id").value;
  const title = document.getElementById("task-title").value.trim();
  const description = document.getElementById("task-description").value.trim();
  const status = document.getElementById("task-status").value;

  if (!title) {
    showModalAlert("Task title is required.");
    return;
  }

  const saveBtn = document.getElementById("save-task-btn");
  const saveBtnText = document.getElementById("save-btn-text");
  const saveBtnSpinner = document.getElementById("save-btn-spinner");

  saveBtn.disabled = true;
  saveBtnSpinner.classList.remove("d-none");
  clearModalAlert();

  try {
    if (taskId) {
      const result = await TaskService.updateTask(taskId, { title, description, status });
      const idx = allTasks.findIndex(t => t.id === taskId);
      if (idx !== -1) allTasks[idx] = result.task;
    } else {
      const result = await TaskService.createTask(title, description, status);
      allTasks.unshift(result.task);
    }
    renderBoard(allTasks);
    taskModal.hide();
  } catch (err) {
    showModalAlert(err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtnSpinner.classList.add("d-none");
  }
});

// ---- Delete task ----

function openDeleteModal(taskId) {
  pendingDeleteId = taskId;
  deleteModal.show();
}

document.getElementById("confirm-delete-btn").addEventListener("click", async () => {
  if (!pendingDeleteId) return;

  const deleteBtn = document.getElementById("confirm-delete-btn");
  const deleteBtnText = document.getElementById("delete-btn-text");
  const deleteBtnSpinner = document.getElementById("delete-btn-spinner");

  deleteBtn.disabled = true;
  deleteBtnSpinner.classList.remove("d-none");
  deleteBtnText.textContent = "Deleting...";

  try {
    await TaskService.deleteTask(pendingDeleteId);
    allTasks = allTasks.filter(t => t.id !== pendingDeleteId);
    renderBoard(allTasks);
    deleteModal.hide();
  } catch (err) {
    showGlobalAlert("Failed to delete task: " + err.message);
    deleteModal.hide();
  } finally {
    deleteBtn.disabled = false;
    deleteBtnSpinner.classList.add("d-none");
    deleteBtnText.textContent = "Delete";
    pendingDeleteId = null;
  }
});

// ---- Status change from dropdown ----

async function handleStatusChange(taskId, newStatus) {
  try {
    const result = await TaskService.updateTask(taskId, { status: newStatus });
    const idx = allTasks.findIndex(t => t.id === taskId);
    if (idx !== -1) allTasks[idx] = result.task;
    renderBoard(allTasks);
  } catch (err) {
    showGlobalAlert("Failed to update status: " + err.message);
    renderBoard(allTasks); // reset UI
  }
}

// ---- Logout ----

document.getElementById("logout-btn").addEventListener("click", () => {
  AuthService.logout();
});
