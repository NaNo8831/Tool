import type { Objective, ObjectiveColor, TaskStatus } from '@/app/types/objective';
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
    description: 'Name the recurring work or gap tied to the top priority.',
    color: 'green'
  },
  {
    id: 2,
    title: 'Document',
    description: 'Capture the simplest repeatable standard for the team.',
    color: 'yellow'
  },
  {
    id: 3,
    title: 'Assign',
    description: 'Clarify the owner and where follow-up actions live.',
    color: 'orange'
  },
  {
    id: 4,
    title: 'Review',
    description: 'Inspect adoption and update the SOP when reality changes.',
    color: 'dark-green'
  }
];

export const taskStatusOptions: TaskStatus[] = ['planning', 'in-progress', 'completed'];

export const objectiveColorOptions: Array<{
  value: ObjectiveColor;
  label: string;
  borderClass: string;
  swatchClass: string;
}> = [
  { value: 'dark-green', label: 'Dark Green', borderClass: 'border-emerald-700', swatchClass: 'bg-emerald-700' },
  { value: 'green', label: 'Green', borderClass: 'border-emerald-600', swatchClass: 'bg-emerald-600' },
  { value: 'yellow', label: 'Yellow', borderClass: 'border-yellow-400', swatchClass: 'bg-yellow-400' },
  { value: 'orange', label: 'Orange', borderClass: 'border-orange-500', swatchClass: 'bg-orange-500' },
  { value: 'red', label: 'Red', borderClass: 'border-red-500', swatchClass: 'bg-red-500' }
];

export const defaultObjectiveColor: ObjectiveColor = 'green';

export const objectiveColorClasses: Record<Objective['color'], string> = objectiveColorOptions.reduce(
  (classes, option) => ({ ...classes, [option.value]: option.borderClass }),
  {} as Record<Objective['color'], string>
);
