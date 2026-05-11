import type { Objective, TaskStatus } from '@/app/types/objective';
import type { MeetingSectionKey, OrganizationInfo, StandardOperatingObjective } from '@/app/types/dashboard';

export const defaultOrganizationInfo: OrganizationInfo = {
  whyExist: 'To help people encounter Jesus and grow in faith.',
  rallyCry: '',
  howBehave: 'Childlike Hearts • Loyal Servants • Hungry for More',
  whatDo: 'We disciple people, build community, and equip leaders.',
  howSucceed: 'Through intentional leadership and accountability.'
};

export const defaultDashboardTitle = 'Meeting Tool by LyArk';

export const defaultMeetingSectionOrder: MeetingSectionKey[] = ['agenda', 'topic', 'decision', 'cascade'];

export const defaultStandardOperatingObjectives: StandardOperatingObjective[] = [
  {
    id: 1,
    title: 'Identify',
    description: 'Name the recurring work or gap tied to the top priority.'
  },
  {
    id: 2,
    title: 'Document',
    description: 'Capture the simplest repeatable standard for the team.'
  },
  {
    id: 3,
    title: 'Assign',
    description: 'Clarify the owner and where follow-up actions live.'
  },
  {
    id: 4,
    title: 'Review',
    description: 'Inspect adoption and update the SOP when reality changes.'
  }
];

export const taskStatusOptions: TaskStatus[] = ['planning', 'in-progress', 'waiting', 'completed'];

export const objectiveColorClasses: Record<Objective['color'], string> = {
  'dark-green': 'border-emerald-700',
  green: 'border-emerald-500',
  yellow: 'border-yellow-400',
  orange: 'border-orange-500',
  red: 'border-red-500'
};
