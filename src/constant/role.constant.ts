export const ROLE = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type RoleCode = (typeof ROLE)[keyof typeof ROLE];
