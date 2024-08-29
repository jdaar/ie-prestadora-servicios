import { SPREADSHEET_ERROR_TAG } from "@/resources/constants";
import { Data } from "effect";

export class SpreadsheetError extends Data.TaggedError(SPREADSHEET_ERROR_TAG)<{
	message: string
}> {
	constructor(error: unknown) {
		if (error instanceof Error) {
			super({
				message: `[${error.name}] ${error.message}`
			})
		} else {
			super({
				message: `Unserializable error: ${JSON.stringify(error)}`
			})
		}
	}
}
