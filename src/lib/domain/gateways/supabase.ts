import { SUPABASE_GATEWAY_TAG, SUPABASE_INSTANCE_TAG } from "@/resources/constants"
import type { AuthResponse, AuthTokenResponsePassword, SupabaseClient } from "@supabase/supabase-js"
import { Context, Effect } from "effect"
import type { ConnectableUser } from "../models/views/connectable-user"
import type { SupabaseSDKError } from "../models/errors/supabase-sdk-error"
import type { User } from "../models/user"
import type { Person } from "../models/person"
import type { Database } from "@/database.types"

interface IdentityProviderGateway {
	readonly signIn: (user: ConnectableUser) => Effect.Effect<AuthTokenResponsePassword, SupabaseSDKError>
	readonly signUp: (user: ConnectableUser) => Effect.Effect<AuthResponse, SupabaseSDKError>
	readonly signOut: Effect.Effect<void, SupabaseSDKError>
	readonly getConnectedUser: Effect.Effect<User, SupabaseSDKError>
}

interface DatabaseGateway {
	readonly getPersons: Effect.Effect<Array<Person>, SupabaseSDKError>
	readonly savePerson: (person: Omit<Person, 'id'> & { id?: number }) => Effect.Effect<Person, SupabaseSDKError>
}

export interface SupabaseGateway extends IdentityProviderGateway, DatabaseGateway {
};

export class SupabaseInstanceRef extends Context.Tag(SUPABASE_INSTANCE_TAG)<
	SupabaseInstanceRef,
	SupabaseClient<Database>
>() {}

export class SupabaseGatewayAdapter extends Context.Tag(SUPABASE_GATEWAY_TAG)<
	SupabaseGatewayAdapter,
	SupabaseGateway 
>() {} 
