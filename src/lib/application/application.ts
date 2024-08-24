import { SupabaseInstanceRef, type SupabaseGatewayAdapter } from "@/domain/gateways/supabase";
import { ConfigGatewayAdapter } from "@/driven-adapters/config";
import { MainLive } from "@/driven-adapters/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Effect } from "effect";

export function concretize<R, E>(client: SupabaseClient, effect: Effect.Effect<R, E, SupabaseGatewayAdapter | ConfigGatewayAdapter>) {
	return Promise.resolve(
		Effect.runPromise(
			Effect.provideService(
				effect.pipe(
					Effect.provide(MainLive)
				),
				SupabaseInstanceRef,
				client
			)
		)
	);
}
