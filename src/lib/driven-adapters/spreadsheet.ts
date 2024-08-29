import { SpreadsheetGatewayAdapter, type SpreadsheetGateway } from "@/domain/gateways/spreadsheet";
import { Effect, Layer } from "effect";
import { utils, writeFileXLSX } from "xlsx";

export const SpreadsheetGatewayLive = Layer.effect(
	SpreadsheetGatewayAdapter,
	Effect.gen(function *(_) {
		const downloadExportJsonToSpreadsheet: SpreadsheetGateway['downloadExportJsonToSpreadsheet'] = (value, fileName) => Effect.sync(() => {
			const ws = utils.json_to_sheet(value);
			const wb = utils.book_new();
			utils.book_append_sheet(wb, ws, "Data");
			writeFileXLSX(wb, `${fileName}.xlsx`);
		})

		return SpreadsheetGatewayAdapter.of({
			downloadExportJsonToSpreadsheet
		})
	})
)
