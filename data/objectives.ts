import type { Objective } from '@/app/types/objective';

export const objectivesData: Objective[] = [
  {
    id: 1,
    title: 'Q2 Strategic Planning',
    description: 'Complete quarterly strategic planning and alignment',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-05-30',
    color: 'green',
    tasks: []
  },
  {
    id: 2,
    title: 'Team Development Program',
    description: 'Launch new leadership development initiative',
    status: 'planning',
    priority: 'high',
    dueDate: '2026-06-15',
    color: 'orange',
    tasks: []
  },
  {
    id: 3,
    title: 'Process Optimization',
    description: 'Streamline operational workflows',
    status: 'completed',
    priority: 'medium',
    dueDate: '2026-04-30',
    color: 'yellow',
    tasks: []
  }
];