import { Effect, Option } from "effect";
import { SpreadsheetGatewayAdapter } from "../gateways/spreadsheet";
import { GetPersonList } from "./get-person-list";

export const GeneratePersonReport = ({
	documentNumber,
	documentType,
	name,
	type
} : {
	documentNumber: Option.Option<string>,
	documentType: Option.Option<string>,
	name: Option.Option<string>,
	type: Option.Option<string>
}) => Effect.gen(function *(_) {
	const spreadsheetGateway = yield *_(SpreadsheetGatewayAdapter);
	return yield *_(spreadsheetGateway.downloadExportJsonToSpreadsheet(
		yield *_(GetPersonList({
			documentNumber,
			documentType,
			name,
			type
		})), "Personas"))
})
