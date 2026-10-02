import { cookies } from "next/headers";
import { userById, users, type User } from "@/db/queries";
import type { Role } from "@/domain/constants";

export const ROLE_COOKIE = "sagaradhwani_user";

/** Demo auth: the acting user is chosen by a cookie. Replace with real auth before external use. */
export async function currentUser(): Promise<User> {
  const jar = await cookies();
  const id = jar.get(ROLE_COOKIE)?.value;
  return userById(id) ?? users().find((u) => u.role === "production_desk") ?? users()[0];
}

export function roleOf(u: User): Role {
  return u.role as Role;
}
