'use client';

import { taskStatusOptions } from '@/app/lib/objectiveOptions';
import type { Objective, Task } from '@/app/types/objective';
import type { TaskInput } from '@/app/types/dashboard';

interface TaskListProps {
  objective: Objective;
  taskInput: TaskInput | undefined;
  onTaskInputChange: (objectiveId: number, input: TaskInput) => void;
  onAddTask: (objectiveId: number, taskTitle: string, assignedTo: string) => void;
  onOpenTask: (objectiveId: number, taskId: number) => void;
}

const statusLabels: Record<Task['status'], string> = {
  planning: 'Planning',
  'in-progress': 'In Progress',
  waiting: 'Waiting',
  completed: 'Completed'
};

export function TaskList({
  objective,
  taskInput,
  onTaskInputChange,
  onAddTask,
  onOpenTask
}: TaskListProps) {
  const title = taskInput?.title || '';
  const assignedTo = taskInput?.assignedTo || '';

  const addCurrentTask = () => {
    onAddTask(objective.id, title, assignedTo);
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {taskStatusOptions.map((status) => (
          <div key={status} className="bg-slate-100 rounded-2xl p-4 min-h-[180px]">
            <h4 className="font-semibold mb-4 text-slate-800">{statusLabels[status]}</h4>
            <div className="space-y-3">
              {objective.tasks.filter((task) => task.status === status).map((task) => {
                const completedSubtasks = (task.subtasks ?? []).filter((subtask) => subtask.completed).length;
                const subtaskCount = task.subtasks?.length ?? 0;

                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onOpenTask(objective.id, task.id)}
                    className="w-full rounded-xl bg-white p-3 text-left text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <div className="font-semibold text-slate-900">{task.title || 'Untitled task'}</div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-slate-100 px-2 py-1">
                        {task.assignedTo || 'Unassigned'}
                      </span>
                      {task.dueDate ? (
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">Due {task.dueDate}</span>
                      ) : null}
                      {subtaskCount > 0 ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                          {completedSubtasks}/{subtaskCount} subtasks
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h4 className="font-semibold text-slate-900">Add Task</h4>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[2fr_1fr_auto]">
          <input
            value={title}
            onChange={(e) => onTaskInputChange(objective.id, { title: e.target.value, assignedTo })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCurrentTask();
              }
            }}
            placeholder="Task title"
            className="px-3 py-3 border border-slate-300 rounded text-slate-900"
          />
          <input
            value={assignedTo}
            onChange={(e) => onTaskInputChange(objective.id, { title, assignedTo: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCurrentTask();
              }
            }}
            placeholder="Assign to (optional)"
            className="px-3 py-3 border border-slate-300 rounded text-slate-900"
          />
          <button
            type="button"
            onClick={addCurrentTask}
            className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>
    </>
  );
}
