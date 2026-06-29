export const internTableActions = () => ['edit'] as const;

export const canDeleteFromInternForm = (editingId: string) => Boolean(editingId);
