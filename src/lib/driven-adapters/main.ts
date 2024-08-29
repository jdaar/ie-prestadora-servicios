import { Layer } from "effect";
import { SupabaseGatewayLive } from "./supabase";
import { ConfigGatewayLive } from "./config";
import { SpreadsheetGatewayLive } from "./spreadsheet";

export const MainLive = Layer.merge(
	SupabaseGatewayLive.pipe(
		Layer.provide(ConfigGatewayLive),
	),
	ConfigGatewayLive
)
	.pipe(Layer.merge(SpreadsheetGatewayLive))
