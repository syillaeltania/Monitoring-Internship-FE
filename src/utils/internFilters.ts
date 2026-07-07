import type { Intern, Status } from '../services/api';

export const divisionCategories = ['CORE', 'NB', 'TELCO', 'BUSDEV', 'MSOS'] as const;
export type DivisionCategory = (typeof divisionCategories)[number];

export interface InternFilters {
  search: string;
  type: '' | Intern['type'];
  division: '' | DivisionCategory;
  team: string;
  status: '' | Status;
}

export type InternSortOption = 'startDateDesc' | 'startDateAsc' | 'endDateDesc' | 'endDateAsc';

export function normalizeDivision(value: string): DivisionCategory | '' {
  const normalized = value.trim().toUpperCase().replace(/\s+/g, ' ');
  if (normalized === 'NEW BUSINESS' || normalized === 'NB') return 'NB';
  if (normalized === 'TELCO') return 'TELCO';
  if (normalized === 'BUSDEV') return 'BUSDEV';
  if (normalized === 'CORE') return 'CORE';
  if (normalized === 'MSOS') return 'MSOS';
  return '';
}

export function filterInterns(interns: Intern[], filters: InternFilters): Intern[] {
  const search = filters.search.trim().toLowerCase();
  const division = filters.division.trim();
  const team = filters.team.trim();

  return interns
    .filter((item) => !search || item.name.toLowerCase().includes(search))
    .filter((item) => !filters.type || item.type === filters.type)
    .filter((item) => !division || normalizeDivision(item.division) === division)
    .filter((item) => !team || item.team === team)
    .filter((item) => !filters.status || item.status === filters.status);
}

export function sortInterns(interns: Intern[], sortBy: InternSortOption): Intern[] {
  const field: 'startDate' | 'endDate' = sortBy.startsWith('endDate') ? 'endDate' : 'startDate';
  const direction: 'asc' | 'desc' = sortBy.endsWith('Desc') ? 'desc' : 'asc';

  return [...interns].sort((a, b) => {
    const left = new Date(a[field]).getTime();
    const right = new Date(b[field]).getTime();
    const dateResult = direction === 'desc' ? right - left : left - right;
    return dateResult || a.name.localeCompare(b.name);
  });
}

export function uniqueDivisions(interns: Intern[]): string[] {
  return [...divisionCategories];
}

export function uniqueTeams(interns: Intern[], division = ''): string[] {
  return [
    ...new Set(
      interns
        .filter((item) => !division || normalizeDivision(item.division) === division)
        .map((item) => item.team)
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b));
}

export function uniqueLeaders(interns: Intern[], team = ''): string[] {
  return [
    ...new Set(
      interns
        .filter((item) => !team || item.team === team)
        .map((item) => item.leader)
        .filter(Boolean) as string[],
    ),
  ].sort((a, b) => a.localeCompare(b));
}
