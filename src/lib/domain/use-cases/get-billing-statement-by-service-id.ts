import { Effect } from "effect";
import { SupabaseGatewayAdapter } from "../gateways/supabase";

export const GetBillingStatementByServiceId = (serviceId: number) => Effect.gen(function *(_) {
	const supabaseGateway = yield *_(SupabaseGatewayAdapter);
	return yield *_(supabaseGateway.getBillingStatementByServiceId(serviceId));
})
