// TaskItem.jsx
//Purpose: Display a single task
// Uses context methods directly
//  Why react.memo?
// Currently, all TaskItem components re-render whenever anything in TasksContext changes
//(even theme changes!)
//before: export default function TaskItem({ task }) {
//after : export default React.memo(TaskItem);  just thia change
// in this  fun all task will be passed as props in app.js file, its job to show those tasks with css, so when the props will change then only this fun rerender otherwise not this is the use of memo here
// If you mark one task as completed, only that task should re-render — not the entire list.

import { useTasks } from "./TasksContext";
import React from "react";


function TaskItem({ task }) {
const { toggleTask, deleteTask } = useTasks();
return (
    //task cn: normal checkbox+taskname+dlt btn
    //task completed cn:  tick checkbox+taskname cross +dlt btn
<div className={`task ${task.completed ? "completed" : ""}`}>
<div className="task-left">
<input
type="checkbox"
checked={!!task.completed}
onChange={() => toggleTask(task.id)}
/>
<div className="title">{task.title}</div>
</div>
<button className="delete-btn" onClick={() => deleteTask(task.id)}>
Delete
</button>
</div>
);
}
export default React.memo(TaskItem); //just this change to user react.memo
