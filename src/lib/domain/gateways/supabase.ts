import { SUPABASE_GATEWAY_TAG, SUPABASE_INSTANCE_TAG } from "@/resources/constants"
import type { AuthResponse, AuthTokenResponsePassword, SupabaseClient } from "@supabase/supabase-js"
import { Context, Effect } from "effect"
import type { ConnectableUser } from "../models/views/connectable-user"
import type { SupabaseSDKError } from "../models/errors/supabase-sdk-error"
import type { User } from "../models/user"

export interface SupabaseGateway {
	readonly signIn: (user: ConnectableUser) => Effect.Effect<AuthTokenResponsePassword, SupabaseSDKError>
	readonly signUp: (user: ConnectableUser) => Effect.Effect<AuthResponse, SupabaseSDKError>
	readonly signOut: () => Effect.Effect<void, SupabaseSDKError>
	readonly getConnectedUserDetails: () => Effect.Effect<User, SupabaseSDKError>
};

export class SupabaseInstanceRef extends Context.Tag(SUPABASE_INSTANCE_TAG)<
	SupabaseInstanceRef,
	SupabaseClient
>() {}

export class SupabaseGatewayAdapter extends Context.Tag(SUPABASE_GATEWAY_TAG)<
	SupabaseGatewayAdapter,
	SupabaseGateway 
>() {} 
