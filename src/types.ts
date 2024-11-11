export interface Task {
  id: string;
  title: string;
  interval: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastCompleted?: Date;
  nextDue: Date;
  completed: boolean;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  wasteScheduleUrl?: string;
  tasks: Task[];
}