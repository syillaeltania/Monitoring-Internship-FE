export type AppRole = 'HCM Staff' | 'HCM Leader';

export const normalizeRole = (role?: string | null): AppRole => {
  const normalized = role?.trim().toLowerCase().replace(/[_-]+/g, ' ');

  if (normalized === 'hcm leader') return 'HCM Leader';
  if (normalized === 'hcm staff') return 'HCM Staff';

  return 'HCM Staff';
};
