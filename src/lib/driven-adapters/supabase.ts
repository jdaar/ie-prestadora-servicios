import { createClient } from "@supabase/supabase-js";
import { Effect, Layer } from "effect";
import { ConfigGatewayAdapter, ConfigGatewayLive } from "./config";
import { SupabaseGatewayAdapter, SupabaseInstanceAdapter } from "@/domain/gateways/supabase";
import { SupabaseSDKError } from "@/domain/models/errors/supabase-sdk-error";

export const SupabaseInstanceLive = Layer.effect(
		SupabaseInstanceAdapter,
		Effect.gen(function *(_) {
			const configGateway = yield *_(ConfigGatewayAdapter); 
			return SupabaseInstanceAdapter.of({
				client: createClient(
					configGateway.supabaseClient,
					configGateway.supabaseSecret,
					{}
				)
			})
		})
	)

export const SupabaseGatewayLive = Layer.effect(
	SupabaseGatewayAdapter,
	Effect.gen(function *(_) {
		const instance = yield *_(SupabaseInstanceAdapter);
		return SupabaseGatewayAdapter.of({
			signIn: (user) => Effect.tryPromise({
				try: () => instance.client.auth.signInWithPassword({
					email: user.email,
					password: user.password
				}),
				catch: (error) => new SupabaseSDKError(error)
			}),
			signUp: (user) => Effect.tryPromise({
				try: () => instance.client.auth.signUp({
					email: user.email,
					password: user.password
				}),
				catch: (error) => new SupabaseSDKError(error)
			})
		})
	})
)

// TODO: gotta find a way to prevent the creation of new instance by memoizing the supabase client reference
export const MainLive = Layer.merge(
	SupabaseGatewayLive
		.pipe(
			Layer.provide(
				Layer.merge(
					Layer.provide(
						SupabaseInstanceLive,
						ConfigGatewayLive
					),
					ConfigGatewayLive
				),
			),
		),
	ConfigGatewayLive
)
