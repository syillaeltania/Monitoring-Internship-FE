import type { Intern, InternshipType, Status } from '../services/api';
import { normalizeDivision } from './internFilters';

export type ReportKind = 'participants' | 'cost' | 'replacement' | 'checklist';

export interface ReportFilters {
  year: string;
  endYear: string;
  month: string;
  division: string;
  type: '' | InternshipType;
  status: '' | Status;
  leader: string;
}

export const reportKinds: Array<{ value: ReportKind; label: string; description: string }> = [
  { value: 'participants', label: 'Data Peserta', description: 'Daftar peserta sesuai filter periode, divisi, tipe, status, dan leader.' },
  { value: 'cost', label: 'Cost Bulanan', description: 'Rekap biaya peserta pada bulan dan tahun terpilih.' },
  { value: 'replacement', label: 'Pergantian Magang', description: 'Kebutuhan replacement dan status coverage per tim.' },
  { value: 'checklist', label: 'Checklist Penyelesaian', description: 'Status administrasi penyelesaian magang per peserta aktif.' },
];

export const reportMonthOptions = [
  { value: '', label: 'Semua bulan' },
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

const toDate = (value: string) => new Date(`${value.slice(0, 10)}T00:00:00`);

function periodRange(filters: Pick<ReportFilters, 'year' | 'month'>) {
  if (!filters.year) return null;

  const year = Number(filters.year);
  const month = Number(filters.month);
  if (!Number.isFinite(year)) return null;

  const start = filters.month && Number.isFinite(month) ? new Date(year, month - 1, 1) : new Date(year, 0, 1);
  const end = filters.month && Number.isFinite(month) ? new Date(year, month, 0) : new Date(year, 11, 31);
  return { start, end };
}

export function filterReportInterns(interns: Intern[], filters: ReportFilters) {
  const range = periodRange(filters);
  const leader = filters.leader.trim().toLowerCase();

  return interns.filter((intern) => {
    const matchesPeriod = !range || (toDate(intern.startDate) <= range.end && toDate(intern.endDate) >= range.start);
    const matchesEndYear = !filters.endYear || new Date(intern.endDate).getFullYear().toString() === filters.endYear;
    const matchesDivision = !filters.division || normalizeDivision(intern.division) === filters.division;
    const matchesType = !filters.type || intern.type === filters.type;
    const matchesStatus = !filters.status || intern.status === filters.status;
    const matchesLeader = !leader || (intern.leader ?? '').toLowerCase().includes(leader);
    return matchesPeriod && matchesEndYear && matchesDivision && matchesType && matchesStatus && matchesLeader;
  });
}

export function summarizeReportInterns(interns: Intern[]) {
  return {
    total: interns.length,
    institution: interns.filter((intern) => intern.type === 'INSTITUTION').length,
    professional: interns.filter((intern) => intern.type === 'PROFESSIONAL').length,
    active: interns.filter((intern) => intern.status === 'ACTIVE').length,
    completed: interns.filter((intern) => intern.status === 'COMPLETED').length,
    terminated: interns.filter((intern) => intern.status === 'TERMINATED').length,
  };
}

import * as XLSX from 'xlsx';

export function buildCsv(headers: string[], rows: Array<Array<string | number | null | undefined>>) {
  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export function buildExcel(headers: string[], rows: Array<Array<string | number | null | undefined>>, filename: string) {
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export const participantHeaders = ['Nama', 'Tipe', 'Instansi', 'Divisi', 'Tim', 'Posisi', 'Leader', 'Tanggal Masuk', 'Tanggal Selesai', 'Status', 'Email', 'No HP', 'Notes'];

export function formatReportDate(value?: string | null) {
  if (!value) return '';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function participantRows(interns: Intern[]) {
  return interns.map((item) => [
    item.name,
    item.type,
    item.institution ?? '',
    item.division ?? '',
    item.team ?? '',
    item.position ?? '',
    item.leader ?? '',
    formatReportDate(item.startDate),
    formatReportDate(item.endDate),
    item.status,
    item.email ?? '',
    item.phone ?? '',
    item.notes ?? '',
  ]);
}
