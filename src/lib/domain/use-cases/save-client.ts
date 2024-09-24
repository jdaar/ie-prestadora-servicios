import { Effect } from "effect";
import { SupabaseGatewayAdapter } from "../gateways/supabase";
import type { Client } from "../models/client";

export const SaveClient = (client: Omit<Client, 'id' | 'person'> & { id?: number }, personId: number) => Effect.gen(function *(_) {
	const supabaseGateway = yield *_(SupabaseGatewayAdapter);
	return yield *_(supabaseGateway.saveClient(client, personId))
})
