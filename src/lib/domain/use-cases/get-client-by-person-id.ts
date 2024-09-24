import { Effect } from "effect";
import { SupabaseGatewayAdapter } from "../gateways/supabase";

export const GetClientByPersonId = (personId: number) => Effect.gen(function *(_) {
	const supabaseGateway = yield *_(SupabaseGatewayAdapter);
	return yield *_(supabaseGateway.getClientByPersonId(personId));
})
