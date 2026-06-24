export const toneKeys = ['navy', 'green', 'orange', 'red', 'cyan', 'indigo', 'slate', 'purple'] as const;
export type ToneKey = (typeof toneKeys)[number];

const toneSet = new Set<string>(toneKeys);

export const resolveTone = (tone?: string): ToneKey => (tone && toneSet.has(tone) ? (tone as ToneKey) : 'navy');

export const toneWidgetClass = (tone?: string) =>
  ({
    navy: 'bg-blue-50 border-blue-100',
    green: 'bg-emerald-50 border-emerald-100',
    orange: 'bg-amber-50 border-amber-100',
    red: 'bg-red-50 border-red-100',
    cyan: 'bg-cyan-50 border-cyan-100',
    indigo: 'bg-indigo-50 border-indigo-100',
    slate: 'bg-slate-50 border-slate-200',
    purple: 'bg-violet-50 border-violet-100',
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
