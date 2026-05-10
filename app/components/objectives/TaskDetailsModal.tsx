'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { taskStatusOptions } from '@/app/lib/objectiveOptions';
import { MarkdownPreview } from '@/app/components/ui/MarkdownPreview';
import type { Subtask, Task, TaskComment } from '@/app/types/objective';

interface TaskDetailsModalProps {
  task: Task;
  objectiveTitle: string;
  onClose: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Task>) => void;
}

type SaveStatus = 'saving' | 'saved';

const statusLabels: Record<Task['status'], string> = {
  planning: 'Planning',
  'in-progress': 'In Progress',
  waiting: 'Waiting',
  completed: 'Completed'
};

export function TaskDetailsModal({ task, objectiveTitle, onClose, onDelete, onUpdate }: TaskDetailsModalProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const subtasks = useMemo(() => task.subtasks ?? [], [task.subtasks]);
  const comments = useMemo(() => task.comments ?? [], [task.comments]);
  const saveStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextSubtaskIdRef = useRef(Math.max(0, ...subtasks.map((subtask) => subtask.id)) + 1);
  const nextCommentIdRef = useRef(Math.max(0, ...comments.map((comment) => comment.id)) + 1);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    nextSubtaskIdRef.current = Math.max(
      nextSubtaskIdRef.current,
      Math.max(0, ...subtasks.map((subtask) => subtask.id)) + 1
    );
  }, [subtasks]);

  useEffect(() => {
    nextCommentIdRef.current = Math.max(
      nextCommentIdRef.current,
      Math.max(0, ...comments.map((comment) => comment.id)) + 1
    );
  }, [comments]);

  useEffect(() => () => {
    if (saveStatusTimeoutRef.current) {
      clearTimeout(saveStatusTimeoutRef.current);
    }
  }, []);

  const handleUpdate = (updates: Partial<Task>) => {
    onUpdate(updates);
    setSaveStatus('saving');

    if (saveStatusTimeoutRef.current) {
      clearTimeout(saveStatusTimeoutRef.current);
    }

    saveStatusTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saved');
    }, 500);
  };

  const updateSubtasks = (updatedSubtasks: Subtask[]) => {
    handleUpdate({ subtasks: updatedSubtasks });
  };

  const updateComments = (updatedComments: TaskComment[]) => {
    handleUpdate({ comments: updatedComments });
  };

  const addSubtask = () => {
    const title = newSubtaskTitle.trim();
    if (!title) return;

    updateSubtasks([
      ...subtasks,
      {
        id: nextSubtaskIdRef.current++,
        title,
        completed: false
      }
    ]);
    setNewSubtaskTitle('');
  };

  const updateSubtask = (subtaskId: number, updates: Partial<Subtask>) => {
    updateSubtasks(subtasks.map((subtask) => (
      subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
    )));
  };

  const deleteSubtask = (subtaskId: number) => {
    updateSubtasks(subtasks.filter((subtask) => subtask.id !== subtaskId));
  };

  const addComment = () => {
    const text = newCommentText.trim();
    if (!text) return;

    updateComments([
      ...comments,
      {
        id: nextCommentIdRef.current++,
        text,
        createdAt: new Date().toISOString()
      }
    ]);
    setNewCommentText('');
  };

  const deleteComment = (commentId: number) => {
    updateComments(comments.filter((comment) => comment.id !== commentId));
  };

  const formatCommentTimestamp = (createdAt: string) => {
    const timestamp = new Date(createdAt);
    if (Number.isNaN(timestamp.getTime())) return 'Unknown time';

    return timestamp.toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-details-title"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task details</p>
            <p className="text-sm text-slate-500">{objectiveTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
              role="status"
              aria-live="polite"
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              aria-label="Close task details"
            >
              Close
            </button>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_280px]">
          <section className="space-y-6">
            <label className="block">
              <span className="sr-only">Task title</span>
              <input
                id="task-details-title"
                value={task.title}
                onChange={(event) => handleUpdate({ title: event.target.value })}
                placeholder="Task title"
                className="w-full rounded-2xl border border-transparent px-1 py-2 text-3xl font-bold text-slate-950 outline-none hover:border-slate-200 focus:border-blue-400 focus:bg-blue-50/40"
              />
            </label>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Description</span>
                <textarea
                  value={task.description ?? ''}
                  onChange={(event) => handleUpdate({ description: event.target.value })}
                  placeholder="Add context, goals, links, or acceptance criteria for this task."
                  rows={8}
                  className="w-full resize-y rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <p className="text-xs text-slate-500">
                Markdown-style notes are supported: # headings, **bold**, *italic*, `code`, - bullets, 1. steps, and links.
              </p>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-800">Description preview</h3>
                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    Markdown
                  </span>
                </div>
                {task.description?.trim() ? (
                  <MarkdownPreview value={task.description} />
                ) : (
                  <p className="text-sm text-slate-500">Preview appears here as you add description details.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">Comments</h3>
                  <p className="text-sm text-slate-500">Add timestamped notes without changing the task description.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                </span>
              </div>

              <div className="space-y-3">
                <textarea
                  value={newCommentText}
                  onChange={(event) => setNewCommentText(event.target.value)}
                  placeholder="Write a new comment for this task."
                  rows={3}
                  className="w-full resize-y rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addComment}
                    disabled={!newCommentText.trim()}
                    className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Add Comment
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {comments.length > 0 ? comments.map((comment) => (
                  <article key={comment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <time className="text-xs font-medium text-slate-500" dateTime={comment.createdAt}>
                        {formatCommentTimestamp(comment.createdAt)}
                      </time>
                      <button
                        type="button"
                        onClick={() => deleteComment(comment.id)}
                        className="rounded-full px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        aria-label={`Delete comment from ${formatCommentTimestamp(comment.createdAt)}`}
                      >
                        Delete
                      </button>
                    </div>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{comment.text}</p>
                  </article>
                )) : (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                    No comments yet. Add the first task comment above.
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">Subtasks</h3>
                  <p className="text-sm text-slate-500">Break this work into trackable next steps.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {subtasks.filter((subtask) => subtask.completed).length}/{subtasks.length} done
                </span>
              </div>

              <div className="space-y-2">
                {subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={(event) => updateSubtask(subtask.id, { completed: event.target.checked })}
                      className="h-5 w-5 rounded border-slate-300"
                      aria-label={`Mark ${subtask.title} complete`}
                    />
                    <input
                      value={subtask.title}
                      onChange={(event) => updateSubtask(subtask.id, { title: event.target.value })}
                      className={`min-w-0 flex-1 bg-transparent text-slate-900 outline-none ${subtask.completed ? 'line-through text-slate-500' : ''}`}
                      aria-label="Subtask title"
                    />
                    <button
                      type="button"
                      onClick={() => deleteSubtask(subtask.id)}
                      className="rounded-full px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  value={newSubtaskTitle}
                  onChange={(event) => setNewSubtaskTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addSubtask();
                    }
                  }}
                  placeholder="Add a subtask"
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-slate-900"
                />
                <button
                  type="button"
                  onClick={addSubtask}
                  className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </section>

          <aside className="space-y-4 rounded-3xl bg-slate-50 p-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Status</span>
              <select
                value={task.status}
                onChange={(event) => handleUpdate({ status: event.target.value as Task['status'] })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
              >
                {taskStatusOptions.map((status) => (
                  <option key={status} value={status}>{statusLabels[status]}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Assigned person</span>
              <input
                value={task.assignedTo ?? ''}
                onChange={(event) => handleUpdate({ assignedTo: event.target.value })}
                placeholder="Unassigned"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Due date</span>
              <input
                type="date"
                value={task.dueDate ?? ''}
                onChange={(event) => handleUpdate({ dueDate: event.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
              />
            </label>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Card preview</p>
              <p className="mt-2 line-clamp-2">{task.title || 'Untitled task'}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-slate-400">Details auto-save to this objective.</p>
            </div>

            <button
              type="button"
              onClick={onDelete}
              className="w-full rounded-xl border border-red-200 bg-white px-4 py-2 font-medium text-red-600 hover:bg-red-50"
            >
              Delete task
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
