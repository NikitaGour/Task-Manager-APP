import React from "react";
import { TasksProvider, useTasks } from "./TasksContext";
import TaskItem from "./Taskitem";


function AppInner() {
const { 
addTask,
filteredTasks,
clearCompleted,
total,
completedCount,
pendingCount,
theme,
toggleTheme,
filter,
setFilter,
} = useTasks();
const [value, setValue] = React.useState("");
const [error, setError] = React.useState("");


function handleAdd(e) {
if (e && e.preventDefault) e.preventDefault();
const result = addTask(value);
if (!result.ok) {
setError(result.error);
return;
}
setValue("");
setError("");
}
return (
<div className={theme === "dark" ? "page dark" : "page"}>
<div className="container">
<header className="app-header">
<h1>Simple Task Manager</h1>
<div className="header-controls">
<div className="muted small">{theme === "dark" ? "Dark" : "Light"}</div>
<label className="theme-toggle">
<input aria-label="toggle-theme" type="checkbox" checked={theme === "dark"} onChange={toggleTheme} />
</label>
</div>
</header>
<main className="card">
<form className="form-row" onSubmit={handleAdd} aria-label="Add task form">
<input
placeholder="Add new task"
value={value}
onChange={(e) => {
setValue(e.target.value);
if (error) setError("");
}}
aria-label="task-input"
className="task-input"
/>
<button type="submit" className="add-btn">
Add
</button>
</form>
{error && <div className="error">{error}</div>}


<div className="filters-row">
<div className="filters" role="tablist" aria-label="task filters">
<button className={`filter ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
All
</button>
<button className={`filter ${filter === "pending" ? "active" : ""}`} onClick={() => setFilter("pending")}>
Pending
</button>
<button className={`filter ${filter === "completed" ? "active" : ""}`} onClick={() => setFilter("completed")}>
Completed
</button>
</div>
<div className="muted small">Total: {total} • Completed: {completedCount} • Pending: {pendingCount}</div>
</div>


<div className="list-meta">
<div className="muted small">{filteredTasks.length} shown</div>
<div>
<button className="add-btn secondary" onClick={clearCompleted}>
Clear completed
</button>
</div>
</div>


<div className="task-list" aria-live="polite">
{filteredTasks.length === 0 ? (
<div className="no-tasks muted">No tasks found.</div>
) : (
filteredTasks.map((task) => <TaskItem key={task.id} task={task} />)
)}
</div>
</main>
</div>
</div>
);
}


export default function App() {
return (
<TasksProvider>
<AppInner />
</TasksProvider>
);
}