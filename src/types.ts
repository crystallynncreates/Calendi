export type WidgetType =
  | 'clock'
  | 'calculator'
  | 'timer'
  | 'photo-frame'
  | 'netflix'
  | 'disney'
  | 'prime'
  | 'meet'
  | 'zoom'
  | 'messaging'
  | 'phone';

export type LayoutId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface LayoutDef {
  id: LayoutId;
  name: string;
  slots: number;
  areas: string;
  cols: string;
  rows: string;
}

export type EventColor = 'violet' | 'cyan' | 'pink' | 'amber' | 'emerald';
export type EventType = 'event' | 'bill' | 'birthday' | 'anniversary' | 'payday' | 'reminder' | 'holiday';
export type RecurType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

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
}

export type SkinId = 'violet' | 'cyan' | 'pink' | 'amber' | 'auto';

export interface Photo {
  id: string;
  dataUrl: string;
  name: string;
}
