export type ChartValueFormat = 'currency' | 'count';

const formatFullRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/\s/g, '');

const formatDecimal = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 1,
  }).format(value);

export const formatCompactNumber = (value: number) => {
  if (Math.abs(value) >= 1000000000) return `${formatDecimal(value / 1000000000)} M`;
  if (Math.abs(value) >= 1000000) return `${formatDecimal(value / 1000000)} jt`;
  if (Math.abs(value) >= 1000) return `${formatDecimal(value / 1000)} rb`;
  return String(value);
};

export const formatChartValue = (value: number, format: ChartValueFormat) =>
  format === 'currency' ? formatFullRupiah(value) : formatCompactNumber(value);
