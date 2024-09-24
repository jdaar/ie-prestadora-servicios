import type { PageLoad } from "./$types";

export const load: PageLoad = async ({url}) => {
	return {
		personId: url.searchParams.get('person-id')
	};
};
