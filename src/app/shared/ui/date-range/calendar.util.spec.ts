import { daysBetween } from './calendar.util';

describe('daysBetween', () => {
  it('counts both ends of the range, across months', () => {
    expect(daysBetween('2026-10-06', '2026-10-06')).toBe(1);
    expect(daysBetween('2026-09-09', '2026-09-18')).toBe(10);
    expect(daysBetween('2026-09-30', '2026-10-06')).toBe(7);
  });
});
