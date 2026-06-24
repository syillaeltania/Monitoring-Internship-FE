export const toneKeys = ['navy', 'green', 'orange', 'red', 'cyan', 'indigo', 'slate', 'purple'] as const;
export type ToneKey = (typeof toneKeys)[number];

const toneSet = new Set<string>(toneKeys);

export const resolveTone = (tone?: string): ToneKey => (tone && toneSet.has(tone) ? (tone as ToneKey) : 'navy');

export const toneWidgetClass = (tone?: string) =>
  ({
    navy: 'from-blue-50 via-white to-white ring-blue-100',
    green: 'from-emerald-50 via-white to-white ring-emerald-100',
    orange: 'from-amber-50 via-white to-white ring-amber-100',
    red: 'from-red-50 via-white to-white ring-red-100',
    cyan: 'from-cyan-50 via-white to-white ring-cyan-100',
    indigo: 'from-indigo-50 via-white to-white ring-indigo-100',
    slate: 'from-slate-100 via-white to-white ring-slate-200',
    purple: 'from-violet-50 via-white to-white ring-violet-100',
  })[resolveTone(tone)];

export const toneTextClass = (tone?: string) =>
  ({
    navy: 'text-navy',
    green: 'text-success',
    orange: 'text-amber-600',
    red: 'text-danger',
    cyan: 'text-cyan-700',
    indigo: 'text-indigo-700',
    slate: 'text-slate-700',
    purple: 'text-violet-700',
  })[resolveTone(tone)];

export const toneAccentClass = (tone?: string) =>
  ({
    navy: 'bg-navy',
    green: 'bg-success',
    orange: 'bg-amber-500',
    red: 'bg-danger',
    cyan: 'bg-cyan-500',
    indigo: 'bg-indigo-600',
    slate: 'bg-slate-500',
    purple: 'bg-violet-600',
  })[resolveTone(tone)];

export const chartPalette = ['#1f9d6a', '#2563eb', '#0891b2', '#d98c00', '#7c3aed', '#c2413a'];
