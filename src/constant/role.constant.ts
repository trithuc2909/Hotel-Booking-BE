export const ROLE = {
  ADMIN: "ADMIN",
  USER: "USER",
  SYSTEM: "SYSTEM",
} as const;

export type RoleCode = (typeof ROLE)[keyof typeof ROLE];
