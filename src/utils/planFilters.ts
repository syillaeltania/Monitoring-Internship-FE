export type PlanSortMode = 'joinDateAsc' | 'joinDateDesc';

export interface SortablePlan {
  plannedStartDate: string;
  plannedEndDate?: string;
  processStatus?: string;
}

export const isCompletedPlan = (plan: { processStatus?: string }) =>
  plan.processStatus === 'COMPLETED' || plan.processStatus === 'COMPLETION_CHECKLIST_DONE';

export const sortPlans = <T extends SortablePlan>(plans: T[], mode: PlanSortMode) =>
  [...plans].sort((a, b) => {
    const dateA = new Date(a.plannedStartDate).getTime();
    const dateB = new Date(b.plannedStartDate).getTime();
    return mode === 'joinDateAsc' ? dateA - dateB : dateB - dateA;
  });

const dateOnly = (value: Date | string) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

export const getPlanDisplayStatus = (plan: SortablePlan, today = new Date()) => {
  if (isCompletedPlan(plan)) return 'COMPLETED';
  if (plan.processStatus === 'ACTIVE') return 'ON_GOING';
  if (!plan.plannedEndDate) return 'WAITING_JOIN';

  const current = dateOnly(today);
  const start = dateOnly(plan.plannedStartDate);
  const end = dateOnly(plan.plannedEndDate);

  if (current >= start && current <= end) return 'ON_GOING';
  return 'WAITING_JOIN';
};

export const filterPlansByStatus = <T extends SortablePlan>(plans: T[], status: string, today = new Date()) => {
  if (!status) return plans;
  return plans.filter((plan) => getPlanDisplayStatus(plan, today) === status);
};
