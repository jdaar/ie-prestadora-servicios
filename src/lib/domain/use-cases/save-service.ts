import { Effect } from "effect";
import type { Service } from "../models/service";
import { SaveBillingStatement } from "./save-billing-statement";
import { GetBillingStatementByServiceId } from "./get-billing-statement-by-service-id";

export const SaveService = (service: Omit<Service, 'id'> & { id?: number }, clientId: number) => Effect.gen(function *(_) {
	if (service.id) {
		const billingStatement = yield *_(GetBillingStatementByServiceId(service.id));
		return (yield *_(SaveBillingStatement({
			id: billingStatement.id,
			// lord forgive for I have sinned
			service: service as Service,
			total: service.cost,
			clientId
		}))).service;
	} else {
		return (yield *_(SaveBillingStatement({
			service: service as Service,
			total: service.cost,
			clientId
		}))).service;
	}
})
