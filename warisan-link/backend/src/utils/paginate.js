export const paginate = (page, limit) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 12));
  return {
    skip: (p - 1) * l,
    take: l,
    page: p,
    limit: l,
  };
};

export const buildPagination = (total, page, limit) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
