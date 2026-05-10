'use client';

import { useState, type DragEvent } from 'react';
import { EditableField } from '@/app/components/ui/EditableField';
import { RichTextEditor } from '@/app/components/ui/RichTextEditor';
import { TaskList } from '@/app/components/objectives/TaskList';
import { objectiveColorClasses } from '@/app/lib/objectiveOptions';
import type { Objective, TaskStatus } from '@/app/types/objective';
import type { TaskInput } from '@/app/types/dashboard';
import type { RichTextDocument } from '@/app/types/richText';

interface ObjectiveCardProps {
  objective: Objective;
  taskInput: TaskInput | undefined;
  onDragStart: (id: number) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (id: number) => void;
  onUpdateTitle: (id: number, title: string) => void;
  onUpdateDescription: (id: number, description: RichTextDocument) => void;
  onUpdateColor: (id: number, color: Objective['color']) => void;
  onDelete: (id: number) => void;
  onTaskInputChange: (objectiveId: number, input: TaskInput) => void;
  onAddTask: (objectiveId: number, taskTitle: string, assignedTo: string) => void;
  onOpenTask: (objectiveId: number, taskId: number) => void;
  onTaskStatusChange: (objectiveId: number, taskId: number, status: TaskStatus) => void;
}

export function ObjectiveCard({
  objective,
  taskInput,
  onDragStart,
  onDragOver,
  onDrop,
  onUpdateTitle,
  onUpdateDescription,
  onUpdateColor,
  onDelete,
  onTaskInputChange,
  onAddTask,
  onOpenTask,
  onTaskStatusChange
}: ObjectiveCardProps) {
  const [isEditingRichText, setIsEditingRichText] = useState(false);

  return (
    <div
      draggable={!isEditingRichText}
      onDragStart={() => {
        if (isEditingRichText) return;
        onDragStart(objective.id);
      }}
      onDragOver={onDragOver}
      onDrop={() => onDrop(objective.id)}
      className={`relative rounded-3xl p-6 shadow bg-white/80 backdrop-blur-sm border-t-[18px] ${objectiveColorClasses[objective.color]} ${isEditingRichText ? 'cursor-default' : 'cursor-grab'} transition hover:shadow-xl`}
    >
      <div className="pr-14 mb-5">
        <EditableField
          value={objective.title}
          onSave={(value) => onUpdateTitle(objective.id, value)}
          placeholder="Objective title"
          className="text-2xl font-semibold text-slate-900 mb-3"
        />
        <RichTextEditor
          value={objective.description}
          onChange={(value) => onUpdateDescription(objective.id, value)}
          placeholder="Objective description"
          className="text-slate-700"
          minHeightClassName="min-h-[120px]"
          ariaLabel="Objective description"
          onEditingChange={setIsEditingRichText}
        />
      </div>

      <button
        type="button"
        onClick={() => onDelete(objective.id)}
        className="absolute right-5 top-5 w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center hover:bg-red-200"
        aria-label="Delete objective"
      >
        ×
      </button>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm font-semibold text-slate-700">Status</label>
          <select
            value={objective.color}
            onChange={(e) => onUpdateColor(objective.id, e.target.value as Objective['color'])}
            className="border rounded-xl px-3 py-2 bg-white text-slate-900"
          >
            <option value="dark-green">Dark Green</option>
            <option value="green">Green</option>
            <option value="yellow">Yellow</option>
            <option value="orange">Orange</option>
            <option value="red">Red</option>
          </select>
        </div>
        <div className="text-sm text-slate-500">Drag the section to reorder</div>
      </div>

      <TaskList
        objective={objective}
        taskInput={taskInput}
        onTaskInputChange={onTaskInputChange}
        onAddTask={onAddTask}
        onOpenTask={onOpenTask}
        onTaskStatusChange={onTaskStatusChange}
      />
    </div>
  );
}
