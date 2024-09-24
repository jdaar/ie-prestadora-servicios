import { Effect } from "effect";
import { SupabaseGatewayAdapter } from "../gateways/supabase";
import type { BillingStatement } from "../models/billing-statement";

export const SaveBillingStatement = (billingStatement: Omit<BillingStatement, 'id'> & { id?: number }) => Effect.gen(function *(_) {
	const supabaseGateway = yield *_(SupabaseGatewayAdapter);
	billingStatement.service = yield *_(supabaseGateway.saveService(billingStatement.service));
	return yield *_(supabaseGateway.saveBillingStatement(billingStatement));
})
