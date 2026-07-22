export type WidgetType =
  | 'clock' | 'calculator' | 'timer' | 'photo-frame'
  | 'streaming' | 'youtube' | 'meet' | 'browser' | 'notes'
  | 'netflix' | 'disney' | 'prime' | 'messaging' | 'phone' | 'zoom';

export type LayoutId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface LayoutDef {
  id: LayoutId; name: string; slots: number;
  areas: string; cols: string; rows: string;
}

export type EventColor = 'violet' | 'cyan' | 'pink' | 'amber' | 'emerald';

export type EventType =
  | 'event' | 'reminder' | 'holiday'
  | 'birthday' | 'anniversary' | 'payday' | 'bill'
  | 'todo' | 'shopping' | 'shopping-list' | 'chores' | 'self-care'
  | 'gym' | 'dentist' | 'appointment'
  | 'date-night' | 'trip' | 'special-event';

export type RecurType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CheckItem { id: string; text: string; done: boolean }

export interface CalEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  color: EventColor;
  type: EventType;
  recur: RecurType;
  amount?: number;
  allDay: boolean;
  notes?: string;
  contactId?: string;
  address?: string;
  checklist?: CheckItem[];
}

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export type PlannerType = 'date-night' | 'trip' | 'special-event';

export interface Planner {
  id: string;
  type: PlannerType;
  title: string;
  date: string;
  endDate?: string;
  location?: string;
  notes?: string;
  budget?: number;
  checklist: CheckItem[];
  linkedToCalendar: boolean;
  createdAt: string;
}

export type SkinId =
  | 'auto'
  | 'violet' | 'cyan' | 'pink' | 'amber' | 'emerald'
  | 'fire' | 'ocean' | 'rose' | 'gold' | 'indigo'
  | 'aurora' | 'sunset' | 'night-sky' | 'deep-ocean'
  | 'galaxy' | 'forest' | 'desert' | 'mountain'
  | 'cherry-blossom' | 'winter-snow' | 'tropical-beach'
  | 'rainy-night' | 'fireflies';

export interface SkinColors {
  color: string; glow: string; dim: string;
  isLandscape?: boolean; scene?: string;
}

export interface Photo { id: string; dataUrl: string; name: string }
