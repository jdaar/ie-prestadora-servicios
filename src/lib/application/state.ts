import type { User } from "@/domain/models/user";
import { Option } from "effect";
import { writable } from "svelte/store";

export const connectedUser = writable<Option.Option<User>>(Option.none());
