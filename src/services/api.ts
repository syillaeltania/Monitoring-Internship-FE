import axios from 'axios';
import type { AppNotification } from '../utils/notifications';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
});

export type Status = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
export type InternshipType = 'INSTITUTION' | 'PROFESSIONAL';

export interface Intern {
  id: string;
  name: string;
  type: InternshipType;
  institution?: string;
  major?: string;
  division: string;
  team: string;
  position?: string;
  leader?: string;
  location?: string;
  startDate: string;
  endDate: string;
  durationLabel?: string;
  status: Status;
  phone?: string;
  email?: string;
  notes?: string;
}

const fallbackInterns: Intern[] = [
  {
    id: 'demo-1',
    name: 'Rizkia Fawziya',
    type: 'INSTITUTION',
    institution: 'UNLA',
    division: 'CORE',
    team: 'FINANCE',
    position: 'Admin',
    leader: 'Irena',
    location: 'Bandung',
    startDate: '2026-02-05',
    endDate: '2026-07-25',
    durationLabel: '5 Bulan - 20 Hari',
    status: 'ACTIVE',
  },
  {
    id: 'demo-2',
    name: 'Giar Sabiansyah',
    type: 'PROFESSIONAL',
    institution: 'SMKN 4 Bandung',
    division: 'CORE',
    team: 'LOG',
    position: 'Log',
    leader: 'Soleh',
    location: 'Bandung',
    startDate: '2025-06-30',
    endDate: '2026-12-31',
    durationLabel: '18 Bulan - 1 Hari',
    status: 'ACTIVE',
  },
  {
    id: 'demo-3',
    name: 'Candidate QA',
    type: 'PROFESSIONAL',
    institution: 'Tel-U',
    division: 'MSOS',
    team: 'SQ',
    position: 'QA',
    leader: 'Agung',
    startDate: '2026-06-23',
    endDate: '2026-12-23',
    status: 'PLANNED',
  },
];

const fallbackDashboard = {
  summary: {
    activeTotal: 2,
    activeInstitution: 1,
    activeProfessional: 1,
    completedTotal: 18,
    plannedTotal: 1,
    endingIn30Days: 1,
    riskyTeams: 2,
    currentMonthCost: 2300000,
  },
  charts: {
    byDivision: [
      { name: 'CORE', value: 2 },
      { name: 'MSOS', value: 1 },
    ],
    byType: [
      { name: 'INSTITUTION', value: 1 },
      { name: 'PROFESSIONAL', value: 2 },
    ],
    monthlyCost: [
      { month: '2026-05', value: 1800000 },
      { month: '2026-06', value: 2300000 },
      { month: '2026-07', value: 2500000 },
    ],
  },
  notifications: [
    { type: 'ENDING_SOON', title: 'Rizkia selesai dalam 17 hari', severity: 'warning' },
    { type: 'TEAM_EMPTY', title: 'MSOS / MSO 2 kosong', severity: 'danger' },
  ],
};

async function request<T>(path: string, fallback: T): Promise<T> {
  try {
    const { data } = await http.get<T>(path);
    return data;
  } catch {
    return fallback;
  }
}

export const api = {
  dashboard: () => request('/dashboard', fallbackDashboard),
  notifications: () => request<AppNotification[]>('/notifications', fallbackDashboard.notifications),
  interns: () => request<Intern[]>('/interns', fallbackInterns),
  createIntern: (payload: Partial<Intern>) => http.post<Intern>('/interns', payload),
  updateIntern: (id: string, payload: Partial<Intern> & { manualStatus?: Status | '' | null }) => http.put<Intern>(`/interns/${id}`, payload),
  deleteIntern: (id: string) => http.delete<Intern>(`/interns/${id}`),
  costs: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return request(`/costs${query}`, {
      rows: [],
      byDivision: [{ name: 'CORE', value: 2300000 }],
      byType: [{ name: 'PROFESSIONAL', value: 2300000 }],
      total: 2300000,
    });
  },
  updateCost: (internId: string, year: number, month: number, payload: { baseSalary: number; totalMealAllowance: number }) =>
    http.put(`/costs/${internId}/${year}/${month}`, payload),
  replacement: () =>
    request('/replacement', [
      {
        id: 'r1',
        division: 'MSOS',
        team: 'MSO 2',
        leader: 'Randy',
        activeInstitutionCount: 0,
        activeProfessionalCount: 0,
        minimumInstitutionNeed: 1,
        replacementStatus: 'URGENT_EMPTY',
        replacementCandidate: '',
      },
    ]),
  plans: () =>
    request('/plans', [
      {
        id: 'p1',
        name: 'Candidate QA',
        type: 'PROFESSIONAL',
        institution: 'Tel-U',
        major: 'Sistem Informasi',
        targetDivision: 'MSOS',
        targetTeam: 'SQ',
        plannedStartDate: '2026-06-23',
        plannedEndDate: '2026-12-23',
        processStatus: 'WAITING_JOIN',
      },
    ]),
  createPlan: (payload: Record<string, unknown>) => http.post('/plans', payload),
  updatePlanStatus: (id: string, payload: { processStatus: string }) => http.put(`/plans/${id}`, payload),
  completion: () => request('/completion', []),
  updateCompletion: (internId: string, payload: Record<string, unknown>) => http.put(`/completion/${internId}`, payload),
  organization: () => request('/organization', { units: [], activeInterns: fallbackInterns.filter((item) => item.status === 'ACTIVE') }),
  importExcel: () => http.post('/import/excel'),
};
