import type { Dispatch, SetStateAction } from 'react';
import type { RichTextValue } from '@/app/types/richText';

export interface OrganizationInfo {
  whyExist: string;
  rallyCry: string;
  howBehave: RichTextValue;
  whatDo: RichTextValue;
  howSucceed: RichTextValue;
}

export interface MeetingItem {
  id: number;
  text: string;
}

export type MeetingSectionKey = 'agenda' | 'topic' | 'decision' | 'cascade';

export interface MeetingRecord {
  id: number;
  date: string;
  agendaItems: MeetingItem[];
  topicItems: MeetingItem[];
  decisionItems: MeetingItem[];
  cascadeItems: MeetingItem[];
}

export interface MeetingSectionConfig {
  id: MeetingSectionKey;
  title: string;
  description: string;
  items: MeetingItem[];
  newItem: string;
  setNewItem: Dispatch<SetStateAction<string>>;
  addItem: () => void;
  updateItem: (itemId: number, value: string) => void;
  deleteItem: (itemId: number) => void;
  placeholder: string;
  editPlaceholder: string;
}

export interface TaskInput {
  title: string;
  assignedTo: string;
}
