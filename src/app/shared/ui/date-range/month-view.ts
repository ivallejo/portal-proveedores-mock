import { DayCell } from './day-cell';

export interface MonthView {
  key: string;
  title: string;
  cells: (DayCell | null)[];
}
