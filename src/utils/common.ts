export const normalizePhone = (p?: string) =>
  p ? p.replace(/\D/g, "").replace(/^84/, "0") : undefined;

