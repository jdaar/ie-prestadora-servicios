import type { SupabaseGatewayAdapter } from "@/domain/gateways/supabase";
import type { ConfigGatewayAdapter } from "@/driven-adapters/config";
import { MainLive } from "@/driven-adapters/supabase";
import { Effect, Layer } from "effect";

export function concretize<R, E>(effect: Effect.Effect<R, E, SupabaseGatewayAdapter | ConfigGatewayAdapter>) {
	return Effect.runPromise(
		Effect.provide(
			effect,
			MainLive
		)
	);
}
