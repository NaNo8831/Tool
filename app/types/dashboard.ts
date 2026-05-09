import type { Dispatch, SetStateAction } from 'react';

export interface OrganizationInfo {
  whyExist: string;
  howBehave: string;
  whatDo: string;
  howSucceed: string;
}

export interface MeetingItem {
  id: number;
  text: string;
}

export type MeetingSectionKey = 'agenda' | 'topic' | 'decision' | 'cascade';

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
