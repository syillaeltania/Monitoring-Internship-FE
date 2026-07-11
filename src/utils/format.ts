export const rupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

export const dateShort = (value: string) =>
  new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

export const calculateElapsedDuration = (startDate: string, endDate: string): string => {
  const current = new Date();
  const currentUtc = new Date(Date.UTC(current.getFullYear(), current.getMonth(), current.getDate()));
  const start = new Date(startDate);
  const startUtc = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
  const end = new Date(endDate);
  const endUtc = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));

  if (currentUtc < startUtc) return 'Belum Mulai';

  const endCalc = currentUtc > endUtc ? endUtc : currentUtc;

  let months = (endCalc.getUTCFullYear() - startUtc.getUTCFullYear()) * 12 + endCalc.getUTCMonth() - startUtc.getUTCMonth();
  let day = endCalc.getUTCDate() - startUtc.getUTCDate();

  if (day < 0) {
    months -= 1;
    const previousMonthEnd = new Date(Date.UTC(endCalc.getUTCFullYear(), endCalc.getUTCMonth(), 0)).getUTCDate();
    day += previousMonthEnd;
  }

  return `${Math.max(months, 0)} Bulan - ${Math.max(day, 0)} Hari`;
};
