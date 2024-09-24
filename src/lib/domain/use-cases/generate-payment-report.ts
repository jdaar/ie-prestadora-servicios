import { Effect } from "effect";
import { SpreadsheetGatewayAdapter } from "../gateways/spreadsheet";
import { GetBillingStatements } from "./get-billing-statements";

export const GeneratePaymentReport = Effect.gen(function *(_) {
	const spreadsheetGateway = yield *_(SpreadsheetGatewayAdapter);
	return yield *_(spreadsheetGateway.downloadExportJsonToSpreadsheet(
		yield *_(GetBillingStatements),
		"Payments"
	));
})
