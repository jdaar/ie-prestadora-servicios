import { Effect, Layer } from "effect";
import { ConfigGatewayLive } from "./config";
import { SupabaseGatewayAdapter, SupabaseInstanceRef, type SupabaseGateway } from "@/domain/gateways/supabase";
import { SupabaseSDKError } from "@/domain/models/errors/supabase-sdk-error";
import type { User } from "@/domain/models/user";

export const SupabaseGatewayLive = Layer.effect(
	SupabaseGatewayAdapter,
	Effect.gen(function *(_) {
		const instance = yield *_(SupabaseInstanceRef);

		const signIn: SupabaseGateway['signIn'] = (user) => Effect.tryPromise({
				try: () => instance.auth.signInWithPassword({
					email: user.email,
					password: user.password
				}),
				catch: (error) => new SupabaseSDKError(error)
			}).pipe(
				Effect.flatMap((value) => {
					if (value.error !== null)
						return Effect.fail(new SupabaseSDKError(value.error))
					else
						return Effect.succeed(value)
				})
			);

		const signUp: SupabaseGateway['signUp'] = (user) => Effect.tryPromise({
				try: () => instance.auth.signUp({
					email: user.email,
					password: user.password
				}),
				catch: (error) => new SupabaseSDKError(error)
			});

		const signOut: SupabaseGateway['signOut'] = () => Effect.tryPromise({
				try: () => instance.auth.signOut(),
				catch: (error) => new SupabaseSDKError(error)
			});

		const getConnectedUserDetails: SupabaseGateway['getConnectedUserDetails'] = () => Effect.tryPromise({
				try: () => instance.auth.getUser(),
				catch: (error) => new SupabaseSDKError(error)
			}).pipe(
				Effect.flatMap((data) => {
					if (!data.data.user?.email) {
						return Effect.fail(
							new SupabaseSDKError(new Error("retrieved invalid user (reason: null email)"))
						)
					}
					return Effect.succeed({
						email: data.data.user?.email
					} satisfies User)
				})
			);

		return SupabaseGatewayAdapter.of({
			signIn,
			signUp,
			signOut,
			getConnectedUserDetails
		})
	})
)

export const MainLive = Layer.merge(
	SupabaseGatewayLive.pipe(
		Layer.provide(ConfigGatewayLive),
	),
	ConfigGatewayLive
)
