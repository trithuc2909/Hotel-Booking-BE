export const normalizePhone = (p?: string) =>
  p ? p.replace(/\D/g, "").replace(/^84/, "0") : undefined;

export const formatDate = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
};
