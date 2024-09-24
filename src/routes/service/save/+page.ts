export const prerender = false;

import type { PageLoad } from "./$types";

export const load: PageLoad = async ({url}) => {
	return {
		serviceId: url.searchParams.get('service-id'),
		personId: url.searchParams.get('person-id')
	};
};
