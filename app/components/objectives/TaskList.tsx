'use client';

import { EditableField } from '@/app/components/ui/EditableField';
import { taskStatusOptions } from '@/app/lib/objectiveOptions';
import type { Objective, Task } from '@/app/types/objective';
import type { TaskInput } from '@/app/types/dashboard';

interface TaskListProps {
  objective: Objective;
  taskInput: TaskInput | undefined;
  onTaskInputChange: (objectiveId: number, input: TaskInput) => void;
  onAddTask: (objectiveId: number, taskTitle: string, assignedTo: string) => void;
  onUpdateTaskStatus: (objectiveId: number, taskId: number, status: Task['status']) => void;
  onUpdateTaskTitle: (objectiveId: number, taskId: number, title: string) => void;
  onUpdateTaskAssignee: (objectiveId: number, taskId: number, assignee: string) => void;
  onDeleteTask: (objectiveId: number, taskId: number) => void;
}

export function TaskList({
  objective,
  taskInput,
  onTaskInputChange,
  onAddTask,
  onUpdateTaskStatus,
  onUpdateTaskTitle,
  onUpdateTaskAssignee,
  onDeleteTask
}: TaskListProps) {
  const title = taskInput?.title || '';
  const assignedTo = taskInput?.assignedTo || '';

  const addCurrentTask = () => {
    onAddTask(objective.id, title, assignedTo);
  };

  return (
    <>
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {taskStatusOptions.map((status) => (
          <div key={status} className="bg-slate-100 rounded-2xl p-4 min-h-[180px]">
            <h4 className="font-semibold mb-4 capitalize text-slate-800">{status.replace('-', ' ')}</h4>
            <div className="space-y-3">
              {objective.tasks.filter((task) => task.status === status).map((task) => (
                <div key={task.id} className="bg-white rounded-xl p-3 shadow-sm text-slate-800">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <EditableField
                      value={task.title}
                      onSave={(value) => onUpdateTaskTitle(objective.id, task.id, value)}
                      placeholder="Task title"
                      className="font-semibold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => onDeleteTask(objective.id, task.id)}
                      className="text-red-500 text-xs hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                  <EditableField
                    value={task.assignedTo || ''}
                    onSave={(value) => onUpdateTaskAssignee(objective.id, task.id, value)}
                    placeholder="Assign to (optional)"
                    className="text-slate-600"
                  />
                  <select
                    value={task.status}
                    onChange={(e) => onUpdateTaskStatus(objective.id, task.id, e.target.value as Task['status'])}
                    className="w-full mt-3 text-xs border rounded px-2 py-2"
                  >
                    <option value="planning">Planning</option>
                    <option value="in-progress">In Progress</option>
                    <option value="waiting">Waiting</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              ))}
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
