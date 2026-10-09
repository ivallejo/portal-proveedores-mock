import { Tone } from './tone';

export const TONE_CLASSES: Record<Tone, { pill: string; dot: string; icon: string }> = {
  neutral: {
    pill: 'bg-[#EEF0F3] text-[#3B4658]',
    dot: 'bg-[#6B7588]',
    icon: 'bg-[#EEF0F3] text-[#3B4658]',
  },
  info: {
    pill: 'bg-[#E6EEFF] text-[#1E3FA8]',
    dot: 'bg-[#3B6BF0]',
    icon: 'bg-[#E6EEFF] text-[#1E3FA8]',
  },
  warn: {
    pill: 'bg-[#FFF1DC] text-[#8A4B00]',
    dot: 'bg-[#E08A1E]',
    icon: 'bg-[#FFF1DC] text-[#8A4B00]',
  },
  success: {
    pill: 'bg-[#E3F5EA] text-[#13653A]',
    dot: 'bg-[#22A05A]',
    icon: 'bg-[#E3F5EA] text-[#13653A]',
  },
  danger: {
    pill: 'bg-[#FDE8E8] text-[#A51E1E]',
    dot: 'bg-[#E04848]',
    icon: 'bg-[#FDE8E8] text-[#A51E1E]',
  },
  teal: {
    pill: 'bg-[#DFF4F4] text-[#0B5E61]',
    dot: 'bg-[#1B9AA0]',
    icon: 'bg-[#DFF4F4] text-[#0B5E61]',
  },
  purple: {
    pill: 'bg-[#EDE7FB] text-[#5B3AA8]',
    dot: 'bg-[#7C5CD6]',
    icon: 'bg-[#EDE7FB] text-[#5B3AA8]',
  },
  orange: {
    pill: 'bg-[#FFE9D9] text-[#9A3412]',
    dot: 'bg-[#EA580C]',
    icon: 'bg-[#FFE9D9] text-[#9A3412]',
  },
  primary: {
    pill: 'bg-[#E8F0FE] text-[#1E3FA8]',
    dot: 'bg-[#1668E3]',
    icon: 'bg-[#E8F0FE] text-[#1668E3]',
  },
  gray: {
    pill: 'bg-[#F1F3F6] text-[#5A6477]',
    dot: 'bg-[#8A93A3]',
    icon: 'bg-[#F1F3F6] text-[#5A6477]',
  },
};
