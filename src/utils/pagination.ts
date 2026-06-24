export const pageSizeOptions = [10, 25, 50] as const;

export function clampPage(page: number, totalPages: number) {
  if (totalPages < 1) return 1;
  return Math.min(Math.max(page, 1), totalPages);
}

export function paginateRows<T>(rows: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = clampPage(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;

  return {
    rows: rows.slice(start, end),
    currentPage,
    totalPages,
    startIndex: rows.length === 0 ? 0 : start + 1,
    endIndex: Math.min(end, rows.length),
    totalRows: rows.length,
  };
}
