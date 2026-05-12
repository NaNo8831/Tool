import type { RichTextValue } from '@/app/types/richText';

export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id: number;
  text: string;
  createdAt: string;
}

export interface TaskActivity {
  id: number;
  message: string;
  createdAt: string;
  type?: 'subtask-completed' | 'subtask-deleted' | 'due-date-changed';
  subtaskId?: number;
  subtaskTitle?: string;
  subtaskCompleted?: boolean;
}

export interface Task {
  id: number;
  title: string;
  description: RichTextValue;
  dueDate: string;
  subtasks: Subtask[];
  comments: TaskComment[];
  activityHistory: TaskActivity[];
  assignedTo: string;
  status: 'planning' | 'in-progress' | 'completed';
}

export interface Objective {
  id: number;
  title: string;
  description: RichTextValue;
  status: 'planning' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  color: 'dark-green' | 'green' | 'yellow' | 'orange' | 'red';
  tasks: Task[];
}

export type ObjectiveColor = Objective['color'];
export type TaskStatus = Task['status'];
