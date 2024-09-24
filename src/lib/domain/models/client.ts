import type { Entity } from "./entity";
import type { Person } from "./person";

export type Client = Entity<{
	email: string;
	person: Person;
}>
