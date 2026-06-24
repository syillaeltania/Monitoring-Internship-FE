export type ReplacementTabKey = 'scheduler' | 'kanban' | 'table';

export const replacementTabs: Array<{ key: ReplacementTabKey; label: string; description: string }> = [
  {
    key: 'scheduler',
    label: 'Scheduler',
    description: 'Matrix bulanan pergantian magang per divisi dan tim.',
  },
  {
    key: 'kanban',
    label: 'Kanban Risiko',
    description: 'Prioritas follow up berdasarkan risiko replacement.',
  },
  {
    key: 'table',
    label: 'Data Table',
    description: 'Tabel detail kebutuhan replacement per tim.',
  },
];
