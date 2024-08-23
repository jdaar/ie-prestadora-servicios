import { Effect } from "effect";
import { SupabaseGatewayAdapter } from "../gateways/supabase";

export const UserLogin = (
	email: string,
	password: string
) => Effect.gen(function *(_) {
	const supabaseGateway = yield *_(SupabaseGatewayAdapter);
	return yield *_(supabaseGateway.signIn({
		email,
		password
	}))
})
