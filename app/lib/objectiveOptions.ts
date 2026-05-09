import type { Objective, TaskStatus } from '@/app/types/objective';
import type { MeetingSectionKey, OrganizationInfo } from '@/app/types/dashboard';

export const defaultOrganizationInfo: OrganizationInfo = {
  whyExist: 'To help people encounter Jesus and grow in faith.',
  howBehave: 'Childlike Hearts • Loyal Servants • Hungry for More',
  whatDo: 'We disciple people, build community, and equip leaders.',
  howSucceed: 'Through intentional leadership and accountability.'
};

export const defaultDashboardTitle = 'Leadership Objectives Dashboard';

export const defaultMeetingSectionOrder: MeetingSectionKey[] = ['agenda', 'topic', 'decision', 'cascade'];

export const taskStatusOptions: TaskStatus[] = ['planning', 'in-progress', 'waiting', 'completed'];

export const objectiveColorClasses: Record<Objective['color'], string> = {
  'dark-green': 'border-emerald-700',
  green: 'border-emerald-500',
  yellow: 'border-yellow-400',
  orange: 'border-orange-500',
  red: 'border-red-500'
};
