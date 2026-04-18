// ===== STATE =====
// load tasks from localStorage or start with empty array
let tasks = JSON.parse(localStorage.getItem("tasks") || "[]")
// current filter: all | active | completed
let currentFilter = "all"

// ===== DOM REFERENCES =====
const taskList = document.getElementById("task-list")
const taskInput = document.getElementById("task-input")
const emptyState = document.getElementById("empty-state")
const totalCount = document.getElementById("total-count")
const doneCount = document.getElementById("done-count")

// ===== SAVE =====
// save current tasks array to localStorage
function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks))
}

// ===== ADD TASK =====
// called when user clicks Add button or presses Enter
function addTask() {
  const text = taskInput.value.trim()
  // do nothing if input is empty
  if (!text) return

  // create a new task object
  const task = {
    id: Date.now(),        // unique id using timestamp
    text: text,            // task text from input
    completed: false       // not completed by default
  }

  // add to tasks array
  tasks.push(task)
  // save to localStorage
  save()
  // clear the input field
  taskInput.value = ""
  // re-render the list
  render()
}

// ===== DELETE TASK =====
// remove a task by its id
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id)
  save()
  render()
}

// ===== TOGGLE COMPLETE =====
// flip the completed status of a task
function toggleTask(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  )
  save()
  render()
}

// ===== EDIT TASK =====
// make the task text editable inline
function editTask(id) {
  // find the span element for this task
  const span = document.querySelector(`[data-id="${id}"] .task-text`)
  if (!span) return

  // make it editable
  span.contentEditable = "true"
  span.focus()

  // place cursor at end of text
  const range = document.createRange()
  range.selectNodeContents(span)
  range.collapse(false)
  const sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(range)

  // save when user finishes editing (clicks away)
  span.onblur = () => {
    const newText = span.textContent.trim()
    if (newText) {
      // update the task text
      tasks = tasks.map(t =>
        t.id === id ? { ...t, text: newText } : t
      )
      save()
    }
    span.contentEditable = "false"
    render()
  }

  // save on Enter key press
  span.onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      span.blur()
    }
  }
}

// ===== RENDER =====
// rebuild the task list UI from scratch
function render() {
  // filter tasks based on current filter tab
  let filtered = tasks
  if (currentFilter === "active") {
    filtered = tasks.filter(t => !t.completed)
  } else if (currentFilter === "completed") {
    filtered = tasks.filter(t => t.completed)
  }

  // clear existing list
  taskList.innerHTML = ""

  // show or hide empty state
  if (filtered.length === 0) {
    emptyState.classList.add("visible")
  } else {
    emptyState.classList.remove("visible")
  }

  // render each task as a list item
  filtered.forEach(task => {
    const li = document.createElement("li")
    li.className = "task-item" + (task.completed ? " completed" : "")
    li.setAttribute("data-id", task.id)

    li.innerHTML = `
      <div class="task-check" onclick="toggleTask(${task.id})">
        ${task.completed ? "✓" : ""}
      </div>
      <span class="task-text">${escapeHtml(task.text)}</span>
      <div class="task-actions">
        <button class="btn-icon edit" onclick="editTask(${task.id})" title="Edit">✎</button>
        <button class="btn-icon delete" onclick="deleteTask(${task.id})" title="Delete">✕</button>
      </div>
    `
    taskList.appendChild(li)
  })

  // update stats in header
  const total = tasks.length
  const done = tasks.filter(t => t.completed).length
  totalCount.textContent = total + (total === 1 ? " task" : " tasks")
  doneCount.textContent = done + " done"
}

// ===== ESCAPE HTML =====
// prevent XSS — safely render user text
function escapeHtml(text) {
  const div = document.createElement("div")
  div.appendChild(document.createTextNode(text))
  return div.innerHTML
}

// ===== FILTER BUTTONS =====
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    // update active tab
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"))
    btn.classList.add("active")
    // update filter and re-render
    currentFilter = btn.getAttribute("data-filter")
    render()
  })
})

// ===== ENTER KEY =====
// allow pressing Enter to add a task
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask()
})

// ===== INITIAL RENDER =====
render()
