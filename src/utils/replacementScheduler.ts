import type { Intern } from '../services/api';
import { normalizeDivision } from './internFilters';

export type ReplacementStatus = 'URGENT_EMPTY' | 'NEEDS_REPLACEMENT' | 'COVERED';
export type ReplacementCellTone = 'empty' | 'active' | 'ending' | 'multi';

export interface ReplacementSourceRow {
  id: string;
  division: string;
  team: string;
  leader?: string;
  notes?: string;
  activeInstitutionCount?: number;
  activeProfessionalCount?: number;
  minimumInstitutionNeed?: number;
  endingInternName?: string;
  soonestEndDate?: string | null;
  replacementStatus?: ReplacementStatus;
  replacementCandidate?: string;
  hcmPic?: string;
}

export interface SchedulerRow extends ReplacementSourceRow {
  division: string;
  team: string;
  leader: string;
  notes: string;
  activeInstitutionCount: number;
  activeProfessionalCount: number;
  minimumInstitutionNeed: number;
  replacementStatus: ReplacementStatus;
  replacementCandidate: string;
  hcmPic: string;
}

export interface EndingSoonReminder {
  id: string;
  internId: string;
  name: string;
  institution: string;
  division: string;
  team: string;
  leader: string;
  endDate: string;
  daysLeft: number;
  replacementStatus: 'NEEDS_REPLACEMENT';
  message: string;
}

export type ReplacementBoardColumn = 'urgent' | 'h30' | 'h90' | 'safe';

export interface ReplacementBoardItem {
  id: string;
  division: string;
  team: string;
  leader: string;
  activeInstitutionCount: number;
  activeProfessionalCount: number;
  minimumInstitutionNeed: number;
  endingInternName: string;
  soonestEndDate: string | null;
  daysLeft: number | null;
  replacementStatus: ReplacementStatus;
  replacementCandidate: string;
  hcmPic: string;
}

export type ReplacementBoard = Record<ReplacementBoardColumn, ReplacementBoardItem[]>;

const normalizedDivision = (division?: string) => normalizeDivision(division || '') || division || '-';
export const normalizePlacementTeam = (team?: string, position?: string) => {
  const rawTeam = (team || '-').trim();
  const upperTeam = rawTeam.toUpperCase().replace(/\s+/g, ' ');
  const upperPosition = (position || '').toUpperCase().replace(/\s+/g, ' ');

  if (upperTeam === 'LOGISTIK' || upperTeam === 'LOG') return 'LOGISTIC';
  if (upperTeam === 'SMART' && upperPosition.includes('PR')) return 'SMART (PR)';
  if (upperTeam === 'SMART' && upperPosition.includes('ADMIN')) return 'SMART (Admin)';
  if (upperTeam === 'NB-3 (PGN BILIING)' || upperTeam === 'NB-3 (PGN BILLING)') return 'NB-3 (PGN Billing)';
  if (upperTeam === 'NB-4 (PEGADAIAN)' || upperTeam === 'NB-4 (PEGADAIAN)') return 'NB-4 (Pegadaian)';
  return rawTeam;
};
export const getPlacementKey = (division?: string, team?: string, position?: string) => `${normalizedDivision(division)}||${normalizePlacementTeam(team, position)}`;

const statusPriority: Record<ReplacementStatus, number> = {
  URGENT_EMPTY: 0,
  NEEDS_REPLACEMENT: 1,
  COVERED: 2,
};

export const officialReplacementTeams = [
  { division: 'BUSDEV', team: 'SMART (PR)' },
  { division: 'BUSDEV', team: 'SMART (Admin)' },
  { division: 'BUSDEV', team: 'AI Dev' },
  { division: 'BUSDEV', team: 'AM' },
  { division: 'BUSDEV', team: 'DOOR' },
  { division: 'CORE', team: 'CLC' },
  { division: 'CORE', team: 'FINANCE' },
  { division: 'CORE', team: 'HCM' },
  { division: 'CORE', team: 'LOGISTIC' },
  { division: 'MSOS', team: 'DEVOPS' },
  { division: 'MSOS', team: 'MSO 1' },
  { division: 'MSOS', team: 'MSO 2' },
  { division: 'MSOS', team: 'MSO 3' },
  { division: 'MSOS', team: 'MSO 4' },
  { division: 'MSOS', team: 'MSO 5' },
  { division: 'MSOS', team: 'Software Quality' },
  { division: 'MSOS', team: 'MSOS' },
  { division: 'NEW BUSINESS', team: 'NB-1 (TSEL)' },
  { division: 'NEW BUSINESS', team: 'NB-2 (TSEL)' },
  { division: 'NEW BUSINESS', team: 'NB-2 (PGN)' },
  { division: 'NEW BUSINESS', team: 'NB-3 (PGN Billing)' },
  { division: 'NEW BUSINESS', team: 'NB-4 (Pegadaian)' },
  { division: 'NEW BUSINESS', team: 'NB-5 (ERP)' },
  { division: 'TELCO', team: 'TELCO-1' },
  { division: 'TELCO', team: 'TELCO-2' },
  { division: 'TELCO', team: 'TELCO-3' },
] as const;

