/** role が管理者かどうかを判定する */
export function isAdmin(role: string | undefined | null): boolean {
  return role?.toUpperCase() === "ADMIN";
}
