import type { Entity } from "./entity";
import type { Service } from "./service";

export type BillingStatement = Entity<{
	total: number;
	clientId: number;
	service: Service;
}>
