import { Effect } from "effect";
import { SupabaseGatewayAdapter } from "../gateways/supabase";
import type { Person } from "../models/person";

export const SavePerson = (person: Omit<Person, 'id'> & { id?: number }) => Effect.gen(function *(_) {
	const supabaseGateway = yield *_(SupabaseGatewayAdapter);
	return yield *_(supabaseGateway.savePerson(person))
})
