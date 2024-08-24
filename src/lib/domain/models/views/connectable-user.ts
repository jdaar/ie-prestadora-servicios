import type { User } from "../user";

export type ConnectableUser = Omit<User, 'id'> & { readonly password: string };