const monthStart = (year: number, monthIndex: number) => new Date(year, monthIndex, 1);
const monthEnd = (year: number, monthIndex: number) => new Date(year, monthIndex + 1, 0);
const dateOnly = (value: Date | string) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};
const daysBetween = (start: Date, end: Date) => Math.ceil((dateOnly(end).getTime() - dateOnly(start).getTime()) / 86400000);

export const isSamePlacement = (intern: Intern, row: Pick<SchedulerRow, 'division' | 'team'>) =>
  getPlacementKey(intern.division, intern.team, intern.position) === getPlacementKey(row.division, row.team);

export const isActiveInMonth = (intern: Intern, year: number, monthIndex: number) =>
  new Date(intern.startDate) <= monthEnd(year, monthIndex) && new Date(intern.endDate) >= monthStart(year, monthIndex);

export const endsInMonth = (intern: Intern, year: number, monthIndex: number) => {
  const endDate = new Date(intern.endDate);
  return endDate.getFullYear() === year && endDate.getMonth() === monthIndex;
};

export const getMonthInterns = (row: Pick<SchedulerRow, 'division' | 'team'>, interns: Intern[], year: number, monthIndex: number) =>
  interns
    .filter((intern) => intern.type === 'INSTITUTION')
    .filter((intern) => isSamePlacement(intern, row))
    .filter((intern) => isActiveInMonth(intern, year, monthIndex))
    .sort((a, b) => a.name.localeCompare(b.name));

export const getReplacementCellTone = (
  row: Pick<SchedulerRow, 'division' | 'team'>,
  interns: Intern[],
  year: number,
  monthIndex: number,
): ReplacementCellTone => {
  const active = getMonthInterns(row, interns, year, monthIndex);
  if (!active.length) return 'empty';
  if (active.length > 1) return 'multi';
  return active.some((intern) => endsInMonth(intern, year, monthIndex)) ? 'ending' : 'active';
};

export const buildEndingSoonReminders = (interns: Intern[], today = new Date(), windowDays = 90): EndingSoonReminder[] =>
  interns
    .filter((intern) => intern.type === 'INSTITUTION')
    .filter((intern) => intern.status === 'ACTIVE')
    .map((intern) => ({
      intern,
      daysLeft: daysBetween(today, new Date(intern.endDate)),
    }))
    .filter(({ daysLeft }) => daysLeft >= 0 && daysLeft <= windowDays)
    .sort((a, b) => a.daysLeft - b.daysLeft || a.intern.name.localeCompare(b.intern.name))
    .map(({ intern, daysLeft }) => {
      const division = normalizedDivision(intern.division);
      return {
        id: `ending-${intern.id}`,
        internId: intern.id,
        name: intern.name,
        institution: intern.institution || '-',
        division,
        team: intern.team || '-',
        leader: intern.leader || '-',
        endDate: intern.endDate,
        daysLeft,
        replacementStatus: 'NEEDS_REPLACEMENT',
        message: `${intern.name} akan selesai dalam ${daysLeft} hari di ${division} / ${intern.team || '-'}.`,
      };
    });

const findPlacementInstitutionInterns = (row: Pick<SchedulerRow, 'division' | 'team'>, interns: Intern[], today: Date) =>
  interns
    .filter((intern) => intern.type === 'INSTITUTION')
    .filter((intern) => intern.status === 'ACTIVE')
    .filter((intern) => dateOnly(intern.startDate) <= dateOnly(today) && dateOnly(intern.endDate) >= dateOnly(today))
    .filter((intern) => isSamePlacement(intern, row))
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime() || a.name.localeCompare(b.name));

