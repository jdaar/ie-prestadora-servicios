import { Context, type Effect } from "effect";
import { SpreadsheetError } from "@/domain/models/errors/spreasheet-error";
import { SPREADSHEET_GATEWAY_TAG } from "@/resources/constants";

export interface SpreadsheetGateway {
	readonly downloadExportJsonToSpreadsheet: (value: unknown[], fileName: string) => Effect.Effect<void, SpreadsheetError>
};

export class SpreadsheetGatewayAdapter extends Context.Tag(SPREADSHEET_GATEWAY_TAG)<
	SpreadsheetGatewayAdapter,
	SpreadsheetGateway
>() {} 
