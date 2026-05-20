export const normalizePhone = (p?: string) =>
  p ? p.replace(/\D/g, "").replace(/^84/, "0") : undefined;

export const formatDate = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) =>
    parts.find((p) => p.type === type)?.value || "";

  return `${getPart("year")}${getPart("month")}${getPart("day")}${getPart("hour")}${getPart("minute")}${getPart("second")}`;
};

