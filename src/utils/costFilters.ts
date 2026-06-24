import type { Status } from '../services/api';
import type { DivisionCategory } from './internFilters';

export type CostTypeFilter = '' | 'INSTITUTION' | 'PROFESSIONAL';

export interface CostFilters {
  month: number;
  year: number;
  type: CostTypeFilter;
  division: '' | DivisionCategory;
  status: '' | Status;
}

export const monthOptions = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

export function defaultCostFilters(today = new Date()): CostFilters {
  return {
    month: today.getMonth() + 1,
    year: today.getFullYear(),
    type: '',
    division: '',
    status: '',
  };
}

export function buildCostQuery(filters: CostFilters): Record<string, string> {
  return Object.fromEntries(
    Object.entries({
      month: String(filters.month),
      year: String(filters.year),
      type: filters.type,
      division: filters.division,
      status: filters.status,
    }).filter(([, value]) => value !== ''),
  );
}
