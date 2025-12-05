//only syntax change  to use usecallback instead of normal func , and usememeo for expensive calculation
// why to use usecallback :
// Inside TasksProvider, these functions are recreated on every render:
// addTask
// toggleTask
// deleteTask
// clearCompleted
// toggleTheme
// You can wrap them in useCallback so TaskItem (and other subscribers) do not re-render unnecessarily.
//earlier function bnyae the addtask, dlttask.. now onhi fun ko usecalback me dala hai bas only sytax change
//usememo {for expensive calcu}


import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

const TasksContext = createContext(null);

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used inside TasksProvider");
  return ctx;
}

export function TasksProvider({ children }) {
  // persistent state hooks
  const [tasks, setTasks] = useLocalStorage("simple-tasks", []);
  const [theme, setTheme] = useLocalStorage("theme:v1", "light");
  const [filter, setFilter] = React.useState("all"); // all | pending | completed

  // --- stable callbacks (useCallback) ---
  const addTask = useCallback(
    (title) => {
      const trimmed = (title ?? "").trim();
      if (!trimmed) return { ok: false, error: "Please enter a task." };

      const id = Date.now().toString() + Math.random().toString(36).slice(2);
      setTasks((prev) => [{ id, title: trimmed, completed: false }, ...prev]);
      return { ok: true };
    },
    [setTasks]
  );

  const toggleTask = useCallback(
    (id) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    },
    [setTasks]
  );

  const deleteTask = useCallback(
    (id) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [setTasks]
  );

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  }, [setTasks]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, [setTheme]);

  // --- derived values memoized (useMemo) ---
  const total = useMemo(() => tasks.length, [tasks]);

  const completedCount = useMemo(
    () => tasks.reduce((acc, t) => acc + (t.completed ? 1 : 0), 0),
    [tasks]
  );

  const pendingCount = useMemo(() => total - completedCount, [
    total,
    completedCount,
  ]);

  const filteredTasks = useMemo(() => {
    if (filter === "pending") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  // memoize the entire context value so components only re-render when a relevant item changes
  const value = useMemo(
    () => ({
      // state
      tasks,
      filteredTasks,
      theme,
      filter,

      // actions
      addTask,
      toggleTask,
      deleteTask,
      clearCompleted,
      toggleTheme,
      setFilter,

      // stats
      total,
      completedCount,
      pendingCount,
    }),
    [
      // values that, when changed, should update consumers
      tasks,
      filteredTasks,
      theme,
      filter,
      addTask,
      toggleTask,
      deleteTask,
      clearCompleted,
      toggleTheme,
      setFilter,
      total,
      completedCount,
      pendingCount,
    ]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}
