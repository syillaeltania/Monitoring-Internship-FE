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
  if (upperTeam === 'SMART' && upperPosition.includes('WEBDEV')) return 'SMART (Webdev)';
  if (upperTeam === 'AM' && upperPosition.includes('QA')) return 'AM (QA)';
  if (upperTeam === 'AM' && upperPosition.includes('TW')) return 'AM (TW)';
  if (upperTeam === 'NB-3 (PGN BILIING)' || upperTeam === 'NB-3 (PGN BILLING)') return 'NB-3 (PGN Billing)';
  if (upperTeam === 'NB-4 (PEGADAIAN)' || upperTeam === 'NB-4 (PEGADAIAN)') return 'NB-4 (Pegadaian)';

  // MSOS & SQ mappings
  if (upperTeam === 'MSOS-1' || upperTeam === 'MSOS 1' || upperTeam === 'MSO-1' || upperTeam === 'MSO 1') return 'MSO 1';
  if (upperTeam === 'MSOS-2' || upperTeam === 'MSOS 2' || upperTeam === 'MSO-2' || upperTeam === 'MSO 2') return 'MSO 2';
  if (upperTeam === 'MSOS-3' || upperTeam === 'MSOS 3' || upperTeam === 'MSO-3' || upperTeam === 'MSO 3') return 'MSO 3';
  if (upperTeam === 'MSOS-4' || upperTeam === 'MSOS 4' || upperTeam === 'MSO-4' || upperTeam === 'MSO 4') return 'MSO 4';
  if (upperTeam === 'MSOS-5' || upperTeam === 'MSOS 5' || upperTeam === 'MSO-5' || upperTeam === 'MSO 5') return 'MSO 5';
  if (upperTeam === 'MSOS-6' || upperTeam === 'MSOS 6' || upperTeam === 'MSO-6' || upperTeam === 'MSO 6') return 'MSO 6';
  if (upperTeam === 'SQ') return 'Software Quality';

  return rawTeam;
};
export const getPlacementKey = (division?: string, team?: string, position?: string) => `${normalizedDivision(division)}||${normalizePlacementTeam(team, position)}`;

const statusPriority: Record<ReplacementStatus, number> = {
  URGENT_EMPTY: 0,
  NEEDS_REPLACEMENT: 1,
  COVERED: 2,
};

const monthStart = (year: number, monthIndex: number) => new Date(year, monthIndex, 1);
const monthEnd = (year: number, monthIndex: number) => new Date(year, monthIndex + 1, 0);
const dateOnly = (value: Date | string) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};
const daysBetween = (start: Date, end: Date) => Math.ceil((dateOnly(end).getTime() - dateOnly(start).getTime()) / 86400000);

export const isSamePlacement = (intern: Intern, row: Pick<SchedulerRow, 'division' | 'team' | 'notes'>) =>
  getPlacementKey(intern.division, intern.team, intern.position) === getPlacementKey(row.division, row.team, row.notes);

export const isActiveInMonth = (intern: Intern, year: number, monthIndex: number) =>
  new Date(intern.startDate) <= monthEnd(year, monthIndex) && new Date(intern.endDate) >= monthStart(year, monthIndex);

export const endsInMonth = (intern: Intern, year: number, monthIndex: number) => {
  const endDate = new Date(intern.endDate);
  return endDate.getFullYear() === year && endDate.getMonth() === monthIndex;
};

export const getMonthInterns = (row: Pick<SchedulerRow, 'division' | 'team' | 'notes'>, interns: Intern[], year: number, monthIndex: number) =>
  interns
    .filter((intern) => intern.type === 'INSTITUTION')
    .filter((intern) => isSamePlacement(intern, row))
    .filter((intern) => isActiveInMonth(intern, year, monthIndex))
    .sort((a, b) => a.name.localeCompare(b.name));

