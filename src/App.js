import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import "./App.css";

/* ---------- useLocalStorage hook ---------- */
function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return typeof initialValue === "function" ? initialValue() : initialValue;
      return JSON.parse(raw);
    } catch {
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore write errors
    }
  }, [key, state]);

  return [state, setState];
}

/* ---------- Tasks Context ---------- */
const TasksContext = createContext(null);
export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used inside TasksProvider");
  return ctx;
}

function TasksProvider({ children }) {
  const [tasks, setTasks] = useLocalStorage("simple-tasks", []);

  // normalize legacy items once on mount
  useEffect(() => {
    if (!Array.isArray(tasks)) return;
    const normalized = tasks.map((t) => ({
      id: t?.id ?? String(Date.now() + Math.random()).replace(".", ""),
      title: t?.title ?? "",
      completed: !!t?.completed,
    }));
    if (JSON.stringify(normalized) !== JSON.stringify(tasks)) {
      setTasks(normalized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  const addTask = useCallback((title) => {
    setTasks((prev) => [{ id: Date.now().toString(), title: title.trim(), completed: false }, ...prev]);
  }, [setTasks]);

  const toggleTask = useCallback((id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }, [setTasks]);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, [setTasks]);

  const replaceTasks = useCallback((newTasks) => {
    setTasks(newTasks);
  }, [setTasks]);

  const value = useMemo(() => ({ tasks, addTask, toggleTask, deleteTask, replaceTasks }), [tasks, addTask, toggleTask, deleteTask, replaceTasks]);

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

/* ---------- TaskItem (memoized) ---------- */
const TaskItem = React.memo(function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className={`task ${task.completed ? "completed" : ""}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div className="left" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input type="checkbox" checked={!!task.completed} onChange={() => onToggle(task.id)} />
        <div className="title">{task.title}</div>
      </div>
      <button className="delete-btn" onClick={() => onDelete(task.id)}>Delete</button>
    </div>
  );
});

/* ---------- App (root) ---------- */
export default function App() {
  const [theme, setTheme] = useLocalStorage("theme:v1", "light"); // 'light' | 'dark'
  return (
    <div className={theme === "dark" ? "page dark" : "page"}>
      <TasksProvider>
        <AppInner theme={theme} setTheme={setTheme} />
      </TasksProvider>
    </div>
  );
}

/* ---------- Inner App (UI, uses context) ---------- */
function AppInner({ theme, setTheme }) {
  const { tasks, addTask, toggleTask, deleteTask, replaceTasks } = useTasks();

  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all | pending | completed

  // derived list memoized
  const filteredTasks = useMemo(() => {
    if (filter === "pending") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  const handleAdd = useCallback((e) => {
    e && e.preventDefault && e.preventDefault();
    const trimmed = (value ?? "").trim();
    if (!trimmed) {
      setError("Please enter a task.");
      return;
    }
    addTask(trimmed);
    setValue("");
    setError("");
  }, [value, addTask]);

  const handleToggle = useCallback((id) => toggleTask(id), [toggleTask]);
  const handleDelete = useCallback((id) => deleteTask(id), [deleteTask]);
  const clearCompleted = useCallback(() => replaceTasks(tasks.filter((t) => !t.completed)), [tasks, replaceTasks]);
  const toggleTheme = useCallback(() => setTheme((p) => (p === "dark" ? "light" : "dark")), [setTheme]);

  const total = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = total - completedCount;
  const inputValue = value ?? "";

  return (
    <div className="container" style={{ width: "100%", maxWidth: 720, padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Advanced Task Manager</h1>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontSize: 13, color: "var(--muted, #666)" }}>{theme === "dark" ? "Dark" : "Light"}</div>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <input aria-label="toggle-theme" type="checkbox" checked={theme === "dark"} onChange={toggleTheme} />
          </label>
        </div>
      </header>

      <main className="card" style={{ padding: 16 }}>
        <form className="form-row" onSubmit={handleAdd} aria-label="Add task form">
          <input placeholder="Add new task" value={inputValue} onChange={(e) => { setValue(e.target.value); if (error) setError(""); }} aria-label="task-input" />
          <button type="submit" className="add-btn">Add</button>
        </form>

        {error && <div style={{ color: "var(--danger, #dc3545)", marginBottom: 10 }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <div className="filters" role="tablist" aria-label="task filters">
            <button className={`filter ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
            <button className={`filter ${filter === "pending" ? "active" : ""}`} onClick={() => setFilter("pending")}>Pending</button>
            <button className={`filter ${filter === "completed" ? "active" : ""}`} onClick={() => setFilter("completed")}>Completed</button>
          </div>

          <div style={{ fontSize: 13, color: "var(--muted, #666)" }}>
            Total: {total} • Completed: {completedCount} • Pending: {pendingCount}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", gap: 8 }}>
            <div style={{ fontSize: 13, color: "var(--muted, #666)" }}>{filteredTasks.length} shown</div>
            <div><button className="add-btn" style={{ background: "#6b7280" }} onClick={clearCompleted}>Clear completed</button></div>
          </div>

          <div className="task-list" aria-live="polite">
            {filteredTasks.length === 0 ? (
              <div style={{ color: "var(--muted, #666)", padding: 12, textAlign: "center" }}>No tasks found.</div>
            ) : (
              filteredTasks.map((task) => (
                <TaskItem key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
              ))
            )}
          </div>
        </div>
      </main>
    </div> 
  );
}
