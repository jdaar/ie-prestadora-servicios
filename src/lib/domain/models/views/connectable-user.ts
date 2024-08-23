import type { User } from "../user";

export type ConnectableUser = User & { readonly password: string };
