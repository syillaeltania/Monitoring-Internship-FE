export const toneKeys = ['navy', 'green', 'orange', 'red', 'cyan', 'indigo', 'slate', 'purple'] as const;
export type ToneKey = (typeof toneKeys)[number];

const toneSet = new Set<string>(toneKeys);

export const resolveTone = (tone?: string): ToneKey => (tone && toneSet.has(tone) ? (tone as ToneKey) : 'navy');

export const toneWidgetClass = (tone?: string) =>
  ({
    navy: 'bg-[#F5F0E7] border-[#D6CEC3]',
    green: 'bg-[#ECF8EF] border-[#A8E9BE]',
    orange: 'bg-[#FFF5C8] border-[#F7D95D]',
    red: 'bg-[#FFF0EC] border-[#FF684F]/35',
    cyan: 'bg-[#EEF2FF] border-[#3158E8]/20',
    indigo: 'bg-[#EEF2FF] border-[#3158E8]/20',
    slate: 'bg-[#F5F0E7] border-[#D6CEC3]',
    purple: 'bg-[#F4F0FF] border-[#B9A0F6]/40',
  })[resolveTone(tone)];

export const toneTextClass = (tone?: string) =>
  ({
    navy: 'text-[#10162A]',
    green: 'text-[#2F7F52]',
    orange: 'text-[#8A6A00]',
    red: 'text-[#C64632]',
    cyan: 'text-[#3158E8]',
    indigo: 'text-[#3158E8]',
    slate: 'text-[#77736F]',
    purple: 'text-[#6F54C8]',
  })[resolveTone(tone)];

export const toneAccentClass = (tone?: string) =>
  ({
    navy: 'bg-[#0D1429]',
    green: 'bg-[#8CE0AE]',
    orange: 'bg-[#F7D95D]',
    red: 'bg-[#FF684F]',
    cyan: 'bg-[#3158E8]',
    indigo: 'bg-[#3158E8]',
    slate: 'bg-[#77736F]',
    purple: 'bg-[#B9A0F6]',
  })[resolveTone(tone)];

export const chartPalette = ['#3158E8', '#8CE0AE', '#B9A0F6', '#F7D95D', '#FF684F', '#77736F'];
