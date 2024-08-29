import type { Entity } from "./entity";

export type Person = Entity<{
	type: 'NATURAL' | 'ARTIFICIAL',
	fullName?: string;
	identityNumber?: string;
	identityType?: 'CC' | 'CE' | 'NIT' | 'PASSPORT';
	risk?: number;
	companyName?: string;
	nit?: string;
}>
