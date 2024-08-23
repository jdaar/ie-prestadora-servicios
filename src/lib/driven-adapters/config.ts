import { CONFIG_GATEWAY_TAG } from "@/resources/constants";
import { Context, Layer } from "effect";

export class ConfigGatewayAdapter extends Context.Tag(CONFIG_GATEWAY_TAG)<
	ConfigGatewayAdapter,
	{ 
		readonly supabaseClient: string,
		readonly supabaseSecret: string
	}
>() {} 

export const ConfigGatewayLive = Layer.succeed(
	ConfigGatewayAdapter,
	ConfigGatewayAdapter.of({
		supabaseClient: "https://efyeqqoxwcucppzwhqjo.supabase.co",
		supabaseSecret: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmeWVxcW94d2N1Y3BwendocWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQzNzMwMTcsImV4cCI6MjAzOTk0OTAxN30.-daRHn8w7rmQtwFWKd4jG5eb-K9uODC1jTCeTN2eSrU"
	})
)
