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

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  subtasks: Subtask[];
  comments: TaskComment[];
  assignedTo: string;
  status: 'planning' | 'in-progress' | 'waiting' | 'completed';
}

export interface Objective {
  id: number;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  color: 'dark-green' | 'green' | 'yellow' | 'orange' | 'red';
  tasks: Task[];
}

export type ObjectiveColor = Objective['color'];
export type TaskStatus = Task['status'];
