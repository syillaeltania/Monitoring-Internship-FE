export interface PlanForm {
  name: string;
  type: 'INSTITUTION' | 'PROFESSIONAL';
  institution: string;
  major: string;
  targetDivision: string;
  targetTeam: string;
  leader: string;
  acceptanceLetterDate: string;
  plannedStartDate: string;
  plannedEndDate: string;
  documentStatus: string;
  onboardingStatus: string;
  processStatus: string;
  phone: string;
  notes: string;
}

const dateInputValue = (value?: string | Date | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

export const emptyPlanForm = (): PlanForm => ({
  name: '',
  type: 'INSTITUTION',
  institution: '',
  major: '',
  targetDivision: '',
  targetTeam: '',
  leader: '',
  acceptanceLetterDate: '',
  plannedStartDate: '',
  plannedEndDate: '',
  documentStatus: '',
  onboardingStatus: '',
  processStatus: 'WAITING_JOIN',
  phone: '',
  notes: '',
});

export const buildPlanFormFromPlan = (plan: Partial<PlanForm> & Record<string, unknown>): PlanForm => ({
  name: String(plan.name ?? ''),
  type: plan.type === 'PROFESSIONAL' ? 'PROFESSIONAL' : 'INSTITUTION',
  institution: String(plan.institution ?? ''),
  major: String(plan.major ?? ''),
  targetDivision: String(plan.targetDivision ?? ''),
  targetTeam: String(plan.targetTeam ?? ''),
  leader: String(plan.leader ?? ''),
  acceptanceLetterDate: dateInputValue(plan.acceptanceLetterDate as string | Date | null),
  plannedStartDate: dateInputValue(plan.plannedStartDate as string | Date | null),
  plannedEndDate: dateInputValue(plan.plannedEndDate as string | Date | null),
  documentStatus: String(plan.documentStatus ?? ''),
  onboardingStatus: String(plan.onboardingStatus ?? ''),
  processStatus: String(plan.processStatus ?? 'WAITING_JOIN'),
  phone: String(plan.phone ?? ''),
  notes: String(plan.notes ?? ''),
});
