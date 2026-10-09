export interface DayCell {
  iso: string;
  label: string;
  day: number;
  disabled: boolean;
  isEnd: boolean;
  inRange: boolean;
  bandLeft: boolean;
  bandRight: boolean;
  isToday: boolean;
  weekend: boolean;
}