export const getReplacementCellTone = (
  row: Pick<SchedulerRow, 'division' | 'team' | 'notes'>,
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

const findPlacementInstitutionInterns = (row: Pick<SchedulerRow, 'division' | 'team' | 'notes'>, interns: Intern[], today: Date) =>
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
  
  const soonestInterns = soonestEndDate 
    ? placementInterns.filter(i => new Date(i.endDate).getTime() === new Date(soonestEndDate).getTime())
    : [];
  const endingInternName = soonestInterns.length > 0 
    ? soonestInterns.map(i => i.name).join(', ') 
    : row.endingInternName ?? '-';

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
    endingInternName,
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

  // 1. Initialize all teams dynamically from interns
  interns.forEach((intern) => {
    const key = getPlacementKey(intern.division, intern.team, intern.position);
    if (!rows.has(key) && intern.division && intern.team) {
      rows.set(key, {
        id: `dynamic-${intern.id}`,
        division: intern.division,
        team: intern.team,
        leader: intern.leader || '-',
        notes: intern.position || '',
        activeInstitutionCount: 0,
        activeProfessionalCount: 0,
        minimumInstitutionNeed: 1,
        endingInternName: undefined,
        soonestEndDate: null,
        replacementStatus: 'URGENT_EMPTY',
        replacementCandidate: '',
        hcmPic: '',
      });
    }
  });

  // 2. Merge database configurations and dynamically add any new/custom teams
  replacementRows.forEach((dbRow) => {
    const key = getPlacementKey(dbRow.division, dbRow.team, dbRow.notes);
    const existing = rows.get(key);

    if (existing) {
      existing.id = dbRow.id;
      existing.minimumInstitutionNeed = dbRow.minimumInstitutionNeed ?? 1;
      existing.replacementCandidate = dbRow.replacementCandidate || '';
      existing.notes = existing.notes || dbRow.notes || '';
      existing.hcmPic = dbRow.hcmPic || '';
      existing.leader = existing.leader !== '-' ? existing.leader : (dbRow.leader || '-');
    } else {
      rows.set(key, {
        id: dbRow.id,
        division: dbRow.division,
        team: dbRow.team,
        leader: dbRow.leader || '-',
        notes: dbRow.notes || '',
        activeInstitutionCount: 0,
        activeProfessionalCount: 0,
        minimumInstitutionNeed: dbRow.minimumInstitutionNeed ?? 1,
        endingInternName: undefined,
        soonestEndDate: null,
        replacementStatus: 'URGENT_EMPTY',
        replacementCandidate: dbRow.replacementCandidate || '',
        hcmPic: dbRow.hcmPic || '',
      });
    }
  });

  // 3. Map active interns and calculate status
  for (const row of rows.values()) {
    const matchingInterns = interns.filter((intern) => intern.type === 'INSTITUTION' && isSamePlacement(intern, row));
    const soonestIntern = [...matchingInterns].sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())[0];
    
    const activeInst = matchingInterns.filter((intern) => intern.type === 'INSTITUTION' && intern.status === 'ACTIVE').length;
    const activeProf = matchingInterns.filter((intern) => intern.type === 'PROFESSIONAL' && intern.status === 'ACTIVE').length;

    row.activeInstitutionCount = activeInst;
    row.activeProfessionalCount = activeProf;
    row.soonestEndDate = soonestIntern?.endDate ?? null;
    row.endingInternName = soonestIntern?.name;
    row.leader = soonestIntern?.leader || (row.leader !== '-' ? row.leader : '-');
    row.notes = soonestIntern?.position || row.notes || '';
    row.replacementStatus = activeInst < row.minimumInstitutionNeed ? 'URGENT_EMPTY' : 'COVERED';
  }

  return [...rows.values()].sort((a, b) => {
    const statusSort = statusPriority[a.replacementStatus] - statusPriority[b.replacementStatus];
    if (statusSort !== 0) return statusSort;
    const dateA = a.soonestEndDate ? new Date(a.soonestEndDate).getTime() : Number.MAX_SAFE_INTEGER;
    const dateB = b.soonestEndDate ? new Date(b.soonestEndDate).getTime() : Number.MAX_SAFE_INTEGER;
    return dateA - dateB || `${a.division}${a.team}`.localeCompare(`${b.division}${b.team}`);
  });
};
