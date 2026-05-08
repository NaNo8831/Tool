export interface Objective {
  id: number;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
}

export const objectivesData: Objective[] = [
  {
    id: 1,
    title: "Q2 Strategic Planning",
    description: "Complete quarterly strategic planning and alignment",
    status: "in-progress",
    priority: "high",
    dueDate: "2026-05-30"
  },
  {
    id: 2,
    title: "Team Development Program",
    description: "Launch new leadership development initiative",
    status: "planning",
    priority: "high",
    dueDate: "2026-06-15"
  },
  {
    id: 3,
    title: "Process Optimization",
    description: "Streamline operational workflows",
    status: "completed",
    priority: "medium",
    dueDate: "2026-04-30"
  }
];