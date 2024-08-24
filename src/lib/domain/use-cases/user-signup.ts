import { Effect } from "effect";
import { SupabaseGatewayAdapter } from "../gateways/supabase";

export const UserSignUp = (
	email: string,
	password: string
) => Effect.gen(function *(_) {
	const supabaseGateway = yield *_(SupabaseGatewayAdapter);
	return yield *_(supabaseGateway.signUp({
		email,
		password
	}))
})
