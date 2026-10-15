import { Tone } from './tone';

export const TONE_CLASSES: Record<Tone, { pill: string; dot: string; icon: string }> = {
  neutral: {
    pill: 'bg-line-soft text-label',
    dot: 'bg-subtle',
    icon: 'bg-line-soft text-label',
  },
  info: {
    pill: 'bg-indigo-soft text-indigo-text',
    dot: 'bg-indigo-dot',
    icon: 'bg-indigo-soft text-indigo-text',
  },
  warn: {
    pill: 'bg-warning-soft text-warning-text',
    dot: 'bg-warning',
    icon: 'bg-warning-soft text-warning-text',
  },
  success: {
    pill: 'bg-success-soft text-success-text',
    dot: 'bg-success-dot',
    icon: 'bg-success-soft text-success-text',
  },
  danger: {
    pill: 'bg-danger-soft-alt text-danger-text-alt',
    dot: 'bg-danger-field',
    icon: 'bg-danger-soft-alt text-danger-text-alt',
  },
  teal: {
    pill: 'bg-teal-soft text-teal-text',
    dot: 'bg-teal-dot',
    icon: 'bg-teal-soft text-teal-text',
  },
  purple: {
    pill: 'bg-violet-soft text-violet-text',
    dot: 'bg-violet-dot',
    icon: 'bg-violet-soft text-violet-text',
  },
  orange: {
    pill: 'bg-orange-soft text-orange-text',
    dot: 'bg-orange-dot',
    icon: 'bg-orange-soft text-orange-text',
  },
  primary: {
    pill: 'bg-primary-soft text-indigo-text',
    dot: 'bg-primary',
    icon: 'bg-primary-soft text-primary',
  },
  gray: {
    pill: 'bg-neutral-soft text-muted',
    dot: 'bg-neutral-dot',
    icon: 'bg-neutral-soft text-muted',
  },
};
