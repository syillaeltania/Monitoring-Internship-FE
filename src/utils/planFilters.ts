export type PlanSortMode = 'statusPriority' | 'joinDateAsc' | 'joinDateDesc';

export interface SortablePlan {
  plannedStartDate: string;
  plannedEndDate?: string;
  processStatus?: string;
}

export const isCompletedPlan = (plan: { processStatus?: string }) =>
  plan.processStatus === 'COMPLETED' || plan.processStatus === 'COMPLETION_CHECKLIST_DONE';

const STATUS_WEIGHT = {
  ON_GOING: 1,
  WAITING_JOIN: 2,
  COMPLETED: 3
};

// We temporarily hoist getPlanDisplayStatus signature to allow it to be used in sortPlans
// Or we can just calculate it directly if needed, but since getPlanDisplayStatus is below,
// we just define a local lightweight version for the sort to avoid circular dependency.
const getSortWeight = (plan: SortablePlan, today = new Date()) => {
  if (isCompletedPlan(plan)) return STATUS_WEIGHT.COMPLETED;
  if (plan.processStatus === 'ACTIVE') return STATUS_WEIGHT.ON_GOING;
  if (!plan.plannedEndDate) return STATUS_WEIGHT.WAITING_JOIN;

  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const start = new Date(new Date(plan.plannedStartDate).getFullYear(), new Date(plan.plannedStartDate).getMonth(), new Date(plan.plannedStartDate).getDate()).getTime();
  const end = new Date(new Date(plan.plannedEndDate).getFullYear(), new Date(plan.plannedEndDate).getMonth(), new Date(plan.plannedEndDate).getDate()).getTime();

  if (current >= start && current <= end) return STATUS_WEIGHT.ON_GOING;
  return STATUS_WEIGHT.WAITING_JOIN;
};

export const sortPlans = <T extends SortablePlan>(plans: T[], mode: PlanSortMode, today = new Date()) =>
  [...plans].sort((a, b) => {
    const dateA = new Date(a.plannedStartDate).getTime();
    const dateB = new Date(b.plannedStartDate).getTime();
    
    if (mode === 'statusPriority') {
      const weightA = getSortWeight(a, today);
      const weightB = getSortWeight(b, today);
      if (weightA !== weightB) return weightA - weightB;
      return dateB - dateA; // fallback: newest join date first for same status
    }
    
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