const toBoardItem = (row: SchedulerRow, interns: Intern[], today: Date): ReplacementBoardItem => {
  const placementInterns = findPlacementInstitutionInterns(row, interns, today);
  const soonestIntern = placementInterns[0];
  const soonestEndDate = soonestIntern?.endDate ?? row.soonestEndDate ?? null;
  const daysLeft = soonestEndDate ? daysBetween(today, new Date(soonestEndDate)) : null;
  const activeInstitutionCount = placementInterns.length || row.activeInstitutionCount;
  const replacementStatus: ReplacementStatus =
    activeInstitutionCount < row.minimumInstitutionNeed ? 'URGENT_EMPTY' : daysLeft !== null && daysLeft >= 0 && daysLeft <= 90 ? 'NEEDS_REPLACEMENT' : 'COVERED';

  return {
    id: row.id,
    division: row.division,
    team: row.team,
    leader: row.leader,
    activeInstitutionCount,
    activeProfessionalCount: row.activeProfessionalCount,
    minimumInstitutionNeed: row.minimumInstitutionNeed,
    endingInternName: soonestIntern?.name ?? row.endingInternName ?? '-',
    soonestEndDate,
    daysLeft,
    replacementStatus,
    replacementCandidate: row.replacementCandidate,
    hcmPic: row.hcmPic,
  };
};

const boardItemSort = (a: ReplacementBoardItem, b: ReplacementBoardItem) => {
  const daysA = a.daysLeft ?? Number.MAX_SAFE_INTEGER;
  const daysB = b.daysLeft ?? Number.MAX_SAFE_INTEGER;
  return daysA - daysB || `${a.division}${a.team}`.localeCompare(`${b.division}${b.team}`);
};

export const buildReplacementBoard = (rows: SchedulerRow[], interns: Intern[], today = new Date()): ReplacementBoard => {
  const board: ReplacementBoard = {
    urgent: [],
    h30: [],
    h90: [],
    safe: [],
  };

  rows.map((row) => toBoardItem(row, interns, today)).forEach((item) => {
    if (item.replacementStatus === 'URGENT_EMPTY') {
      board.urgent.push(item);
    } else if (item.daysLeft !== null && item.daysLeft >= 0 && item.daysLeft <= 30) {
      board.h30.push(item);
    } else if (item.daysLeft !== null && item.daysLeft >= 0 && item.daysLeft <= 90) {
      board.h90.push(item);
    } else {
      board.safe.push(item);
    }
  });

  return {
    urgent: board.urgent.sort(boardItemSort),
    h30: board.h30.sort(boardItemSort),
    h90: board.h90.sort(boardItemSort),
    safe: board.safe.sort(boardItemSort),
  };
};

export const buildSchedulerRows = (replacementRows: ReplacementSourceRow[], interns: Intern[]): SchedulerRow[] => {
  const rows = new Map<string, SchedulerRow>();

  officialReplacementTeams.forEach((placement, index) => {
    const matchingRow = replacementRows.find((row) => getPlacementKey(row.division, row.team) === getPlacementKey(placement.division, placement.team));
    const matchingInterns = interns.filter((intern) => intern.type === 'INSTITUTION' && isSamePlacement(intern, placement));
    const soonestIntern = [...matchingInterns].sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())[0];
    const activeInstitutionCount = matchingRow?.activeInstitutionCount ?? matchingInterns.filter((intern) => intern.status === 'ACTIVE').length;
    const replacementStatus = matchingRow?.replacementStatus ?? (activeInstitutionCount === 0 ? 'URGENT_EMPTY' : 'COVERED');
    const key = getPlacementKey(placement.division, placement.team);

    rows.set(key, {
      id: matchingRow?.id ?? `official-${index + 1}`,
      division: placement.division,
      team: placement.team,
      leader: matchingRow?.leader || soonestIntern?.leader || '-',
      notes: matchingRow?.notes || soonestIntern?.position || '',
      activeInstitutionCount,
      activeProfessionalCount: matchingRow?.activeProfessionalCount ?? 0,
      minimumInstitutionNeed: matchingRow?.minimumInstitutionNeed ?? 1,
      endingInternName: matchingRow?.endingInternName ?? soonestIntern?.name,
      soonestEndDate: matchingRow?.soonestEndDate ?? soonestIntern?.endDate ?? null,
      replacementStatus,
      replacementCandidate: matchingRow?.replacementCandidate || '',
      hcmPic: matchingRow?.hcmPic || '',
    });
  });

  return [...rows.values()].sort((a, b) => {
    const statusSort = statusPriority[a.replacementStatus] - statusPriority[b.replacementStatus];
    if (statusSort !== 0) return statusSort;
    const dateA = a.soonestEndDate ? new Date(a.soonestEndDate).getTime() : Number.MAX_SAFE_INTEGER;
    const dateB = b.soonestEndDate ? new Date(b.soonestEndDate).getTime() : Number.MAX_SAFE_INTEGER;
    return dateA - dateB || `${a.division}${a.team}`.localeCompare(`${b.division}${b.team}`);
  });
};
