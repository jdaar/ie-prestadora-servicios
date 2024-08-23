import { SUPABASE_GATEWAY_TAG, SUPABASE_INSTANCE_TAG } from "@/resources/constants"
import type { AuthResponse, AuthTokenResponsePassword, SupabaseClient } from "@supabase/supabase-js"
import { Context, Effect } from "effect"
import type { ConnectableUser } from "../models/views/connectable-user"
import type { SupabaseSDKError } from "../models/errors/supabase-sdk-error"

interface SupabaseGateway {
	readonly signIn: (user: ConnectableUser) => Effect.Effect<AuthTokenResponsePassword, SupabaseSDKError>
	readonly signUp: (user: ConnectableUser) => Effect.Effect<AuthResponse, SupabaseSDKError>
};

export class SupabaseGatewayAdapter extends Context.Tag(SUPABASE_GATEWAY_TAG)<
	SupabaseGatewayAdapter,
	SupabaseGateway 
>() {} 

export class SupabaseInstanceAdapter extends Context.Tag(SUPABASE_INSTANCE_TAG)<
	SupabaseInstanceAdapter,
	{ readonly client: SupabaseClient }
>() {} 
