export const prerender = false;
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({url}) => {
	return {
		billingStatementId: url.searchParams.get('billing-statement-id'),
		personId: url.searchParams.get('person-id')
	};
};
