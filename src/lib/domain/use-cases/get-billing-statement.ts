import { Effect } from "effect";
import { SupabaseGatewayAdapter } from "../gateways/supabase";

export const GetBillingStatement = (billingStatementId: number) => Effect.gen(function *(_) {
	const supabaseGateway = yield *_(SupabaseGatewayAdapter);
	return yield *_(supabaseGateway.getBillingStatement(billingStatementId));
})
